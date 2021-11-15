<template>
  <div class="v-loader">
    <div class="v-loader-progress">
      <div class="v-loader-progress__element"></div>
    </div>
    <p class="v-loader__text">Loading... Please wait</p>
  </div>
</template>

<script>
export default {
  name: 'VLoader',
};
</script>

<style lang="scss" scoped>
.v-loader-progress {
  background-color: $loader-main-color;
  overflow: hidden;
  width: 100%;
  height: 100%;
  //position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  z-index: 100000;

  &__element {
    height: $loader-size;
    width: 100%;
    background: $loader-back-color;

    &:before {
      content: '';
      display: block;
      background-color: $loader-color;
      height: $loader-size;
      width: 0;
      animation: getWidth $loader-time ease-in infinite;
    }
  }
}

.v-loader {
  position: relative;

  &__text {
    text-align: center;
    color: rgba(0, 0, 0, 0.38);
  }
}

@keyframes getWidth {
  100% {
    width: 100%;
  }
}
</style>
