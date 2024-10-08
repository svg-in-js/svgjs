<template>
  <svg
    class="svg-symbol-icon"
    :class="{
      'svg-not-allowed': disabled,
      'svg-symbol-spin': spin,
      'using-placeholder-style': displayPlaceholder
    }"
    :style="style"
    @click="handleClick">
    <use :xlink:href="`#${name}`" />
    <slot />
  </svg>
</template>
<script>
import tippy from 'tippy.js';

const defaultColorKey = '--svg-symbol-icon-color';
const hoverColorKey = '--svg-symbol-icon-hover-color';
const activedColorKey = '--svg-symbol-icon-actived-color';
const disabledColorKey = '--svg-symbol-icon-disabled-color';

function setRootCssProp(key, value) {
  value && document.documentElement.style.setProperty(key, value);
}

// 设置全局颜色
export function setGlobalOption(option = {}) {
  if (option.color) {
    setRootCssProp(defaultColorKey, option.color);
  }

  if (option.color) {
    // setRootCssProp(hoverColorKey, option.hoverColor);
  }

  if (option.color) {
    // setRootCssProp(activedColorKey, option.activedColor);
  }

  if (option.color) {
    setRootCssProp(disabledColorKey, option.disabledColor);
  }
}

export default {
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
      default: () => 'px',
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
      default: false,
    },
  },
  destroyed() {
    this.destroyTooltip();
  },
  watch: {
    tooltip: {
      handler(tooltip) {
        if (!tooltip) {
          return this.destroyTooltip();
        }

        const { tooltipInstance } = this;
        const tipOption = this.fmtTooltipOption(tooltip);

        if (tooltipInstance) {
          tooltipInstance.setProps(tipOption);
        } else {
          this.tooltipInstance = tippy(this.$el, tipOption);
        }
      }
    },
  },
  data () {
    return {
      tooltipInstance: null,
    }
  },
  computed: {
    style () {
      let arr = []
      const { color, hoverColor, activedColor, disabledColor, disabled, size, sizeUnit } = this;
      const style = {};
      // 设置宽高
      const sizeType = typeof size;

      if (['number', 'string'].includes(sizeType)) {
        arr = [size, size];
      }

      if (Array.isArray(size)) {
        arr = size;
      }

      style.width = `${parseInt(arr[0], 10)}${sizeUnit}`;
      style.height = `${parseInt(arr[1], 10)}${sizeUnit}`;

      // 设置横向翻转
      const flipStyle = [];
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
        // style[hoverColorKey] = hoverColor;
      }

      // 设置鼠标按下时的颜色
      if (activedColor) {
        // style[activedColorKey] = activedColor;
      }

      // 设置禁用时的颜色
      if (disabledColor && disabled) {
        style[disabledColorKey] = disabledColor;
      }

      return style;
    }
  },
  mounted() {
    // 如果设置了 tooltip, 则初始化 tippy
    if (this.tooltip) {
      const tipOption = this.fmtTooltipOption(this.tooltip);

      this.tooltipInstance = tippy(this.$el, tipOption);
    }
  },
  methods: {
    fmtTooltipOption(tooltip) {
      let tipOption = {};
      const agrType = typeof tooltip;

      if (agrType === 'string') {
        tipOption = {
          content: tooltip,
        };
      }

      if (agrType === 'object' && !Array.isArray(tooltip)) {
        tipOption = tooltip;
      }

      return tipOption;
    },
    destroyTooltip() {
      if (this.tooltipInstance) {
        this.tooltipInstance.destroy();
        this.tooltipInstance = null;
      }
    },
    handleClick (e) {
      if (this.disabled) return;

      this.$emit('on-click', e);
    }
  }
}
</script>
<style>
:root {
  --svg-symbol-icon-color: #666666;
  --svg-symbol-icon-hover-color: #666666;
  --svg-symbol-icon-actived-color: #666666;
  --svg-symbol-icon-disabled-color: #c5c8ce;
}

@keyframes svg-symbol-icon-spining {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.svg-symbol-icon {
  display: inline-block;
  outline: none;
  color: var(--svg-symbol-icon-color);
}

.svg-symbol-icon:hover {
  /* scolor: var(--svg-symbol-icon-hover-color); */
}

.svg-symbol-icon:active {
  /* color: var(--svg-symbol-icon-actived-color); */
}

.svg-symbol-spin {
  animation: svg-symbol-icon-spining 1s linear infinite;
}

.svg-not-allowed {
  color: var(--svg-symbol-icon-disabled-color);
  cursor: default;
}

.svg-not-allowed:hover {
  color: var(--svg-symbol-icon-disabled-color);
}

.using-placeholder-style {
  background: #cccccc;
}
</style>
