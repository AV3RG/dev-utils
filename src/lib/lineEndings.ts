export default function detectLineEndings(str: string): string[] {

    const lineEndings: {[key: string]: boolean} = {
        LF: str.includes('\n') && !str.includes('\r\n'),
        CRLF: str.includes('\r\n'),
        CR: str.includes('\r') && !str.includes('\r\n')
    };

    return Object.keys(lineEndings).filter(type => lineEndings[type]);

}
