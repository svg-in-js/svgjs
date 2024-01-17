<template>
  <svg
    ref="svgEl"
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

<script lang="ts">
const defaultColorKey = '--svg-symbol-icon-color';
const hoverColorKey = '--svg-symbol-icon-hover-color';
const activedColorKey = '--svg-symbol-icon-actived-color';
const disabledColorKey = '--svg-symbol-icon-disabled-color';
const defaultProps = {
  sizeUnit: 'px',
};

function setRootCssProp(key, value) {
  value && document.documentElement.style.setProperty(key, value);
}

interface IGlobalOption {
  color?: string
  hoverColor?: string
  activedColor?: string
  disabledColor?: string
}

// 设置全局颜色
export function setGlobalOption(option?: IGlobalOption) {
  if (!option) return;

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
</script>

<script setup lang="ts">
import { computed, defineProps, defineExpose, defineEmits, ref, reactive, watch, withDefaults, onUnmounted, onMounted } from 'vue';
import tippy, { Instance, Props } from 'tippy.js';

interface IProps {
  /**
   * svg sprite 内的 symbol 的 ID
   * 来源 1：在项目内导入通过 svg2js 生成的 svg-sprite，如果存在多级目录，默认会带上目录名，可以使用 svg2js preview [option] 来预览图标，在页面上拷贝图标的名称
   * 来源 2：兼容项目中现存的 svg-sprite，传入 symbol ID 即可
   */
  name: string
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 支持使用 tippy.js 来为图标提供丰富的 tooltip 效果
   * 默认不对其进行初始化
   */
  tooltip?: string | object
  /**
   * 1. 传入一个数字，则宽高相等
   * 2. 传入一个字符串，最终会调 parseInt 转为数字，如果需要带上单位，可设置 sizeUnit
   * 3. 传入一个数组，分别设置宽和高，每一项同样可为数字或者字符串
   */
  size?: number | string | Array<number | string>
  /**
   * 设置宽和高度的单位
   */
  sizeUnit?: string
  /**
   * 是否使用旋转动画
   */
  spin?: boolean
  /**
   * 纵向翻转
   */
  flipV?: boolean
  /**
   * 横向翻转
   */
  flipH?: boolean
  /**
   * 默认颜色
   */
  color?: string
  /**
   * 禁用时的颜色
   */
  disabledColor?: string
  /**
   * hover 时的颜色
   */
  hoverColor?: string
  /**
   * actived 的颜色
   */
  activedColor?: string
  /**
   * 是否使用占位样式
   */
  displayPlaceholder?: boolean
}

interface IComputedStyle {
  width?: string
  height?: string
  transform?: string
  '--svg-symbol-icon-color'?: string
  '--svg-symbol-icon-hover-color'?: string
  '--svg-symbol-icon-actived-color'?: string
  '--svg-symbol-icon-disabled-color'?: string
}

const svgEl = ref<Element>();
const tooltipInstance = ref<Instance<Props>>();
const props = withDefaults(defineProps<IProps>(), defaultProps);
const emit = defineEmits<{
  (e: 'on-click', value: MouseEvent): void
}>();

function handleClick (e: MouseEvent) {
  if (props.disabled) return;

  emit('on-click', e);
}

function destroyTooltip() {
  if (tooltipInstance.value) {
    tooltipInstance.value.destroy();
    tooltipInstance.value = null;
  }
}

function fmtTooltipOption(tooltip) {
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
}

watch(
  () => props.tooltip,
  tooltip => {
    if (!tooltip) {
      return destroyTooltip();
    }

    const tipOption = fmtTooltipOption(tooltip);

    if (tooltipInstance.value) {
      tooltipInstance.value.setProps(tipOption);
    } else {
      tooltipInstance.value = tippy(svgEl.value, tipOption);
    }
  }
);

const style = computed(() => {
  let arr: Array<string | number> = [];
  const { color, hoverColor, activedColor, disabledColor, disabled, flipH, flipV, size, sizeUnit } = props;
  const style: IComputedStyle = {};
  // 设置宽高
  const sizeType = typeof size;

  if (['number', 'string'].includes(sizeType)) {
    arr = [size as string | number, size as string | number];
  }

  if (Array.isArray(size)) {
    arr = size as Array<string | number>;
  }

  style.width = `${parseInt(arr[0] as string, 10)}${sizeUnit}`;
  style.height = `${parseInt(arr[1] as string, 10)}${sizeUnit}`;

  // 设置横向翻转
  const flipStyle = [];
  if (flipH) {
    flipStyle.push('scaleX(-1)');
  }

  // 设置纵向翻转
  if (flipV) {
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
});

onMounted(() => {
  // 如果设置了 tooltip, 则初始化 tippy
  if (props.tooltip) {
    const tipOption = fmtTooltipOption(props.tooltip);

    tooltipInstance.value = tippy(svgEl.value, tipOption);
  }
});

onUnmounted(() => {
  destroyTooltip();
});
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
  color: var(--svg-symbol-icon-hover-color);
}

.svg-symbol-icon:active {
  color: var(--svg-symbol-icon-actived-color);
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
