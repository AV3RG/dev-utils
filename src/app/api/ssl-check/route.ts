import { NextRequest, NextResponse } from 'next/server';
import * as tls from 'tls';
import * as crypto from 'crypto';

interface CertificateInfo {
  subject: {
    CN?: string;
    O?: string;
    OU?: string;
    C?: string;
    ST?: string;
    L?: string;
    emailAddress?: string;
  };
  issuer: {
    CN?: string;
    O?: string;
    OU?: string;
    C?: string;
  };
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  serialNumber: string;
  fingerprint: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  certificateChain?: Array<{
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
  }>;
}

function parseCertificate(cert: tls.PeerCertificate): CertificateInfo {
  const now = new Date();
  const validFrom = new Date(cert.valid_from);
  const validTo = new Date(cert.valid_to);
  const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Extract subject - cert.subject is an object in Node.js TLS
  const subject: CertificateInfo['subject'] = {};
  if (cert.subject) {
    const subjectObj = cert.subject as any; // Type assertion for flexibility
    subject.CN = subjectObj.CN;
    subject.O = subjectObj.O;
    subject.OU = subjectObj.OU;
    subject.C = subjectObj.C;
    subject.ST = subjectObj.ST;
    subject.L = subjectObj.L;
    subject.emailAddress = subjectObj.emailAddress;
  }

  // Extract issuer - cert.issuer is an object in Node.js TLS
  const issuer: CertificateInfo['issuer'] = {};
  if (cert.issuer) {
    const issuerObj = cert.issuer as any; // Type assertion for flexibility
    issuer.CN = issuerObj.CN;
    issuer.O = issuerObj.O;
    issuer.OU = issuerObj.OU;
    issuer.C = issuerObj.C;
  }

  // Calculate fingerprint
  // cert.raw is already a Buffer, use it directly
  const fingerprint = crypto.createHash('sha256').update(cert.raw).digest('hex').toUpperCase();
  const formattedFingerprint = fingerprint.match(/.{1,2}/g)?.join(':') || fingerprint;

  return {
    subject,
    issuer,
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    daysRemaining,
    serialNumber: cert.serialNumber || 'N/A',
    fingerprint: formattedFingerprint,
    signatureAlgorithm: (cert as any).signatureAlgorithm || 'N/A',
    publicKeyAlgorithm: (cert as any).pubkey?.algorithm || (cert as any).publicKey?.algorithm || 'N/A',
  };
}

function parseURL(url: string): { hostname: string; port: number } | null {
  try {
    // Add protocol if missing
    let urlToParse = url.trim();
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = `https://${urlToParse}`;
    }

    const urlObj = new URL(urlToParse);
    const hostname = urlObj.hostname;
    const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 80);

    if (!hostname) {
      return null;
    }

    return { hostname, port };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  const parsedUrl = parseURL(url);
  if (!parsedUrl) {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  const { hostname, port } = parsedUrl;

  // Only allow HTTPS connections
  if (port !== 443 && !url.includes('https://')) {
    return NextResponse.json(
      { error: 'SSL certificate checking is only available for HTTPS connections' },
      { status: 400 }
    );
  }

  return new Promise((resolve) => {
    const options: tls.ConnectionOptions = {
      host: hostname,
      port: port,
      rejectUnauthorized: false, // We want to get certificate info even if it's invalid
      servername: hostname, // SNI support
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate(true); // true = get full chain
        const certInfo = parseCertificate(cert);

        // Parse certificate chain if available
        const issuerCert = (cert as any).issuerCertificate;
        if (issuerCert) {
          const chain: CertificateInfo['certificateChain'] = [];
          let currentCert: tls.PeerCertificate | undefined = issuerCert;
          let depth = 0;
          const maxDepth = 10; // Prevent infinite loops

          // Helper function to format subject/issuer as string
          const formatDN = (dn: any): string => {
            if (!dn) return 'N/A';
            if (typeof dn === 'string') return dn;
            if (typeof dn === 'object') {
              const parts: string[] = [];
              if (dn.CN) parts.push(`CN=${dn.CN}`);
              if (dn.O) parts.push(`O=${dn.O}`);
              if (dn.OU) parts.push(`OU=${dn.OU}`);
              if (dn.C) parts.push(`C=${dn.C}`);
              if (dn.ST) parts.push(`ST=${dn.ST}`);
              if (dn.L) parts.push(`L=${dn.L}`);
              return parts.join(', ');
            }
            return 'N/A';
          };

          while (currentCert && depth < maxDepth) {
            chain.push({
              subject: formatDN(currentCert.subject),
              issuer: formatDN(currentCert.issuer),
              validFrom: new Date(currentCert.valid_from).toISOString(),
              validTo: new Date(currentCert.valid_to).toISOString(),
            });

            // Check if this is a self-signed certificate
            const subjectStr = formatDN(currentCert.subject);
            const issuerStr = formatDN(currentCert.issuer);
            if (subjectStr === issuerStr) {
              break;
            }

            currentCert = (currentCert as any).issuerCertificate;
            depth++;
          }

          certInfo.certificateChain = chain;
        }

        socket.end();
        resolve(NextResponse.json({ data: certInfo, error: null }));
      } catch (error) {
        socket.destroy();
        resolve(
          NextResponse.json(
            {
              error: error instanceof Error ? error.message : 'Failed to parse certificate',
            },
            { status: 500 }
          )
        );
      }
    });

    socket.on('error', (error) => {
      socket.destroy();
      let errorMessage = 'Failed to connect to the server';
      
      if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Hostname not found. Please check the URL and try again.';
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. The server may be unreachable.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. The server may not be accepting connections on this port.';
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }

      resolve(
        NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      );
    });

    // Set a timeout for the connection
    socket.setTimeout(10000); // 10 seconds
    socket.on('timeout', () => {
      socket.destroy();
      resolve(
        NextResponse.json(
          { error: 'Connection timeout. The server did not respond in time.' },
          { status: 500 }
        )
      );
    });
  });
}

