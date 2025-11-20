"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/shadcn/ui/input";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";
import { AlertCircle, Shield, Lock, Calendar, FileText, Key, CheckCircle2, XCircle } from "lucide-react";
import debounce from "lodash.debounce";
import ClickToCopy from "@/components/commons/ClickToCopy";

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

const CertificateDisplay = ({ data }: { data: CertificateInfo }) => {
  const isValid = data.daysRemaining > 0;
  const isExpiringSoon = data.daysRemaining > 0 && data.daysRemaining <= 30;

  return (
    <div className="space-y-6">
      {/* Validity Status */}
      <div className={`p-4 rounded-lg border ${
        isValid 
          ? isExpiringSoon 
            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
            : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
      }`}>
        <div className="flex items-center gap-2">
          {isValid ? (
            isExpiringSoon ? (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Certificate is valid but expiring soon ({data.daysRemaining} days remaining)
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Certificate is valid ({data.daysRemaining} days remaining)
                </span>
              </>
            )
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-800 dark:text-red-200">
                Certificate has expired ({Math.abs(data.daysRemaining)} days ago)
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Information */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Subject Information
            </h3>
          </div>
          <div className="space-y-2">
            {data.subject.CN && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Common Name (CN)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.subject.CN}
                </span>
              </div>
            )}
            {data.subject.O && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization (O)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.subject.O}
                </span>
              </div>
            )}
            {data.subject.OU && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organizational Unit (OU)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.subject.OU}
                </span>
              </div>
            )}
            {data.subject.C && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country (C)</span>
                <span className="font-medium text-foreground">
                  {data.subject.C}
                </span>
              </div>
            )}
            {data.subject.ST && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">State/Province (ST)</span>
                <span className="font-medium text-foreground">
                  {data.subject.ST}
                </span>
              </div>
            )}
            {data.subject.L && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Locality (L)</span>
                <span className="font-medium text-foreground">
                  {data.subject.L}
                </span>
              </div>
            )}
            {data.subject.emailAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.subject.emailAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Issuer Information */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Issuer Information
            </h3>
          </div>
          <div className="space-y-2">
            {data.issuer.CN && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Common Name (CN)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.issuer.CN}
                </span>
              </div>
            )}
            {data.issuer.O && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization (O)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.issuer.O}
                </span>
              </div>
            )}
            {data.issuer.OU && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organizational Unit (OU)</span>
                <span className="font-medium text-foreground break-all text-right ml-2">
                  {data.issuer.OU}
                </span>
              </div>
            )}
            {data.issuer.C && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country (C)</span>
                <span className="font-medium text-foreground">
                  {data.issuer.C}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Validity Information */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Validity Period
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid From</span>
              <span className="font-medium text-foreground">
                {new Date(data.validFrom).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid To</span>
              <span className="font-medium text-foreground">
                {new Date(data.validTo).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days Remaining</span>
              <span className={`font-medium ${
                data.daysRemaining > 30 
                  ? "text-green-600 dark:text-green-400"
                  : data.daysRemaining > 0
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {data.daysRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Certificate Details
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial Number</span>
              <span className="font-medium text-foreground font-mono text-sm break-all text-right ml-2">
                {data.serialNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fingerprint (SHA-256)</span>
              <span className="font-medium text-foreground font-mono text-xs break-all text-right ml-2">
                {data.fingerprint}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signature Algorithm</span>
              <span className="font-medium text-foreground">
                {data.signatureAlgorithm}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Public Key Algorithm</span>
              <span className="font-medium text-foreground">
                {data.publicKeyAlgorithm}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Chain */}
      {data.certificateChain && data.certificateChain.length > 0 && (
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Certificate Chain ({data.certificateChain.length} certificate{data.certificateChain.length > 1 ? 's' : ''})
            </h3>
          </div>
          <div className="space-y-4">
            {data.certificateChain.map((cert, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-md border border-border"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Certificate {index + 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium text-foreground break-all text-right ml-2 text-sm">
                      {cert.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="font-medium text-foreground break-all text-right ml-2 text-sm">
                      {cert.issuer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid From</span>
                    <span className="font-medium text-foreground text-sm">
                      {new Date(cert.validFrom).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid To</span>
                    <span className="font-medium text-foreground text-sm">
                      {new Date(cert.validTo).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function SSLChecker() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidURL = (url: string) => {
    if (!url.trim()) return false;
    try {
      // Try to parse as URL
      let urlToCheck = url.trim();
      if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
        urlToCheck = `https://${urlToCheck}`;
      }
      const urlObj = new URL(urlToCheck);
      return urlObj.hostname.length > 0;
    } catch {
      return false;
    }
  };

  const fetchCertificateInfo = async (url: string) => {
    if (!url.trim()) {
      return { data: null, error: null };
    }
    try {
      const response = await fetch(`/api/ssl-check?url=${encodeURIComponent(url)}`);
      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch certificate information' };
      }
      
      return { data: result.data, error: null };
    } catch (e) {
      console.error("Error while fetching certificate info:", e);
      return {
        data: null,
        error: "Failed to fetch certificate information. Please check your input and try again.",
      };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkSSL = useCallback(
    debounce(async () => {
      if (!input.trim()) {
        setOutput(null);
        setError("");
        return;
      }

      if (!isValidURL(input)) {
        setError("Invalid URL format. Please enter a valid URL (e.g., example.com or https://example.com)");
        setOutput(null);
        return;
      }

      setLoading(true);
      setError("");
      const { data, error } = await fetchCertificateInfo(input);
      setLoading(false);

      if (error) {
        setError(error);
        setOutput(null);
      } else {
        setOutput(data);
        setError("");
      }
    }, 500),
    [input]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  useEffect(() => {
    if (input) {
      checkSSL();
    } else {
      setOutput(null);
      setError("");
    }
  }, [input, checkSSL]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          SSL Certificate Checker
        </h1>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          {error && (
            <Alert
              variant="destructive"
              className={
                "p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-foreground mb-2"
          >
            URL
          </label>
          <div className="flex items-center justify-between gap-2">
            <Input
              id="url-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter URL (e.g., example.com or https://example.com)"
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              {output && (
                <ClickToCopy
                  toCopySupplier={() => JSON.stringify(output, null, 2)}
                  buttonClassName="px-3"
                  clipboardIconClassName="text-white"
                  buttonText="Copy JSON"
                />
              )}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-foreground mb-2">
            Certificate Information
          </h2>
          <div className="bg-muted p-4 rounded-md overflow-auto min-h-[300px] relative border border-border">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
              </div>
            ) : output ? (
              <>
                <CertificateDisplay data={output} />
              </>
            ) : (
              <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                Enter a URL to check its SSL certificate details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

