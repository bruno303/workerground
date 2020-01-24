import BackgroundWorker from './backgroundWorker';
import Queue from '../queue/queue';
import WorkerResult from './workerResult';

export default class Workers {

    private _queue: Queue = null;
    private _workers: Array<BackgroundWorker>;

    constructor(queue: Queue) {
        this._queue = queue;
        this._workers = new Array();
    }

    getSize(): number {
        return this._workers.length;
    }

    remove(backgroundWorker: BackgroundWorker) {
        const index = this._workers.indexOf(backgroundWorker);
        if (index > -1) {
            this._workers.splice(index, 1);
        }
    }

    createWorker(method: string, args: Array<any>, callback: (workerResult: WorkerResult) => void) {
        const worker: BackgroundWorker = new BackgroundWorker(this._queue, exitCode => this.remove(worker));
        this._workers.push(worker);
        worker.run(method, args, callback);
    }

    getFreeWorker(): BackgroundWorker | null | undefined {
        let workerFree: BackgroundWorker | undefined;
        let i = 0;

        while (i < this._workers.length && workerFree === undefined) {
            if (!this._workers[i].getBusy()) {
                workerFree = this._workers[i];
            }
            i++;
        }
        return workerFree;
    }

    terminateAll() {
        try {
            this._workers.forEach(w => w.terminate());
            this._workers.splice(0, this._workers.length);
        } catch (err) {
            throw err;
        }
    }
}