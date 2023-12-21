<template>
  <div id="app">
    <router-view/>
    <br>
    svg preview:
    <!-- <svg style="width:77px;height:20px" data-id="s-1">
      <use xlink:href="#svg-workshop-tmap-logo"></use>
    </svg> -->
    <svg-symbol-icon :tooltip="tooltip" :name="name" size="18" />
  </div>
</template>

<script>
import Vue from 'vue';
import svgSymbolIcon from '@svgjs/vue2-symbol-icon';
import 'tippy.js/dist/tippy.css';
// import 'tippy.js/themes/light.css';

// console.log(SvgSymbolIcon)
Vue.use(svgSymbolIcon, {
  color: '#aaa',
  hoverColor: '#f90',
});
export default {
  name: 'App',
  components: {
    // SvgSymbolIcon
  },
  data() {
    return {
      name: '',
      tooltip: 'add',
    }
  },
  mounted() {
    this.name = 'svg-single-color-01';

    setTimeout(() => {
      // this.name = 'svg/zuoyi_icon';
      this.tooltip = {
        content: this.name,
       
      };
    }, 3000);
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
