'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tippy = require('tippy.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var tippy__default = /*#__PURE__*/_interopDefaultLegacy(tippy);

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

var defaultColorKey = '--svg-symbol-icon-color';
var hoverColorKey = '--svg-symbol-icon-hover-color';
var activedColorKey = '--svg-symbol-icon-actived-color';
var disabledColorKey = '--svg-symbol-icon-disabled-color';
function setRootCssProp(key, value) {
  value && document.documentElement.style.setProperty(key, value);
}

// 设置全局颜色
function setGlobalOption() {
  var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (option.color) {
    setRootCssProp(defaultColorKey, option.color);
  }
  if (option.color) {
    setRootCssProp(hoverColorKey, option.hoverColor);
  }
  if (option.color) {
    setRootCssProp(activedColorKey, option.activedColor);
  }
  if (option.color) {
    setRootCssProp(disabledColorKey, option.disabledColor);
  }
}
var script = {
  name: 'SvgSymbolIcon',
  props: {
    /**
     * svg sprite 内的 symbol 的 ID
     * 来源 1：在项目内导入通过 svg2js 生成的 svg-sprite，如果存在多级目录，默认会带上目录名，可以使用 svg2js preview [option] 来预览图标，在页面上拷贝图标的名称
     * 来源 2：兼容项目中现存的 svg-sprite，传入 symbol ID 即可
     */
    name: String,
    /**
     * 是否禁用
     */
    disabled: Boolean,
    /**
     * 支持使用 tippy.js 来为图标提供丰富的 tooltip 效果
     * 默认不对其进行初始化
     */
    tooltip: [String, Object],
    /**
     * 1. 传入一个数字，则宽高相等
     * 2. 传入一个字符串，最终会调 parseInt 转为数字，如果需要带上单位，可设置 sizeUnit
     * 3. 传入一个数组，分别设置宽和高，每一项同样可为数字或者字符串
     */
    size: [Number, String, Array],
    /**
     * 设置宽和高度的单位
     */
    sizeUnit: {
      type: String,
      default: function _default() {
        return 'px';
      }
    },
    /**
     * 是否使用旋转动画
     */
    spin: Boolean,
    /**
     * 纵向翻转
     */
    flipV: Boolean,
    /**
     * 横向翻转
     */
    flipH: Boolean,
    /**
     * 默认颜色
     */
    color: String,
    /**
     * 禁用时的颜色
     */
    disabledColor: String,
    /**
     * hover 时的颜色
     */
    hoverColor: String,
    /**
     * actived 的颜色
     */
    activedColor: String,
    /**
     * 是否使用占位样式
     */
    displayPlaceholder: {
      type: Boolean,
      default: false
    }
  },
  destroyed: function destroyed() {
    this.destroyTooltip();
  },
  watch: {
    tooltip: {
      handler: function handler(tooltip) {
        if (!tooltip) {
          return this.destroyTooltip();
        }
        var tooltipInstance = this.tooltipInstance;
        var tipOption = this.fmtTooltipOption(tooltip);
        if (tooltipInstance) {
          tooltipInstance.setProps(tipOption);
        } else {
          this.tooltipInstance = tippy__default["default"](this.$el, tipOption);
        }
      }
    }
  },
  data: function data() {
    return {
      tooltipInstance: null
    };
  },
  computed: {
    style: function style() {
      var arr = [];
      var color = this.color,
        hoverColor = this.hoverColor,
        activedColor = this.activedColor,
        disabledColor = this.disabledColor,
        disabled = this.disabled,
        size = this.size,
        sizeUnit = this.sizeUnit;
      var style = {};
      // 设置宽高
      var sizeType = _typeof(size);
      if (['number', 'string'].includes(sizeType)) {
        arr = [size, size];
      }
      if (Array.isArray(size)) {
        arr = size;
      }
      style.width = "".concat(parseInt(arr[0], 10)).concat(sizeUnit);
      style.height = "".concat(parseInt(arr[1], 10)).concat(sizeUnit);

      // 设置横向翻转
      var flipStyle = [];
      if (this.flipH) {
        flipStyle.push('scaleX(-1)');
      }

      // 设置纵向翻转
      if (this.flipV) {
        flipStyle.push('scaleY(-1)');
      }
      if (flipStyle.length) {
        style.transform = flipStyle.join(' ');
      }

      // 设置默认颜色
      if (color) {
        style[defaultColorKey] = color;
      }

      // 设置鼠标 hover 时的颜色
      if (hoverColor) {
        style[hoverColorKey] = hoverColor;
      }

      // 设置鼠标按下时的颜色
      if (activedColor) {
        style[activedColorKey] = activedColor;
      }

      // 设置禁用时的颜色
      if (disabledColor && disabled) {
        style[disabledColorKey] = disabledColor;
      }
      return style;
    }
  },
  mounted: function mounted() {
    // 如果设置了 tooltip, 则初始化 tippy
    if (this.tooltip) {
      var tipOption = this.fmtTooltipOption(this.tooltip);
      this.tooltipInstance = tippy__default["default"](this.$el, tipOption);
    }
  },
  methods: {
    fmtTooltipOption: function fmtTooltipOption(tooltip) {
      var tipOption = {};
      var agrType = _typeof(tooltip);
      if (agrType === 'string') {
        tipOption = {
          content: tooltip
        };
      }
      if (agrType === 'object' && !Array.isArray(tooltip)) {
        tipOption = tooltip;
      }
      return tipOption;
    },
    destroyTooltip: function destroyTooltip() {
      if (this.tooltipInstance) {
        this.tooltipInstance.destroy();
        this.tooltipInstance = null;
      }
    },
    handleClick: function handleClick(e) {
      if (this.disabled) return;
      this.$emit('on-click', e);
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  }
  // Vue.extend constructor export interop.
  var options = typeof script === 'function' ? script.options : script;
  // render functions
  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true;
    // functional template
    if (isFunctionalTemplate) {
      options.functional = true;
    }
  }
  // scopedId
  if (scopeId) {
    options._scopeId = scopeId;
  }
  var hook;
  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context ||
      // cached call
      this.$vnode && this.$vnode.ssrContext ||
      // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      }
      // inject component styles
      if (style) {
        style.call(this, createInjectorSSR(context));
      }
      // register component module identifier for async chunk inference
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    };
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function (context) {
      style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }
  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }
  return script;
}

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });
  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;
    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
      // http://stackoverflow.com/a/26603875
      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }
    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      if (HEAD === undefined) {
        HEAD = document.head || document.getElementsByTagName('head')[0];
      }
      HEAD.appendChild(style.element);
    }
    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      staticClass: "svg-symbol-icon",
      class: {
        "svg-not-allowed": _vm.disabled,
        "svg-symbol-spin": _vm.spin,
        "using-placeholder-style": _vm.displayPlaceholder
      },
      style: _vm.style,
      on: { click: _vm.handleClick }
    },
    [
      _c("use", { attrs: { "xlink:href": "#" + _vm.name } }),
      _vm._v(" "),
      _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-0121ce1e_0", { source: "\n:root {\n  --svg-symbol-icon-color: #666666;\n  --svg-symbol-icon-hover-color: #666666;\n  --svg-symbol-icon-actived-color: #666666;\n  --svg-symbol-icon-disabled-color: #c5c8ce;\n}\n@keyframes svg-symbol-icon-spining {\n0% {\n    transform: rotate(0deg);\n}\n50% {\n    transform: rotate(180deg);\n}\n100% {\n    transform: rotate(360deg);\n}\n}\n.svg-symbol-icon {\n  display: inline-block;\n  outline: none;\n  color: var(--svg-symbol-icon-color);\n}\n.svg-symbol-icon:hover {\n  color: var(--svg-symbol-icon-hover-color);\n}\n.svg-symbol-icon:active {\n  color: var(--svg-symbol-icon-actived-color);\n}\n.svg-symbol-spin {\n  animation: svg-symbol-icon-spining 1s linear infinite;\n}\n.svg-not-allowed {\n  color: var(--svg-symbol-icon-disabled-color);\n  cursor: default;\n}\n.svg-not-allowed:hover {\n  color: var(--svg-symbol-icon-disabled-color);\n}\n.using-placeholder-style {\n  background: #cccccc;\n}\n", map: {"version":3,"sources":["/Users/hufeng/workspace/svgjs/packages/vue2-symbol-icon/src/svg-symbol-icon.vue"],"names":[],"mappings":";AA2OA;EACA,gCAAA;EACA,sCAAA;EACA,wCAAA;EACA,yCAAA;AACA;AAEA;AACA;IACA,uBAAA;AACA;AACA;IACA,yBAAA;AACA;AACA;IACA,yBAAA;AACA;AACA;AAEA;EACA,qBAAA;EACA,aAAA;EACA,mCAAA;AACA;AAEA;EACA,yCAAA;AACA;AAEA;EACA,2CAAA;AACA;AAEA;EACA,qDAAA;AACA;AAEA;EACA,4CAAA;EACA,eAAA;AACA;AAEA;EACA,4CAAA;AACA;AAEA;EACA,mBAAA;AACA","file":"svg-symbol-icon.vue","sourcesContent":["<template>\n  <svg\n    class=\"svg-symbol-icon\"\n    :class=\"{\n      'svg-not-allowed': disabled,\n      'svg-symbol-spin': spin,\n      'using-placeholder-style': displayPlaceholder\n    }\"\n    :style=\"style\"\n    @click=\"handleClick\">\n    <use :xlink:href=\"`#${name}`\" />\n    <slot />\n  </svg>\n</template>\n<script>\nimport tippy from 'tippy.js';\n\nconst defaultColorKey = '--svg-symbol-icon-color';\nconst hoverColorKey = '--svg-symbol-icon-hover-color';\nconst activedColorKey = '--svg-symbol-icon-actived-color';\nconst disabledColorKey = '--svg-symbol-icon-disabled-color';\n\nfunction setRootCssProp(key, value) {\n  value && document.documentElement.style.setProperty(key, value);\n}\n\n// 设置全局颜色\nexport function setGlobalOption(option = {}) {\n  if (option.color) {\n    setRootCssProp(defaultColorKey, option.color);\n  }\n\n  if (option.color) {\n    setRootCssProp(hoverColorKey, option.hoverColor);\n  }\n\n  if (option.color) {\n    setRootCssProp(activedColorKey, option.activedColor);\n  }\n\n  if (option.color) {\n    setRootCssProp(disabledColorKey, option.disabledColor);\n  }\n}\n\nexport default {\n  name: 'SvgSymbolIcon',\n  props: {\n    /**\n     * svg sprite 内的 symbol 的 ID\n     * 来源 1：在项目内导入通过 svg2js 生成的 svg-sprite，如果存在多级目录，默认会带上目录名，可以使用 svg2js preview [option] 来预览图标，在页面上拷贝图标的名称\n     * 来源 2：兼容项目中现存的 svg-sprite，传入 symbol ID 即可\n     */\n    name: String,\n    /**\n     * 是否禁用\n     */\n    disabled: Boolean,\n    /**\n     * 支持使用 tippy.js 来为图标提供丰富的 tooltip 效果\n     * 默认不对其进行初始化\n     */\n    tooltip: [String, Object],\n    /**\n     * 1. 传入一个数字，则宽高相等\n     * 2. 传入一个字符串，最终会调 parseInt 转为数字，如果需要带上单位，可设置 sizeUnit\n     * 3. 传入一个数组，分别设置宽和高，每一项同样可为数字或者字符串\n     */\n    size: [Number, String, Array],\n    /**\n     * 设置宽和高度的单位\n     */\n    sizeUnit: {\n      type: String,\n      default: () => 'px',\n    },\n    /**\n     * 是否使用旋转动画\n     */\n    spin: Boolean,\n    /**\n     * 纵向翻转\n     */\n    flipV: Boolean,\n    /**\n     * 横向翻转\n     */\n    flipH: Boolean,\n    /**\n     * 默认颜色\n     */\n    color: String,\n    /**\n     * 禁用时的颜色\n     */\n    disabledColor: String,\n    /**\n     * hover 时的颜色\n     */\n    hoverColor: String,\n    /**\n     * actived 的颜色\n     */\n    activedColor: String,\n    /**\n     * 是否使用占位样式\n     */\n    displayPlaceholder: {\n      type: Boolean,\n      default: false,\n    },\n  },\n  destroyed() {\n    this.destroyTooltip();\n  },\n  watch: {\n    tooltip: {\n      handler(tooltip) {\n        if (!tooltip) {\n          return this.destroyTooltip();\n        }\n\n        const { tooltipInstance } = this;\n        const tipOption = this.fmtTooltipOption(tooltip);\n\n        if (tooltipInstance) {\n          tooltipInstance.setProps(tipOption);\n        } else {\n          this.tooltipInstance = tippy(this.$el, tipOption);\n        }\n      }\n    },\n  },\n  data () {\n    return {\n      tooltipInstance: null,\n    }\n  },\n  computed: {\n    style () {\n      let arr = []\n      const { color, hoverColor, activedColor, disabledColor, disabled, size, sizeUnit } = this;\n      const style = {};\n      // 设置宽高\n      const sizeType = typeof size;\n\n      if (['number', 'string'].includes(sizeType)) {\n        arr = [size, size];\n      }\n\n      if (Array.isArray(size)) {\n        arr = size;\n      }\n\n      style.width = `${parseInt(arr[0], 10)}${sizeUnit}`;\n      style.height = `${parseInt(arr[1], 10)}${sizeUnit}`;\n\n      // 设置横向翻转\n      const flipStyle = [];\n      if (this.flipH) {\n        flipStyle.push('scaleX(-1)');\n      }\n\n      // 设置纵向翻转\n      if (this.flipV) {\n        flipStyle.push('scaleY(-1)');\n      }\n\n      if (flipStyle.length) {\n        style.transform = flipStyle.join(' ');\n      }\n\n      // 设置默认颜色\n      if (color) {\n        style[defaultColorKey] = color;\n      }\n\n      // 设置鼠标 hover 时的颜色\n      if (hoverColor) {\n        style[hoverColorKey] = hoverColor;\n      }\n\n      // 设置鼠标按下时的颜色\n      if (activedColor) {\n        style[activedColorKey] = activedColor;\n      }\n\n      // 设置禁用时的颜色\n      if (disabledColor && disabled) {\n        style[disabledColorKey] = disabledColor;\n      }\n\n      return style;\n    }\n  },\n  mounted() {\n    // 如果设置了 tooltip, 则初始化 tippy\n    if (this.tooltip) {\n      const tipOption = this.fmtTooltipOption(this.tooltip);\n\n      this.tooltipInstance = tippy(this.$el, tipOption);\n    }\n  },\n  methods: {\n    fmtTooltipOption(tooltip) {\n      let tipOption = {};\n      const agrType = typeof tooltip;\n\n      if (agrType === 'string') {\n        tipOption = {\n          content: tooltip,\n        };\n      }\n\n      if (agrType === 'object' && !Array.isArray(tooltip)) {\n        tipOption = tooltip;\n      }\n\n      return tipOption;\n    },\n    destroyTooltip() {\n      if (this.tooltipInstance) {\n        this.tooltipInstance.destroy();\n        this.tooltipInstance = null;\n      }\n    },\n    handleClick (e) {\n      if (this.disabled) return;\n\n      this.$emit('on-click', e);\n    }\n  }\n}\n</script>\n<style>\n:root {\n  --svg-symbol-icon-color: #666666;\n  --svg-symbol-icon-hover-color: #666666;\n  --svg-symbol-icon-actived-color: #666666;\n  --svg-symbol-icon-disabled-color: #c5c8ce;\n}\n\n@keyframes svg-symbol-icon-spining {\n  0% {\n    transform: rotate(0deg);\n  }\n  50% {\n    transform: rotate(180deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.svg-symbol-icon {\n  display: inline-block;\n  outline: none;\n  color: var(--svg-symbol-icon-color);\n}\n\n.svg-symbol-icon:hover {\n  color: var(--svg-symbol-icon-hover-color);\n}\n\n.svg-symbol-icon:active {\n  color: var(--svg-symbol-icon-actived-color);\n}\n\n.svg-symbol-spin {\n  animation: svg-symbol-icon-spining 1s linear infinite;\n}\n\n.svg-not-allowed {\n  color: var(--svg-symbol-icon-disabled-color);\n  cursor: default;\n}\n\n.svg-not-allowed:hover {\n  color: var(--svg-symbol-icon-disabled-color);\n}\n\n.using-placeholder-style {\n  background: #cccccc;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

var install = function install(Vue) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (install.installed) return;
  install.installed = true;

  // 全局设置
  setGlobalOption({
    color: option.color,
    disabledColor: option.disabledColor,
    hoverColor: option.hoverColor,
    activedColor: option.activedColor,
    placeholderColor: option.placeholderColor
  });
  Vue.component(option.name || 'SymbolIcon', __vue_component__);
};
var index = {
  install: install
};

exports.SvgSymbolIcon = __vue_component__;
exports["default"] = index;
exports.setGlobalOption = setGlobalOption;
