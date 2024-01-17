import { type App } from 'vue';
import SvgSymbolIcon, { setGlobalOption } from './symbol-icon.vue';

const install = (app: App, option?: any) => {
  if ((install as any).installed) return;

  (install as any).installed = true;

  // 全局设置
  setGlobalOption(option);

  app.component(option && option.name || 'SymbolIcon', SvgSymbolIcon);
};

export default {
  install,
};

export {
  setGlobalOption,
  SvgSymbolIcon,
}
