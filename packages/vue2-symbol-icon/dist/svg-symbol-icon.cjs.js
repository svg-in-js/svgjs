'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: 'SvgSymbolIcon',
  props: {
    name: String,
    /**
     * 是否禁用
     */
    disabled: Boolean,
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
     * 禁用试的颜色
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
  data: function data() {
    return {};
  },
  computed: {
    style: function style() {
      var arr = [];
      var size = this.size,
        sizeUnit = this.sizeUnit;
      var style = {};
      var sizeType = _typeof(size);
      if (['number', 'string'].includes(sizeType)) {
        arr = [size, size];
      }
      if (Array.isArray(sizeType)) {
        arr = size;
      }
      style.width = "".concat(parseInt(arr[0], 10)).concat(sizeUnit);
      style.height = "".concat(parseInt(arr[1], 10)).concat(sizeUnit);

      // 设置 flip
      var flipStyle = [];
      if (this.flipH) {
        flipStyle.push('scaleX(-1)');
      }
      if (this.flipV) {
        flipStyle.push('scaleY(-1)');
      }
      if (flipStyle.length) {
        style.transform = flipStyle.join(' ');
      }
      return style;
    }
  },
  methods: {
    handleClick: function handleClick(e) {
      if (this.disabled) return;
      this.$emit('click', e);
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
    inject("data-v-b265450c_0", { source: "\n@keyframes spining-data-v-b265450c {\n0% {\n    transform: rotate(0deg);\n}\n50% {\n    transform: rotate(180deg);\n}\n100% {\n    transform: rotate(360deg);\n}\n}\n.svg-symbol-icon[data-v-b265450c] {\n  display: inline-block;\n  fill: currentColor;\n}\n.svg-symbol-spin[data-v-b265450c] {\n  animation: spining-data-v-b265450c 1s linear infinite;\n}\n.svg-not-allowed[data-v-b265450c] {\n  color: #c5c8ce;\n  cursor: default;\n}\n.svg-not-allowed[data-v-b265450c]:hover {\n  color: #c5c8ce;\n}\n.using-placeholder-style[data-v-b265450c] {\n  background: #ccc;\n}\n", map: {"version":3,"sources":["/Users/hufeng/workspace/svgjs/packages/vue2-symbol-icon/src/svg-symbol-icon.vue"],"names":[],"mappings":";AAyHA;AACA;IACA,uBAAA;AACA;AACA;IACA,yBAAA;AACA;AACA;IACA,yBAAA;AACA;AACA;AAEA;EACA,qBAAA;EACA,kBAAA;AACA;AAEA;EACA,qDAAA;AACA;AAEA;EACA,cAAA;EACA,eAAA;AACA;AAEA;EACA,cAAA;AACA;AAEA;EACA,gBAAA;AACA","file":"svg-symbol-icon.vue","sourcesContent":["<template>\n  <svg\n    class=\"svg-symbol-icon\"\n    :class=\"{\n      'svg-not-allowed': disabled,\n      'svg-symbol-spin': spin,\n      'using-placeholder-style': displayPlaceholder\n    }\"\n    :style=\"style\"\n    @click=\"handleClick\">\n    <use :xlink:href=\"`#${name}`\" />\n    <slot />\n  </svg>\n</template>\n<script>\nexport default {\n  name: 'SvgSymbolIcon',\n  props: {\n    name: String,\n    /**\n     * 是否禁用\n     */\n    disabled: Boolean,\n    tooltip: [String, Object],\n    /**\n     * 1. 传入一个数字，则宽高相等\n     * 2. 传入一个字符串，最终会调 parseInt 转为数字，如果需要带上单位，可设置 sizeUnit\n     * 3. 传入一个数组，分别设置宽和高，每一项同样可为数字或者字符串\n     */\n    size: [Number, String, Array],\n    /**\n     * 设置宽和高度的单位\n     */\n    sizeUnit: {\n      type: String,\n      default: () => 'px'\n    },\n    /**\n     * 是否使用旋转动画\n     */\n    spin: Boolean,\n    /**\n     * 纵向翻转\n     */\n    flipV: Boolean,\n    /**\n     * 横向翻转\n     */\n    flipH: Boolean,\n    /**\n     * 默认颜色\n     */\n    color: String,\n    /**\n     * 禁用试的颜色\n     */\n    disabledColor: String,\n    /**\n     * hover 时的颜色\n     */\n    hoverColor: String,\n    /**\n     * actived 的颜色\n     */\n    activedColor: String,\n    /**\n     * 是否使用占位样式\n     */\n    displayPlaceholder: {\n      type: Boolean,\n      default: false\n    }\n  },\n  data () {\n    return {}\n  },\n  computed: {\n    style () {\n      let arr = []\n      const { size, sizeUnit } = this\n      const style = {}\n      const sizeType = typeof size\n\n      if (['number', 'string'].includes(sizeType)) {\n        arr = [size, size]\n      }\n\n      if (Array.isArray(sizeType)) {\n        arr = size\n      }\n\n      style.width = `${parseInt(arr[0], 10)}${sizeUnit}`\n      style.height = `${parseInt(arr[1], 10)}${sizeUnit}`\n\n      // 设置 flip\n      const flipStyle = []\n      if (this.flipH) {\n        flipStyle.push('scaleX(-1)')\n      }\n\n      if (this.flipV) {\n        flipStyle.push('scaleY(-1)')\n      }\n\n      if (flipStyle.length) {\n        style.transform = flipStyle.join(' ')\n      }\n\n      return style\n    }\n  },\n  methods: {\n    handleClick (e) {\n      if (this.disabled) return\n\n      this.$emit('click', e)\n    }\n  }\n}\n</script>\n<style scoped>\n@keyframes spining {\n  0% {\n    transform: rotate(0deg);\n  }\n  50% {\n    transform: rotate(180deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.svg-symbol-icon {\n  display: inline-block;\n  fill: currentColor;\n}\n\n.svg-symbol-spin {\n  animation: spining 1s linear infinite;\n}\n\n.svg-not-allowed {\n  color: #c5c8ce;\n  cursor: default;\n}\n\n.svg-not-allowed:hover {\n  color: #c5c8ce;\n}\n\n.using-placeholder-style {\n  background: #ccc;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-b265450c";
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

var index = {
  install: function install(Vue, option) {
    Vue.component(option.name || 'SvgSymbolIcon', __vue_component__);
  }
};

exports.SvgSymbolIcon = __vue_component__;
exports["default"] = index;
