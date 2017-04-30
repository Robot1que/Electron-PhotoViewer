import * as http from "http";
import * as https from "https";
import * as HttpStatus from "http-status-codes";

export class HttpHelper {

    public static async getContent(url: string): Promise<Buffer> {
        let promise = new Promise<Buffer>((resolve, reject) => { 
            let request = https.get(url, (response) => HttpHelper.readBinary(response, resolve, reject));
            request.end();
        });
        return promise;
    }

    public static readBinary(
        res: http.IncomingMessage,
        resolve: (value: Buffer) => void, 
        reject: (reason?: any) => void
    ): void {
        let error = HttpHelper.statusCodeProcess(res.statusCode);
        if (error) {
            reject(error);
        }
        else {
            let data: Buffer[] = [];
            res.on('data', (chunk) => data.push(chunk as Buffer));
            res.on('error', (error) => reject(error));
            res.on('end', () => resolve(Buffer.concat(data)));
        }
    }

    public static readString(
        res: http.IncomingMessage,
        resolve: (value: string) => void, 
        reject: (reason?: any) => void
    ): void {
        let error = HttpHelper.statusCodeProcess(res.statusCode);
        if (error) {
            reject(error);
        }
        else {
            let jsonData: string = "";
            res.setEncoding('utf8');
            res.on('data', (chunk) => { jsonData += chunk; });
            res.on('error', (error) => reject(error));
            res.on('end', () => resolve(jsonData));
        }
    }

    public static statusCodeProcess(statusCode: number | undefined): Error | null {
        let error: Error | null = null;
        
        if (statusCode !== HttpStatus.OK) {
            let statusCodeText = HttpHelper.getStatusCodeText(statusCode);
            error = new Error(`Status code: ${statusCodeText}.`);
        }

        return error;
    }

    public static getStatusCodeText(statusCode: number | undefined): string {
        let text: string;

        if (statusCode) {
            let statusText = HttpStatus.getStatusText(statusCode);
            text = `${ statusCode } (${ statusText })`;
        }
        else {
            text = "unknown";
        }

        return text;
    }

}