const singleColorReg = /<(?:path|rect|circle|polygon|line|polyline|ellipse).+?(?:fill|stroke)="([^"]+)"/gi;
const ignorePathWithUrl = /<(path|rect|circle|polygon|line|polyline|ellipse).+?(fill|stroke)="url\([^"]+\)"/gi;
const matchColor = /([^"]+)"$/;

interface IData {
  data: string;
}

/**
   * 将单色图标的 fill/stroke 替换为 'currentColor', 便于在使用时直接通过 css 的 color 属性来修改图标颜色
   */
export const checkSingleColor = (svgStr: string): string[] => {
  /**
   * 单色图标: 
   * 所有 path|rect|circle|polygon|line|polyline|ellipse 标签上设置的 fill|stroke 的值为同一个值
   */
  const matchElement: string[] | null = svgStr.match(singleColorReg);

  if (!matchElement) return [];

  // 忽略 fill/stroke 值为 url 格式的
  if (svgStr.match(ignorePathWithUrl)) return [];

  const colors: string[] = [];
  
  matchElement.forEach(item => {
    const matchedColor = item.match(matchColor);

    if (matchedColor) {
      colors.push(matchedColor[1]);
    }
  });

  return [...new Set(colors)];
}

// 将单色图标的颜色改为 currentColor, 便于在 css 中修改颜色
export function replaceSingleColor<T extends IData>(svgData: T) {
  const [singleColor, secondColor] = checkSingleColor(svgData.data);

  if (singleColor && !secondColor) {
    svgData.data = svgData.data.replace(singleColorReg, (str, color) => {
      if (color === singleColor) {
        return str.replace(matchColor, 'currentColor"'); 
      }

      return str;
    });
  }

  return svgData;
}
