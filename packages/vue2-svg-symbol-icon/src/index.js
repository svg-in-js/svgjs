import SvgSymbolIcon, { setGlobalOption } from './svg-symbol-icon.vue';

const install = (Vue, option = {}) => {
  if (install.installed) return;

  install.installed = true;

  // 全局设置
  setGlobalOption({
    color: option.color,
    disabledColor: option.disabledColor,
    hoverColor: option.hoverColor,
    activedColor: option.activedColor,
    placeholderColor: option.placeholderColor,
  });

  Vue.component(option.name || 'SvgSymbolIcon', SvgSymbolIcon);
};

export default install;

export {
  SvgSymbolIcon,
}
