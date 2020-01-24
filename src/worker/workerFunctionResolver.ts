const evaluate: (x: string) => any = eval;

export default function resolve (method: any): Function {
  let func: Function = null;
  try {
    func = evaluate(`(${method})`);
  } catch (err) { }
  return func;
}
