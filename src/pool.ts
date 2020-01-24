import Workers from './worker/workers';
import WorkerResult from './worker/workerResult';
import Queue from './queue/queue';
import PoolOptions from './poolOptions';
import { cpus } from 'os';

declare type callbackFunctionType = (workerResult: WorkerResult) => void;

export class Pool {

    private _workers: Workers;
    private _opts: PoolOptions;
    private _queue: Queue;

    constructor(opts?: PoolOptions) {
        this._opts = opts;
        this._opts.max = this._opts.max || cpus().length;
        this._opts.queueMax = this._opts.queueMax || 10;

        this._queue = new Queue({ max: this._opts.queueMax });
        this._workers = new Workers(this._queue);
    }

    getSize() {
        return this._workers.getSize();
    }

    enqueue(method: string, ...args: Array<any>): Promise<any> {

        return new Promise((resolve, reject) => {


            const callbackFunction: callbackFunctionType = (workerResult) => {
                if (workerResult.error) {
                    reject(workerResult.error);
                } else {
                    resolve(workerResult.result);
                }
            }

            try {
                const workerFree = this._workers.getFreeWorker();

                if (workerFree !== undefined) {
                    workerFree.run(method.toString(), args, callbackFunction);

                } else if (this.getSize() < this._opts.max) {
                    this._workers.createWorker(method.toString(), args, callbackFunction);

                } else {
                    this.allocate(method.toString(), args, callbackFunction);
                }

            } catch (err) {

                const workerResult: WorkerResult = { error: new Error(err.message), result: null };
                reject(workerResult.error);

            }
        });
    }

    allocate(method: string, args: Array<any>, callback: callbackFunctionType) {
        let queueAddResult = this._queue.add({ method, args, callback });

        if (queueAddResult !== "") {
            callback({ error: new Error(queueAddResult), result: null });
        }
    }

    finishPool(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this._queue.clearQueue();
                this._workers.terminateAll();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default Pool;