import http from 'http';
import https from 'https';

export default class UrlReader {

    protected isBinaryResponse(response: http.IncomingMessage): boolean {
        const contentType = ((response && response.headers && response.headers['content-type']) || '').toLowerCase();
        return /(image|application)\/(jpe?g|gif|png|pdf)/i.test(contentType)
    }

    read(url: string): Promise<any> {
        const module = /^https/i.test(url) ? https : http;
        const start = Date.now();
        return new Promise<any>((resolve, reject) => {
            module
                .get(url, (response: http.IncomingMessage) => {
                    let data = '';

                    if (this.isBinaryResponse(response)) {
                        response.setEncoding('binary');
                    }

                    response.on('end', () => {
                        resolve({
                            url: url,
                            status: response.statusCode,
                            responseTime: Date.now() - start,
                            //contentLength: data.length,
                            contentLength: +(response.headers['content-length'] || data.length),
                        });
                    });

                    response.on('data', (chunk: string) => {
                        data += chunk;
                    });
                })
                .on('error', error => reject(error));
        });
    }

}