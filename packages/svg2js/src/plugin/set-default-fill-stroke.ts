const fillOrStrokeReg = /(?:svg|path|rect|circle|polygon|line|polyline|ellipse)[^>]+?(?:fill|stroke)="[^"]+"/gi;

interface IData {
  data: string;
}

/**
 * 当路径中没有设置 fill 或者 stroke 时，在 svg 标签上设置默认的 fill='currentColor' 和 stroke='currentColor'
 */
export function setDefaultFillStroke<T extends IData>(svgData: T) {
  const colorSets = svgData.data.match(fillOrStrokeReg);

  if (colorSets) return svgData;

  svgData.data = svgData.data.replace(/^(<svg)/, '$1 fill="currentColor" stroke="currentColor"');

  return svgData;
}