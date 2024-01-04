<template>
  <div id="app">
    <router-view/>
    <!-- <img :src="logo" data-id="123" /> -->
    <br>
    svg preview:
    <!-- <svg style="width:77px;height:20px" data-id="s-1">
      <use xlink:href="#svg-workshop-tmap-logo"></use>
    </svg> -->
    <svg-symbol-icon :tooltip="tooltip" :name="name" size="18" />
    <svg>
      <rect x="25" y="25"  width="200" height="5" rx="3" fill="pink" class="load-bar"></rect>
    </svg>
    <svg>
    <polyline
    points="0,40 40,10 40,80 80,30 80,120 120,20 120,60"
    fill="white" 
    stroke="red" 
    stroke-width="4"
    ></polyline>
</svg>
  </div>
</template>

<script>
import Vue from 'vue';
import svgSymbolIcon from '@svgjs/vue2-symbol-icon';
import 'tippy.js/dist/tippy.css';
// import logo from './assets/logo.png';
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
      logo,
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
.load-bar {
  animation: loading 1.5s ease-in-out;
}
@keyframes loading {
  0% {
    width: 0;
  }
  100% {
    width: 200px;
  }
}
</style>
