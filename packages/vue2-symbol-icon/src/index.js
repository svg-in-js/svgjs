import SvgSymbolIcon from './svg-symbol-icon.vue';

export default {
  install(Vue, option = {}) {
    Vue.component(option.name || 'SvgSymbolIcon', SvgSymbolIcon);
  },
};

export {
  SvgSymbolIcon
}
