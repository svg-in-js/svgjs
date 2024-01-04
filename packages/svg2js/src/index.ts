import { fse, resolveCWD } from '@all-in-js/utils';
import { globSync } from 'glob';
import { optimize } from 'svgo';
import { createSvgSpriteRuntimeJs } from './template/svg-sprite-runtime';
import { createPreviewPage } from './template/preview-page';
import { svgoPlugins } from './svgo-plugins';
import { collectInfo } from './plugin/collect-info';
import { removeWidthHeight } from './plugin/remove-width-height';
import { replaceSingleColor } from './plugin/replace-single-color';
import { compose, mergeOption, PluginFn } from './util';

export interface ISvgData {
  data: string;
  width?: string;
  height?: string;
  filename: string;
}

export type FilesMap = Map<string, ISvgData>;

export interface IOption {
  nameSep?: string;
  spriteId?: string;
  outputFolder?: string;
  plugins?: PluginFn<ISvgData>[],
  setFileName?: (filename: string, nameSep: IOption['nameSep']) => string;
}

const svgXMLNs = 'http://www.w3.org/2000/svg';
const xmlns = `xmlns="${svgXMLNs}"`;
const defaultOption: IOption = {
  nameSep: '-',
  spriteId: 'svg_sprite_created_by_svg2js',
  outputFolder: 'svg2js-preview',
  plugins: [],
  setFileName(defaultFileName, nameSep) {
    return defaultFileName.replace(/\//g, nameSep || '');
  },
};

/**
 * 工具提供以下几个功能：
 * 1. 优化图标
 * 2. 提取图标的关键信息
 * 3. 颜色方案设置
 * 4. 创建 svg-sprite
 * 5. 预览图标
 * 6. 插件机制：自定义处理
 */
export default class Svg2js {
  entryFolder: string
  filesMap: FilesMap
  compressPercentMap: Map<string, number>
  option: IOption
  /**
   * @param {string} entryFolder 查找 svg 文件的入口目录
   * @param {string} option.outputFolder 输出目录
   * @param {string} option.nameSep 在包含多层目录时，文件名默认会带上目录层级作为前缀，通过 nameSep 设置目录分隔符
   * @param {function} option.setFileName 自定义文件名
   * @param {string} option.spriteId svgSprite ID
   */
  constructor(entryFolder: string, option?: IOption) {
    this.entryFolder = entryFolder || '.';
    this.compressPercentMap = new Map(); // 保存每个 svg 文件的压缩比率
    this.filesMap = new Map(); // 保存所有 svg 的基本信息
    this.option = mergeOption(defaultOption, option || {});
  }
  /**
   * 从指定目录查找出所有的 svg 文件
   */
  findSvg(): string[] {
    const { entryFolder } = this;
  
    let target = resolveCWD(entryFolder);
  
    if (!fse.existsSync(target)) {
      throw new Error('please set an exists entry folder.');
    }
  
    if (entryFolder.startsWith('.') || entryFolder.startsWith('/') || entryFolder.startsWith('\\')) {
      throw new Error('please set entry folder start with a folder name.');
    }
  
    const files = globSync(`${entryFolder}/**/*.svg`);
  
    return files || [];
  }
  /**
   * 将查找到的所有 svg 使用 svgo 进行优化
   * 通过脚本提取 svg 的宽、高、viewBox等信息
   * 颜色方案设置
   * 提高运行时的效率
   */
  optimizeSvg(): FilesMap {
    const svgFiles = this.findSvg();

    if (!svgFiles?.length) return this.filesMap;

    const { entryFolder } = this;
    const { nameSep, setFileName } = this.option;

    svgFiles.forEach(svgFilePath => {
      const svgStr = fse.readFileSync(
        resolveCWD(svgFilePath),
        {
          encoding: 'utf-8',
        }
      ).toString();
      let filename = svgFilePath.replace(`${entryFolder}/`, '').replace(/\.svg$/, '');

      if (nameSep !== undefined && !setFileName) {
        filename = filename.replace(/\//g, nameSep);
      } else if (typeof setFileName === 'function') {
        filename = setFileName(filename, nameSep);
      }
      
      const buildOutput = optimize(svgStr, {
        path: svgFilePath,
        multipass: true,
        plugins: svgoPlugins,
      });

      let buildSvg = {
        ...buildOutput,
        filename,
      };

      /**
       * 通过插件机制，支持自定义一些额外的处理
       * example:
       *  const myPlugin = (svgData) => {
       *    svgData.filename = uid(svgData.filename);
       *    return svgData;
       *  }
       */
      buildSvg = this.compose(buildSvg);

      const compressPercent = Math.round((1 - buildSvg.data.length / svgStr.length) * 100);
  
      this.compressPercentMap.set(buildSvg.filename, compressPercent);
      this.filesMap.set(buildSvg.filename, buildSvg);
    });

    return this.filesMap;
  }
  addPlugin(plugin: PluginFn<ISvgData>) {
    if (Array.isArray(this.option.plugins)) {
      this.option.plugins.push(plugin);
    }

    return this;
  }
  /**
   * 组合调用插件
   */
  compose(data: ISvgData): ISvgData {
    const { plugins = [] } = this.option;

    return compose<ISvgData>([
      collectInfo,
      removeWidthHeight,
      replaceSingleColor,
      ...plugins,
    ])(data);
  }
  /**
   * 生成 svgSprite
   */
  createSvgSymbols() {
    const { filesMap } = this;
    const svgSymbols = [];

    for (const [filename, svgData] of filesMap) {
      const svgSymbol = svgData.data.replace('<svg', `<symbol id="${filename}"`).replace('</svg>', '</symbol>').replace(xmlns, '');

      svgSymbols.push(svgSymbol);
    }

    return svgSymbols;
  }
  /**
   * 创建 svgSprite runtime
   */
  createBrowserRuntime() {
    const { spriteId } = this.option;
    const svgSymbols = this.createSvgSymbols();
    
    return createSvgSpriteRuntimeJs(spriteId, svgSymbols, svgXMLNs);
  }
  /**
   * 创建预览 svg 的 html 页面，用于查询和管理图标，便于复制组件代码直接在项目中使用
   */
  createPreviewPage() {
    const svgData = Object.fromEntries(this.filesMap);
    const compressPercentObj = Object.fromEntries(this.compressPercentMap);
    const svgSpriteRuntime = this.createBrowserRuntime();

    return createPreviewPage(svgSpriteRuntime, svgData, compressPercentObj);
  }
  /**
   * 最终产出一个 svgSprite runtime
   */
  outputSpriteJS() {
    const { outputFolder } = this.option;
    const svgSpriteJs = this.createBrowserRuntime();
    const outputFolderPath = resolveCWD(outputFolder || '');
    const outputFile = resolveCWD(outputFolderPath, 'svg-sprite.js');

    fse.ensureDirSync(outputFolderPath);
    fse.writeFileSync(outputFile, svgSpriteJs);

    return outputFile;
  }
  /**
   * 最终产出一个辅助查询和使用的页面
   */
  outputPreviewHtml() {
    const { outputFolder } = this.option;
    const pageHtml = this.createPreviewPage();
    const outputFolderPath = resolveCWD(outputFolder || '');
    const outputFile = resolveCWD(outputFolderPath, 'index.html');

    fse.ensureDirSync(outputFolderPath);
    fse.writeFileSync(outputFile, pageHtml);

    return outputFile;
  }
}

// // 如何去除项目没使用到的
