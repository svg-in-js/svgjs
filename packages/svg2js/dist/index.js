'use strict';

var utils = require('@all-in-js/utils');
var glob = require('glob');
var svgo = require('svgo');

function createSvgSpriteRuntimeJs(spriteId, svgSymbols, svgXMLNs) {
    const runtimeJs = `document.addEventListener('DOMContentLoaded', function() {
  const svgWrapperEl = document.createElement('div');

  svgWrapperEl.id = '${spriteId}';
  svgWrapperEl.style = 'position: absolute; width: 0; height: 0;';
  svgWrapperEl.setAttribute('aria-hidden', true);
  svgWrapperEl.innerHTML = \`<svg xmlns="${svgXMLNs}">${svgSymbols.join('')}</svg>\`;

  document.body.appendChild(svgWrapperEl);
});
`;
    return runtimeJs;
}

function createPreviewPage(svgSpriteRuntime, svgsData, compressPercentObj) {
    const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview Svgs</title>
      <style>
      html,body,#app {
        height: 100%;
      }
      body {
        overflow: hidden;
        font-size: 12px;
        color: #4b4848;
      }
      #app {
        display: flex;
        flex-direction: column;
      }
      input {
        width: 170px;
        margin-bottom: 10px;
      }
      .main-content {
        flex: 1;
        overflow: auto;
      }
      .svg {
        display: inline-block;
        font-size: 12px;
        text-align: left;
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
      }
      </style>
    </head>
    <body>
      <div id="app">
        <div class="top-bar">
          <input placeholder="查询 svg" />
          <span>共 <b class="total"></b> 个</span>
        </div>
        <div class="main-content">
          <div class="svgs"></div>
        </div>
      </div>
      <script>
        ${svgSpriteRuntime}
      </script>
      <script type="module">
        const svgsData = ${JSON.stringify(svgsData)};
        const compressPercentObj = ${JSON.stringify(compressPercentObj)};
        const svgItem = (filename, data, percent) => {
          return \`<div class="svg">
            <svg style="width: \${data.width}px; height: \${data.height}px"><use xlink:href="#\${filename}"></use></svg>
            <p>\${filename}</p>
            <p>压缩率: \${percent}%</p>
          </div>\`;
        }
    
        const searchSvg = keyword => {
          const svgs = {
            ...svgsData,
          };
          const results = [];
    
          for (const filename in svgs) {
            if (!keyword || (keyword && filename.includes(keyword))) {
              results.push(svgItem(filename, svgs[filename], compressPercentObj[filename]));
            }
          }

          document.querySelector('.svgs').innerHTML = results.join('');
          document.querySelector('.total').innerHTML = results.length;
        }
    
        searchSvg();

        const input = document.querySelector('input');

        input.addEventListener('keyup', (e) => {
          if (e.keyCode === 13) {
            searchSvg(e.target.value);
          }
        });
      </script>
    </body>
    </html>
  `;
    return pageHtml;
}

const svgoPlugins = [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'cleanupIds',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    // 'removeViewBox',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'removeUnusedNS',
    'mergePaths',
    'sortAttrs',
    'sortDefsChildren',
    'removeTitle',
    'removeDesc',
    'prefixIds', // 配合 cleanupIds，在 minify ID 后再加上文件名作为前缀，防止不同文件 ID 重复
];

const matchSvgTag$1 = /<svg[^>]+>/;
const matchWidthReg$1 = /width="(\d+)"\s?/;
const matchHeightReg$1 = /height="(\d+)"\s?/;
const matchViewbox = /viewBox="([\s\d]+)"/;
function collectInfo(svgData) {
    let [svgTag] = svgData.data.match(matchSvgTag$1) || [];
    if (!svgTag) {
        svgTag = '';
    }
    // 保留原始的宽高，作为组件内的默认值
    const [, matchWidth] = svgTag.match(matchWidthReg$1) || [];
    const [, matchHeight] = svgTag.match(matchHeightReg$1) || [];
    let [, viewBox] = svgTag.match(matchViewbox) || [];
    let viewBoxW, viewBoxH;
    if (viewBox) {
        [, , viewBoxW, viewBoxH] = viewBox.split(/\s/);
    }
    if (matchWidth) {
        svgData.width = matchWidth;
    }
    else if (viewBoxW) {
        svgData.width = viewBoxW;
    }
    if (matchHeight) {
        svgData.height = matchHeight;
    }
    else if (viewBoxH) {
        svgData.height = viewBoxH;
    }
    return svgData;
}

const matchSvgTag = /<svg[^>]+>/;
const matchWidthReg = /width="(\d+)"\s?/;
const matchHeightReg = /height="(\d+)"\s?/;
// 移除默认的宽高，便于在使用 svg 时自定义宽高
function removeWidthHeight(svgData) {
    svgData.data = svgData.data.replace(matchSvgTag, svgTagStr => svgTagStr.replace(matchWidthReg, '').replace(matchHeightReg, ''));
    return svgData;
}

