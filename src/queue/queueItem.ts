import WorkerResult from "../worker/workerResult";

export default interface QueueItem {
    method: string;
    args: Array<any>;
    callback: (workerResult: WorkerResult) => void;
}