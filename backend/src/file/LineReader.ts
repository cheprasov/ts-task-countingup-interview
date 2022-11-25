import fs from 'fs';

export default class LineReader {

    private readonly _filename: string;
    private readonly _bufferLength: number;
    private readonly _buffer: Buffer;
    private _fileDescriptor: number | null = null;
    private _position: number = 0;
    private _isEOF: boolean = false;

    constructor(filename: string, bufferCount = 64) {
        this._filename = filename;
        this._bufferLength = Math.max(bufferCount, 1);
        this._buffer = Buffer.alloc(this._bufferLength);
    }

    close() {
        if (this._fileDescriptor !== null) {
            fs.closeSync(this._fileDescriptor);
            this._fileDescriptor = null;
        }
    }

    private getFileDescriptor(): number {
        if (this._fileDescriptor === null) {
            this._fileDescriptor = fs.openSync(this._filename, 'r' );
        }
        return this._fileDescriptor;
    }

    private copyBuffer(buffer: Buffer, length: number): Buffer {
        const newBuffer = Buffer.alloc(length);
        buffer.copy(newBuffer, 0, 0, length);
        return newBuffer;
    }

    isEOF(): boolean {
        return this._isEOF;
    }

    readLine(): string | null {
        if (this._isEOF) {
            return null;
        }

        const fd = this.getFileDescriptor();
        const buffers: Buffer[] = [];

        while (true) {
            const bytesLength = fs.readSync(fd, this._buffer, 0, this._bufferLength, this._position);
            if (bytesLength === 0) {
                // EOF
                this._isEOF = true;
                break;
            }

            const pos = this._buffer.indexOf('\n', 0, 'utf8');
            if (pos === -1) {
                buffers.push(this.copyBuffer(this._buffer, bytesLength));
                this._position += this._buffer.length;
            } else {
                buffers.push(this.copyBuffer(this._buffer, pos));
                this._position += pos + 1;
                break;
            }
        }

        if (this._isEOF) {
            this.close();
            if (buffers.length === 0) {
                return null;
            }
        }
        return Buffer.concat(buffers).toString('utf8');
    }

    readNotEmptyLine(): string | null {
        while (true) {
            if (this._isEOF) {
                return null;
            }
            const line = this.readLine();
            if (line) {
                return line;
            }
        }
    }

}