const singleColorReg = /<(?:path|rect|circle|polygon|line|polyline|ellipse).+?(?:fill|stroke)="([^"]+)"/gi;
const ignorePathWithUrl = /<(path|rect|circle|polygon|line|polyline|ellipse).+?(fill|stroke)="url\([^"]+\)"/gi;
const matchColor = /([^"]+)"$/;
/**
   * 将单色图标的 fill/stroke 替换为 'currentColor', 便于在使用时直接通过 css 的 color 属性来修改图标颜色
   */
const checkSingleColor = (svgStr) => {
    /**
     * 单色图标:
     * 所有 path|rect|circle|polygon|line|polyline|ellipse 标签上设置的 fill|stroke 的值为同一个值
     */
    const matchElement = svgStr.match(singleColorReg);
    if (!matchElement)
        return [];
    // 忽略 fill/stroke 值为 url 格式的
    if (svgStr.match(ignorePathWithUrl))
        return [];
    const colors = [];
    matchElement.forEach(item => {
        const matchedColor = item.match(matchColor);
        if (matchedColor) {
            colors.push(matchedColor[1]);
        }
    });
    return [...new Set(colors)];
};
// 将单色图标的颜色改为 currentColor, 便于在 css 中修改颜色
function replaceSingleColor(svgData) {
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

/**
 * Object.assign 做合并时，如果传入的值为 undefined 也会替换原有的值
 * 此处兼容不传值或者值为 undefined 时，不做 merge 操作，使用原值
 */
function mergeOption(defaultOption, option) {
    const obj = {};
    for (const key in option) {
        const val = option[key];
        if (val !== undefined) {
            obj[key] = val;
        }
    }
    return {
        ...defaultOption,
        ...obj,
    };
}
function compose(fnArr) {
    if (!fnArr.length)
        return s => s;
    return (svgData) => {
        return fnArr.reduce((cur, fn) => fn.call(null, cur), svgData);
    };
}

const svgXMLNs = 'http://www.w3.org/2000/svg';
const xmlns = `xmlns="${svgXMLNs}"`;
const defaultOption = {
    nameSep: '-',
    spriteId: 'svg_sprite_created_by_svg2js',
    outputFolder: 'svg2js-preview',
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
class Svg2js {
    entryFolder;
    filesMap;
    compressPercentMap;
    option;
    /**
     * @param {string} entryFolder 查找 svg 文件的入口目录
     * @param {string} option.outputFolder 输出目录
     * @param {string} option.nameSep 在包含多层目录时，文件名默认会带上目录层级作为前缀，通过 nameSep 设置目录分隔符
     * @param {function} option.setFileName 自定义文件名
     * @param {string} option.spriteId svgSprite ID
     */
    constructor(entryFolder, option) {
        this.entryFolder = entryFolder || '.';
        this.compressPercentMap = new Map(); // 保存每个 svg 文件的压缩比率
        this.filesMap = new Map(); // 保存所有 svg 的基本信息
        this.option = mergeOption(defaultOption, option || {});
    }
    /**
     * 从指定目录查找出所有的 svg 文件
     */
    findSvg() {
        const { entryFolder } = this;
        let target = utils.resolveCWD(entryFolder);
        if (!utils.fse.existsSync(target)) {
            throw new Error('please set an exists entry folder.');
        }
        if (entryFolder.startsWith('.') || entryFolder.startsWith('/')) {
            throw new Error('please set entry folder start with a folder name.');
        }
        const files = glob.globSync(`${entryFolder}/**/*.svg`);
        return files || [];
    }
    /**
     * 将查找到的所有 svg 使用 svgo 进行优化
     * 通过脚本提取 svg 的宽、高、viewBox等信息
     * 颜色方案设置
     * 提高运行时的效率
     */
    optimizeSvg() {
        const svgFiles = this.findSvg();
        if (!svgFiles?.length)
            return this.filesMap;
        const { entryFolder } = this;
        const { nameSep, setFileName } = this.option;
        svgFiles.forEach(svgFilePath => {
            const svgStr = utils.fse.readFileSync(utils.resolveCWD(svgFilePath), {
                encoding: 'utf-8',
            }).toString();
            let filename = svgFilePath.replace(`${entryFolder}/`, '').replace(/\.svg$/, '');
            if (nameSep !== undefined && !setFileName) {
                filename = filename.replace(/\//g, nameSep);
            }
            else if (typeof setFileName === 'function') {
                filename = setFileName(filename, nameSep);
            }
            let buildSvg = svgo.optimize(svgStr, {
                path: svgFilePath,
                multipass: true,
                plugins: svgoPlugins,
            });
            /**
             * 通过插件机制，支持自定义一些额外的处理
             * example:
             *  const myPlugin = (svgData) => {
             *    svgData.filename = uid(svgData.filename);
             *    return svgData;
             *  }
             */
            buildSvg = this.compose(buildSvg, filename);
            const compressPercent = Math.round((1 - buildSvg.data.length / svgStr.length) * 100);
            this.compressPercentMap.set(filename, compressPercent);
            this.filesMap.set(filename, buildSvg);
        });
        return this.filesMap;
    }
    /**
     * 组合调用插件
     */
    compose(data, filename) {
        return compose([
            collectInfo,
            removeWidthHeight,
            replaceSingleColor,
        ])({
            ...data,
            filename,
        });
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
        const outputFolderPath = utils.resolveCWD(outputFolder || '');
        const outputFile = utils.resolveCWD(outputFolderPath, 'svg-sprite.js');
        utils.fse.ensureDirSync(outputFolderPath);
        utils.fse.writeFileSync(outputFile, svgSpriteJs);
        return outputFile;
    }
    /**
     * 最终产出一个辅助查询和使用的页面
     */
    outputPreviewHtml() {
        const { outputFolder } = this.option;
        const pageHtml = this.createPreviewPage();
        const outputFolderPath = utils.resolveCWD(outputFolder || '');
        const outputFile = utils.resolveCWD(outputFolderPath, 'index.html');
        utils.fse.ensureDirSync(outputFolderPath);
        utils.fse.writeFileSync(outputFile, pageHtml);
        return outputFile;
    }
}
// // 如何去除项目没使用到的

module.exports = Svg2js;
