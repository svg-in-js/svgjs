<template>
  <div class="wrapper">
    <div class="top"></div>
    <div class="left"></div>
    <div class="right"></div>
    <div class="bottom"></div>
  </div>
</template>
<style>
html,body {
  height: 100%;
}
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.top {
  height: 50px;
  width: 100%;
  position: absolute;
  top: 0;
  background: red;
}
.left {
  position: absolute;
  top: 50px;
  left: 0;
  width: 300px;
  bottom: 100px;
  background: blue;
}
.bottom {
  width: 100%;
  height: 100px;
  position: absolute;
  bottom: 0;
  background: yellow;
}
.right {
  position: absolute;
  top: 50px;
  bottom: 100px;
  left: 300px;
  right: 0;
  background: gray;
}
</style>