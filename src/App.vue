<script setup>
import Main from './components/Main.vue'
</script>

<template>
  <div>
    <canvas class="background"></canvas>
    <Main/>
  </div>
</template>

<style scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
}
</style>
