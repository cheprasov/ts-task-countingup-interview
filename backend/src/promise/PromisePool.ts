export default class PromisePool<T> {

    private readonly _concurrency: number;
    private readonly _pool: Set<Promise<T>>;

    constructor(concurrency: number) {
        this._concurrency = concurrency;
        this._pool = new Set();
    }

    add(promise: Promise<T>): Promise<void> {
        return this.waitFree().then(() => {
            const poolPromise = promise.finally(() => {
                this._pool.delete(poolPromise);
                console.log('Removed from pool', this._pool.size);
            });
            this._pool.add(poolPromise);
            console.log('Added to pool', this._pool.size);
        });
    }

    waitFree(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._pool.size < this._concurrency) {
                resolve();
                return;
            }
            Promise.any(Array.from(this._pool)).finally(() => {
                resolve();
            });
        });
    }

    waitAll(): Promise<void> {
        return Promise.allSettled(Array.from(this._pool)).then();
    }

}