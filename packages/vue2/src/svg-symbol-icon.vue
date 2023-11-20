<template>
  <svg
    class="svg-symbol-icon"
    :class="{
      'not-allowed': disabled,
      'svg-symbol-spin': spin,
    }"
    :style="style"
    @click="handleClick">
    <use :link:href="`#${name}`" />
    <slot />
  </svg>
</template>
<script>
export default {
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
     * 是否旋转
     */
    spin: Boolean,
    /**
     * 设置宽和高度的单位
     */
    sizeUnit: {
      type: String,
      default: () => 'px',
    },
  },
  components: {
    
  },
  mixins: [],
  data() {
    return {
      
    }
  },
  computed: {
    style() {
      let arr = [];
      const { size, sizeUnit } = this;
      const style = {};
      const sizeType = typeof size;

      if (['number', 'string'].includes(sizeType)) {
        arr = [size, size];
      }

      if (Array.isArray(sizeType)) {
        arr = size;
      }

      style.width = `${parseInt(arr[0], 10)}${sizeUnit}`;
      style.height = `${parseInt(arr[1], 10)}${sizeUnit}`;

      return style;
    },
  },
  watch: {
    
  },
  mounted() {
    
  },
  methods: {
    handleClick(e) {
      this.$emit('click', e);
    },
  }
};
</script>
<style lang='less' scoped>
@keyframes spining {
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
  fill: currentColor;
  &.svg-symbol-spin {
    animation: spining 1s linear infinite;
  }
  &.not-allowed {
    color: #c5c8ce;
    cursor: default;
    &:hover {
      color: #c5c8ce;
    }
  }
}
</style>