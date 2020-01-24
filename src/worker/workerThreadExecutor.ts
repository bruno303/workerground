import { Worker, parentPort } from "worker_threads";
import WorkerResult from "./workerResult";
import functionResolver from "./workerFunctionResolver";
// import functionResolver from "./workerFunctionResolver";

parentPort.on("message", obj => {
  let workerResult: WorkerResult = { error: null, result: null };

  try {
    let func = functionResolver(obj.method);

    if (func === null || func === undefined) {
      workerResult.error = new Error(`Method is invalid (${obj.method})`);
    }

    if (!workerResult.error) {
      workerResult.result = func(...obj.args);
    }
  } catch (e) {
    workerResult.error = e;
  }

  parentPort.postMessage(workerResult);
});