import { defineComponent, mergeDefaults, ref, watch, computed, onMounted, onUnmounted, openBlock, createElementBlock, normalizeClass, normalizeStyle, createElementVNode, renderSlot } from 'vue';
import tippy from 'tippy.js';

const _hoisted_1 = ["xlink:href"];
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
// 设置全局颜色
function setGlobalOption(option) {
    if (!option)
        return;
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
var script = /*#__PURE__*/ defineComponent({
    __name: 'symbol-icon',
    props: /*#__PURE__*/ mergeDefaults({
        name: { type: String, required: true },
        disabled: { type: Boolean, required: false },
        tooltip: { type: [String, Object], required: false },
        size: { type: [Number, String, Array], required: false },
        sizeUnit: { type: String, required: false },
        spin: { type: Boolean, required: false },
        flipV: { type: Boolean, required: false },
        flipH: { type: Boolean, required: false },
        color: { type: String, required: false },
        disabledColor: { type: String, required: false },
        hoverColor: { type: String, required: false },
        activedColor: { type: String, required: false },
        displayPlaceholder: { type: Boolean, required: false }
    }, defaultProps),
    emits: ["on-click"],
    setup(__props, { emit: __emit }) {
        const svgEl = ref();
        const tooltipInstance = ref();
        const props = __props;
        const emit = __emit;
        function handleClick(e) {
            if (props.disabled)
                return;
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
        watch(() => props.tooltip, tooltip => {
            if (!tooltip) {
                return destroyTooltip();
            }
            const tipOption = fmtTooltipOption(tooltip);
            if (tooltipInstance.value) {
                tooltipInstance.value.setProps(tipOption);
            }
            else {
                tooltipInstance.value = tippy(svgEl.value, tipOption);
            }
        });
        const style = computed(() => {
            let arr = [];
            const { color, hoverColor, activedColor, disabledColor, disabled, flipH, flipV, size, sizeUnit } = props;
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
        return (_ctx, _cache) => {
            return (openBlock(), createElementBlock("svg", {
                ref_key: "svgEl",
                ref: svgEl,
                class: normalizeClass(["svg-symbol-icon", {
                        'svg-not-allowed': _ctx.disabled,
                        'svg-symbol-spin': _ctx.spin,
                        'using-placeholder-style': _ctx.displayPlaceholder
                    }]),
                style: normalizeStyle(style.value),
                onClick: handleClick
            }, [
                createElementVNode("use", {
                    "xlink:href": `#${_ctx.name}`
                }, null, 8 /* PROPS */, _hoisted_1),
                renderSlot(_ctx.$slots, "default")
            ], 6 /* CLASS, STYLE */));
        };
    }
});

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "\n:root {\n  --svg-symbol-icon-color: #666666;\n  --svg-symbol-icon-hover-color: #666666;\n  --svg-symbol-icon-actived-color: #666666;\n  --svg-symbol-icon-disabled-color: #c5c8ce;\n}\n@keyframes svg-symbol-icon-spining {\n0% {\n    transform: rotate(0deg);\n}\n50% {\n    transform: rotate(180deg);\n}\n100% {\n    transform: rotate(360deg);\n}\n}\n.svg-symbol-icon {\n  display: inline-block;\n  outline: none;\n  color: var(--svg-symbol-icon-color);\n}\n.svg-symbol-icon:hover {\n  color: var(--svg-symbol-icon-hover-color);\n}\n.svg-symbol-icon:active {\n  color: var(--svg-symbol-icon-actived-color);\n}\n.svg-symbol-spin {\n  animation: svg-symbol-icon-spining 1s linear infinite;\n}\n.svg-not-allowed {\n  color: var(--svg-symbol-icon-disabled-color);\n  cursor: default;\n}\n.svg-not-allowed:hover {\n  color: var(--svg-symbol-icon-disabled-color);\n}\n.using-placeholder-style {\n  background: #cccccc;\n}\n";
styleInject(css_248z);

script.__file = "src/symbol-icon.vue";

const install = (app, option) => {
    if (install.installed)
        return;
    install.installed = true;
    // 全局设置
    setGlobalOption(option);
    app.component(option && option.name || 'SymbolIcon', script);
};
var index = {
    install,
};

export { script as SvgSymbolIcon, index as default, setGlobalOption };
