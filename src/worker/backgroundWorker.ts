import { Worker } from "worker_threads";
import Queue from '../queue/queue';
import WorkerResult from "./workerResult";
import QueueItem from "../queue/queueItem";
import { join } from 'path';

interface WorkerMessage {
    method: string;
    args: Array<any>;
}

class BackgroundWorker {

    private _worker: Worker;
    private _busy = false;
    private callback: (workerResult: WorkerResult) => void = null;
    private callbackExit: (exitCode: number) => void = null;
    private lastStartDate: Date;
    private method: string;
    private args: Array<any>;
    private _queue: Queue;

    constructor(queue: Queue, callbackExit: (exitCode: number) => void) {
        this._queue = queue;
        this._worker = new Worker(join(__dirname, 'workerThreadExecutor.js'));
        this.callbackExit = callbackExit;
        this.clearVars();
        this.configureWorker();
    }

    configureWorker() {
        this._worker.on("message", (obj: WorkerResult) => {
            this.clearVars();
            this.callback(obj);
            this.processNext();
        });

        this._worker.on("error", (err: Error) => {
            this.clearVars();
            this.callback({ error: err, result: null });
            this.processNext();
        });

        this._worker.on("exit", (exitCode: number) => {
            this.callbackExit(exitCode);
        });
    }

    run(method: string, args: Array<any>, callback: (workerResult: WorkerResult) => void) {
        this._busy = true;
        this.callback = callback;
        this.method = method;
        this.lastStartDate = new Date();
        this.args = args;
        this.postMessage({ method: this.method, args: this.args });
    }

    postMessage(message: WorkerMessage) {
        this._worker.postMessage(message);
    }

    clearVars() {
        this._busy = false;
        this.lastStartDate = null;
        this.method = null;
        this.args = null;
    }

    terminate() {
        this._worker.terminate();
    }

    processNext() {
        const next: QueueItem = this._queue.getNext();
        if (next !== null && next !== undefined) {
            this.run(next.method, next.args, next.callback);
        }
    }

    getBusy(): boolean {
        return this._busy;
    }
}

export default BackgroundWorker;