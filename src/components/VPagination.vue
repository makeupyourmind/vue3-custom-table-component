<template>
  <ul class="v-pagination">
    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInFirstPage,
      }"
      v-on="!isInFirstPage ? { click: onClickFirstPage } : {}"
    >
      <VIcon class="v-pagination__btn--icon" icon="angle-double-left" />
    </li>

    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInFirstPage,
      }"
      v-on="!isInFirstPage ? { click: onClickPreviousPage } : {}"
    >
      <VIcon class="v-pagination__btn--icon" icon="chevron-left" />
    </li>

    <!-- Visible Buttons Start -->

    <li v-for="page in pages" :key="page.name">
      <button
        type="button"
        :disabled="page.isDisabled"
        class="v-pagination__numbers"
        :class="{ active: isPageActive(page.name) }"
        @click="onClickPage(page.name)"
      >
        {{ page.name }}
      </button>
    </li>

    <!-- Visible Buttons End -->

    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInLastPage,
      }"
      v-on="!isInLastPage ? { click: onClickNextPage } : {}"
    >
      <VIcon class="v-pagination__btn--icon" icon="chevron-right" />
    </li>

    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInLastPage,
      }"
      v-on="!isInLastPage ? { click: onClickLastPage } : {}"
    >
      <VIcon class="v-pagination__btn--icon" icon="angle-double-right" />
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import VIcon from './VIcon.vue';

export default defineComponent({
  name: 'VPagination',
  components: { VIcon },
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  emits: ['page-changed'],
  setup(props, context) {
    const startPage = computed(() => {
      if (props.currentPage === 1) {
        return 1;
      }

      // When on the last page
      if (props.currentPage === props.totalPages) {
        return props.totalPages - props.maxVisibleButtons < 0
          ? 1
          : props.totalPages - (props.maxVisibleButtons - 1);
      }

      // When in between
      return props.currentPage - 1;
    });

    const pages = computed(() => {
      const range = [];

      for (
        let i = startPage.value;
        i <= Math.min(startPage.value + props.maxVisibleButtons - 1, props.totalPages);
        i++
      ) {
        range.push({
          name: i,
          isDisabled: i === props.currentPage,
        });
      }

      return range;
    });

    const isInFirstPage = computed(() => {
      return props.currentPage === 1;
    });

    const isInLastPage = computed(() => {
      return props.currentPage === props.totalPages;
    });

    const onClickFirstPage = () => {
      context.emit('page-changed', 1);
    };

    const onClickPreviousPage = () => {
      context.emit('page-changed', props.currentPage - 1);
    };

    const onClickPage = (page: number) => {
      context.emit('page-changed', page);
    };

    const onClickNextPage = () => {
      context.emit('page-changed', props.currentPage + 1);
    };

    const onClickLastPage = () => {
      context.emit('page-changed', props.totalPages);
    };

    const isPageActive = (page: number) => {
      return props.currentPage === page;
    };

    return {
      startPage,
      pages,
      isInFirstPage,
      isInLastPage,
      onClickFirstPage,
      onClickNextPage,
      onClickPreviousPage,
      onClickLastPage,
      onClickPage,
      isPageActive,
    };
  },
});
</script>

<style lang="scss" scoped>
.v-pagination {
  list-style-type: none;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;
  border-radius: 0.6rem;
  background: #ffffff;

  &__numbers,
  &__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.4rem;
    font-size: 1rem;
    cursor: pointer;
  }

  &__numbers {
    width: 1.625rem;
    height: 1.625rem;
    border-radius: 0.4rem;
    background: transparent;
    outline: none;
    border: none;

    &:hover {
      color: #23adad;
    }

    &.active {
      color: #ffffff;
      background: #23adad;
      font-weight: 600;
      border: 1px solid #23adad;
    }
  }

  &__btn {
    color: #23adade1;

    &--disabled {
      cursor: not-allowed;
      color: #423e3e;
      opacity: 0.7;
    }
  }
}
</style>
