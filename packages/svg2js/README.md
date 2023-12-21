## Svg2Js

* 是什么？

一个用来处理项目中 svg 图标的命令行脚本

* 做什么？

优化和管理项目中的 svg 图标：

1. 通过命令的方式优化 svg 图标并生成一个 svgSprite
2. 随时预览项目中的 svg 图标，统一管理

* 好处？

1. no build、no config，无构建时的相关配置，比如 svg-sprite-loader
2. 可在需要时执行一个命令即可将项目中的 svg 图标进行优化处理，一般可大大降低文件体积
3. 随时预览和管理项目中所有的图标
4. 组件化 svg 图标
5. 通过脚本的方式，提前优化图标、提取关键信息、颜色处理等，避免 inline svg 模式下在运行时做这些处理，可提高运行效率

## Usage

可全局安装即可使用 svg2js 命令，也可以直接使用 npx @svgjs/cli 临时使用，不过更推荐安装在项目里，在 scripts 里配置一个相对固定的命令，在日常开发中可随时使用

### Install

```js
npm i -D @svgjs/cli
```

### SvgSprite

在 package.json 的 scripts 里添加一个命令，如:

```js
{
  "build:svg": "svg2js build -e src/assets -o src/js"
}
```

将 src/assets 目录下的 svg 图标进行优化处理后生成一个 svg-sprite.js 文件到 src/js 目录下，后续需求迭代如果对图标有进行增删改的操作，同样执行这个命令即可

### SvgPreview

在 package.json 的 scripts 里添加一个命令，如:

```js
{
  "preview:svg": "svg2js preview -e src/assets -o src/js"
}
```

将 src/assets 目录下的 svg 图标进行优化处理后生成一个 html 页面，打开即可预览项目中的所有图标，项目中图标文件较多时比较方便找图标

## 预处理：运行时提效

1. 类似于 vue template 在 compile 时会进行一些代码的优化处理，提高 vue 代码的运行效率一样，咱们通过脚本的方式可对项目的 svg 图标全部进行优化处理，将大大缩小文件体积；

2. 相较于 inline svg 会对 svg 内容进行一些处理来达到一些效果，通过脚本的方式的好处是，可以在此时提取一些 svg 的关键信息，比如宽、高、viewBox等，作为元信息在运行时直接取值即可；

3. svg 图标的颜色处理一般都稍显复杂，默认颜色、激活时颜色、禁用时颜色等，平时我们在项目开发时可能就是定义一个 class 往里面找到 svg 的 path 节点来改颜色，现在有个便捷的方式就是，在脚本里就提取单色图标的颜色值存为元信息，并替换为 currentColor，那么改图标颜色就跟普通的 css 一样操作了，非常方便；当然，inline svg 也完全可以处理，但是假如你的项目中有大量的使用 svg 图标，其运行效率明显低于脚本处理；