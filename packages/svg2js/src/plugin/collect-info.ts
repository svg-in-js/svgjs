const matchSvgTag = /<svg[^>]+>/;
const matchWidthReg = /width="(\d+)"\s?/;
const matchHeightReg = /height="(\d+)"\s?/;
const matchViewbox = /viewBox="([\s\d]+)"/;

interface IData {
  data: string;
  width?: string | number;
  height?: string | number;
}

export function collectInfo<T extends IData>(svgData: T): T {
  let [svgTag] = svgData.data.match(matchSvgTag) || [];

  if (!svgTag) {
    svgTag = '';
  }

  // 保留原始的宽高，作为组件内的默认值
  const [, matchWidth] = svgTag.match(matchWidthReg) || [];
  const [, matchHeight] = svgTag.match(matchHeightReg) || [];
  let [, viewBox] = svgTag.match(matchViewbox) || [];
  let viewBoxW, viewBoxH;

  if (viewBox) {
    [,, viewBoxW, viewBoxH] = viewBox.split(/\s/);
  }

  if (matchWidth) {
    svgData.width = matchWidth;
  } else if (viewBoxW) {
    svgData.width = viewBoxW;
  }

  if (matchHeight) {
    svgData.height = matchHeight;
  } else if (viewBoxH) {
    svgData.height = viewBoxH;
  }

  return svgData;
}