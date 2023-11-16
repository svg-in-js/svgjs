import { fse, log, resolveCWD } from '@all-in-js/utils';
import { globSync } from 'glob';
import { optimize } from 'svgo';

const matchWidthReg = /width="(\d+)"\s/;
const matchHeightReg = /height="(\d+)"\s/;
const xmlns = 'xmlns="http://www.w3.org/2000/svg"';
const defaultOption = {
  nameSep: '-',
  spriteId: 'svg_sprite_created_by_svg2js',
  setFileName(defaultFileName, nameSep) {
    return defaultFileName.replace(/\//g, nameSep);
  },
};

/**
 * 将指定目录中所有的 svg 文件转换成一个包含 svg 内容的 json 文件
 */
export default class Svg2js {
  /**
   * @param {string} entryFolder 查找 svg 文件的入口目录
   * @param {string} option.nameSep 在包含多层目录时，文件名默认会带上目录层级作为前缀，通过 nameSep 设置目录分隔符
   * @param {function} option.setFileName 自定义文件名
   */
  constructor(entryFolder, option) {
    this.entryFolder = entryFolder || '.';
    this.compressPercentMap = new Map();
    this.filesMap = new Map();
    this.option = option || defaultOption;
  }
  /**
   * 从指定目录查找出所有的 svg 文件
   */
  findSvg() {
    const { entryFolder } = this;
  
    let target = resolveCWD(entryFolder);
  
    if (!fse.existsSync(target)) {
      return log.error('please set an exists entry folder.');
    }
  
    if (entryFolder.startsWith('.') || entryFolder.startsWith('/')) {
      return log.error('please set entry folder start with a folder name.');
    }
  
    const files = globSync(`${entryFolder}/**/*.svg`);
  
    return files || [];
  }
  /**
   * 将查找到的所有 svg 使用 svgo 进行压缩，并生成 json 文件
   */
  optimizeSvg() {
    const svgFiles = this.findSvg();

    if (!svgFiles?.length) return [];

    const { entryFolder } = this;
    const { nameSep, setFileName } = this.option;

    svgFiles.forEach(svgFilePath => {
      const svgStr = fse.readFileSync(resolveCWD(svgFilePath)).toString();
      let filename = svgFilePath.replace(`${entryFolder}/`, '').replace(/\.svg$/, '');

      if (nameSep && !setFileName) {
        filename = filename.replace(/\//g, nameSep);
      } else if (setFileName) {
        filename = setFileName(filename, nameSep);
      }
      
      const buildSvg = optimize(svgStr, {
        multipass: true,
      });

      // 保留原始的宽高，作为组件内的默认值
      const [, matchWidth] = buildSvg.data.match(matchWidthReg) || [];
      const [, matchHeight] = buildSvg.data.match(matchHeightReg) || [];
      
      if (matchWidth) {
        buildSvg.width = matchWidth;
      }

      if (matchHeight) {
        buildSvg.height = matchHeight;
      }

      // 移除默认的宽高，便于使用中自定义宽高
      buildSvg.data = buildSvg.data.replace(matchWidthReg, '').replace(matchHeightReg, '');

      const compressPercent = Math.round((1 - buildSvg.data.length / svgStr.length) * 100);
  
      this.compressPercentMap.set(filename, compressPercent);
      this.filesMap.set(filename, buildSvg);
    });

    return this.filesMap;
  }
  /**
   * 生成 svgSprite
   */
  createSvgSprite() {
    const { filesMap } = this;
    const { spriteId } = this.option;
    const svgSymbols = [`<svg id="${spriteId}" style="display:none;" ${xmlns}>`];

    for (const [filename, svgData] of filesMap) {
      const svgSymbol = svgData.data.replace('<svg', `<symbol id="${filename}"`).replace('</svg>', '</symbol>').replace(xmlns, '');

      svgSymbols.push(svgSymbol);
    }

    svgSymbols.push('</svg>');

    return svgSymbols;
  }
}

(async () => {
  const svg2js = new Svg2js('src/assets');

  const files = svg2js.optimizeSvg();

  console.log(files);

  fse.writeFileSync(resolveCWD('a.svg'), svg2js.createSvgSprite().join(''));
})();
