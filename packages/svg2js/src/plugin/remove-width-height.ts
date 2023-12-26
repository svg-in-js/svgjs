const matchSvgTag = /<svg[^>]+>/;
const matchWidthReg = /width="(\d+)"\s?/;
const matchHeightReg = /height="(\d+)"\s?/;

interface IData {
  data: string;
}
// 移除默认的宽高，便于在使用 svg 时自定义宽高
export function removeWidthHeight<T extends IData>(svgData: T): T {
  svgData.data = svgData.data.replace(matchSvgTag, svgTagStr => svgTagStr.replace(matchWidthReg, '').replace(matchHeightReg, ''));

  return svgData;
}