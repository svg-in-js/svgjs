## SvgSymbolIcon

svg icon for vue2.x

* 本组件仅仅用来消费 svg-sprite, 并非另一种形式的 inline svg mode；相反，在满足常规 svg 图标组件的基础上，通过脚本的方式预处理图标，大大提高了运行时的效率；

* 颜色设置方案：还是通过脚本预处理的方式将 svg 图标颜色设置变得跟普通的 css 样式一样通用，降低图标颜色控制的复杂度；

* svg-sprite 来源：[svg2js build](https://github.com/svg-in-js/svgjs/blob/main/packages/svg2js/README.md)

### 安装

```js
npm i @svgjs/vue2-symbol-icon

// or

pnpm add @svgjs/vue2-symbol-icon
```

### 初始化

* 优先推荐使用 `vue` 插件的方式对图标组件进行初始化

```js
import Vue from 'vue';
import symbolIconPlugin from '@svgjs/vue2-symbol-icon';

Vue.use(symbolIconPlugin);
```

* 全局配置

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | string | svg-symbol-icon | 组件名称 |
| color | string | -- | 图标的默认颜色 |
| disabledColor | string | -- | 图标被禁用时的颜色 |
| hoverColor | string | -- | 鼠标经过图标时的颜色 |
| activedColor | string | -- | 鼠标点击图标时的颜色 |
| placeholderColor | string | -- | 图标作为占位图时的颜色 |

* 也可以通过自定义组件的方式

```js
import VUe from 'vue';
import { SvgSymbolIcon, setGlobalOption } from '@svgjs/vue2-symbol-icon';

Vue.component('symbol-icon', SvgSymbolIcon);

// 全局设置，这时不支持设置 name
setGlobalOption({
  color,
  disabledColor,
  hoverColor,
  activedColor,
  placeholderColor,
});
```

### 基本用法

```html
<svg-symbol-icon name="name" />
```

* 支持下列 props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | string | -- | 图标的名称，也即 sprite 内的 symbol-id |
| disabled | boolean | fasle | 是否禁用 |
| size | number, string, array | -- | 设置图标的宽高 |
| sizeUnit | string | px | 图标宽高的单位 |
| spin | boolean | false | 是否使用旋转动画 |
| flipV | boolean | false | 是否纵向翻转 |
| flipH | boolean | false | 是否横向翻转 |
| color | string | -- | 设置该图标的颜色，会覆盖全局设置的 color |
| disabledColor | string | -- | 设置该图标禁用时的颜色，会覆盖全局设置的 disabledColor |
| hoverColor | string | -- | 设置鼠标经过时的颜色，会覆盖全局设置的 hoverColor |
| activedColor | string | -- | 设置鼠标按下时的颜色，会覆盖全局设置的 activedColor |
| tooltip | string, object | -- | 设置 tooltip |


> 使用 tooltip 时需要独立引入 tippy 的样式文件：`import 'tippy.js/dist/tippy.css'`

* 事件

| 事件名 | 说明 |
| --- | --- |
| on-click | 点击事件 |