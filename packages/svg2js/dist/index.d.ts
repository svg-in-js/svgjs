export declare type FilesMap = Map<string, ISvgData>;

export declare interface IOption {
    nameSep?: string;
    spriteId?: string;
    outputFolder?: string;
    plugins?: PluginFn<ISvgData>[];
    setFileName?: (filename: string, nameSep: IOption['nameSep']) => string;
}

export declare interface ISvgData {
    data: string;
    width?: string;
    height?: string;
    filename: string;
}

declare type PluginFn<T> = (data: T) => T;

/**
 * 工具提供以下几个功能：
 * 1. 优化图标
 * 2. 提取图标的关键信息
 * 3. 颜色方案设置
 * 4. 创建 svg-sprite
 * 5. 预览图标
 * 6. 插件机制：自定义处理
 */
declare class Svg2js {
    entryFolder: string;
    filesMap: FilesMap;
    compressPercentMap: Map<string, number>;
    option: IOption;
    /**
     * @param {string} entryFolder 查找 svg 文件的入口目录
     * @param {string} option.outputFolder 输出目录
     * @param {string} option.nameSep 在包含多层目录时，文件名默认会带上目录层级作为前缀，通过 nameSep 设置目录分隔符
     * @param {function} option.setFileName 自定义文件名
     * @param {string} option.spriteId svgSprite ID
     */
    constructor(entryFolder: string, option?: IOption);
    /**
     * 从指定目录查找出所有的 svg 文件
     */
    findSvg(): string[];
    /**
     * 将查找到的所有 svg 使用 svgo 进行优化
     * 通过脚本提取 svg 的宽、高、viewBox等信息
     * 颜色方案设置
     * 提高运行时的效率
     */
    optimizeSvg(): FilesMap;
    addPlugin(plugin: PluginFn<ISvgData>): this;
    /**
     * 组合调用插件
     */
    compose(data: ISvgData): ISvgData;
    /**
     * 生成 svgSprite
     */
    createSvgSymbols(): string[];
    /**
     * 创建 svgSprite runtime
     */
    createBrowserRuntime(): string;
    /**
     * 创建预览 svg 的 html 页面，用于查询和管理图标，便于复制组件代码直接在项目中使用
     */
    createPreviewPage(): string;
    /**
     * 最终产出一个 svgSprite runtime
     */
    outputSpriteJS(): string;
    /**
     * 最终产出一个辅助查询和使用的页面
     */
    outputPreviewHtml(): string;
}
export default Svg2js;

export { }
