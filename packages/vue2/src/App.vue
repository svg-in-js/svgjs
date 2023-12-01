<template>
  <div id="app">
    <router-view/>
    <div class="css-var">
  </div>
    <br>
    svg preview:
    <!-- <svg style="width:77px;height:20px" data-id="s-1">
      <use xlink:href="#svg-workshop-tmap-logo"></use>
    </svg> -->
    <svg-symbol-icon name="add" size="18" disabled spin />
  </div>
</template>

<script>
import svgSymbolIcon from './svg-symbol-icon.vue'

export default {
  name: 'App',
  components: {
    svgSymbolIcon
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color);
  margin-top: 60px;
}
</style>
