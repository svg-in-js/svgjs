<template>
  <div id="app">
    <router-view/>
    svg preview:
    <svg style="width:77px;height:20px">
      <use xlink:href="#svg-workshop-tmap-logo"></use>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
