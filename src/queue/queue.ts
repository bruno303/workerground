import QueueItem from "./queueItem";

interface QueueOptions {
    max: number;
}

export default class Queue {

    private _opts: QueueOptions;
    private _max: number;
    private _queue: Array<QueueItem>;

    constructor(opts: QueueOptions) {
        this._max = opts?.max ?? 10;
        this._opts = opts ?? { max: this._max };
        this._queue = new Array();
    }

    add(queueItem: QueueItem): string {
        if (this._queue.length < this._max) {
            this._queue.push(queueItem);
            return "";
        }

        return "full";
    }

    remove(queueItem: QueueItem): void {
        const index = this._queue.indexOf(queueItem);
        if (index !== -1) {
            this._queue.splice(index, 1);
        }
    }

    getNext(): QueueItem {
        let next: QueueItem = null;
        if (this._queue.length > 0) {
            next = this._queue.shift();
        }
        return next;
    }

    clearQueue(): void {
        if (this._queue.length > 0) {
            this._queue.splice(0, this._queue.length);
        }
    }

    getSize(): number {
        return this._queue.length;
    };
}
