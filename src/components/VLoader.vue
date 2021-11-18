<template>
  <div class="v-loader">
    <div class="v-loader-progress">
      <div class="v-loader-progress__element"></div>
    </div>
    <p class="v-loader__text">{{ loadingPlug }}</p>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'VLoader',
  props: {
    loaderMessage: {
      type: String,
    },
  },
  setup(props) {
    const loadingPlug = computed(() => {
      return props.loaderMessage ? props.loaderMessage : 'Loading... Please wait';
    });

    return {
      loadingPlug,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_variables.scss';

.v-loader-progress {
  background-color: $loader-main-color;
  overflow: hidden;
  width: 100%;
  height: 100%;
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
