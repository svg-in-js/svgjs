interface IObject {
  [key: string]: any;
}

/**
 * Object.assign 做合并时，如果传入的值为 undefined 也会替换原有的值
 * 此处兼容不传值或者值为 undefined 时，不做 merge 操作，使用原值
 */
export function mergeOption(defaultOption: IObject, option: IObject) {
  const obj: IObject = {};

  for (const key in option) {
    const val = option[key];
    if (val !== undefined) {
      obj[key] = val;
    }
  }

  return {
    ...defaultOption,
    ...obj,
  }
}

export type PluginFn<T> = (data: T) => T;

export function compose<T>(fnArr: PluginFn<T>[]): PluginFn<T> {
  if (!fnArr.length) return s => s;

  return (svgData: T): T => {
    return fnArr.reduce((cur, fn) => fn.call(null, cur), svgData);
  }
}