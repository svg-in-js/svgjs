'use strict';

var glob = require('glob');
var svgo = require('svgo');
var utils = require('@all-in-js/utils');

function createSvgSpriteRuntimeJs(spriteId, svgSymbols, svgXMLNs) {
    const runtimeJs = `
    document.addEventListener('DOMContentLoaded', function() {
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
    </head>
    <body>
      <div id="app">
        <input placeholder="查询 svg" />
        <div class="svgs"></div>
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
    
          return results;
        }
    
        document.querySelector('.svgs').innerHTML = searchSvg().join('');
      </script>
    </body>
    </html>
  `;
    return pageHtml;
}

const matchWidthReg = /width="(\d+)"\s?/;
const matchHeightReg = /height="(\d+)"\s?/;
const matchViewbox = /viewBox="([\s\d]+)"/;
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
 * 通过脚本的方式，将项目中的 svg 文件进行压缩优化并生成一个 svg sprite
 */
class Svg2js {
    entryFolder;
    filesMap;
    compressPercentMap;
    option;
    /**
     * @param {string} entryFolder 查找 svg 文件的入口目录
     * @param {string} option.nameSep 在包含多层目录时，文件名默认会带上目录层级作为前缀，通过 nameSep 设置目录分隔符
     * @param {function} option.setFileName 自定义文件名
     * @param {string} option.spriteId svgSprite ID
     */
    constructor(entryFolder, option) {
        this.entryFolder = entryFolder || '.';
        this.compressPercentMap = new Map(); // 保存每个 svg 文件的压缩比率
        this.filesMap = new Map(); // 保存所有 svg 的基本信息
        this.option = {
            ...defaultOption,
            ...(option || {}),
        };
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
     * 将查找到的所有 svg 使用 svgo 进行压缩
     * 通过脚本提取 svg 的宽、高、viewBox、颜色值等信息，而不用在运行时做处理，提高运行时的效率
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
            const buildSvg = svgo.optimize(svgStr, {
                multipass: true,
            });
            // 保留原始的宽高，作为组件内的默认值
            const [, matchWidth] = buildSvg.data.match(matchWidthReg) || [];
            const [, matchHeight] = buildSvg.data.match(matchHeightReg) || [];
            let [, viewBox] = buildSvg.data.match(matchViewbox) || [];
            let viewBoxW, viewBoxH;
            if (viewBox) {
                [, , viewBoxW, viewBoxH] = viewBox.split(/\s/);
            }
            if (matchWidth) {
                buildSvg.width = matchWidth;
            }
            else if (viewBoxW) {
                buildSvg.width = viewBoxW;
            }
            if (matchHeight) {
                buildSvg.height = matchHeight;
            }
            else if (viewBoxH) {
                buildSvg.height = viewBoxH;
            }
            // 移除默认的宽高，便于在使用 svg 时自定义宽高
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
        const outputFile = utils.resolveCWD(outputFolderPath, 'svg-preview.html');
        utils.fse.ensureDirSync(outputFolderPath);
        utils.fse.writeFileSync(outputFile, pageHtml);
        return outputFile;
    }
}
// // 如何去除项目没使用到的
// (async () => {
//   const svg2js = new Svg2js('src/assets', {
//     outputFolder: 'static/svg2js',
//   });
//   svg2js.optimizeSvg();
//   // svg2js.output();
// })();

module.exports = Svg2js;
