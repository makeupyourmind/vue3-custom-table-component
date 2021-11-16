<template>
  <ul class="v-pagination">
    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInFirstPage,
      }"
      v-on="!isInFirstPage ? { click: onClickFirstPage } : {}"
    >
      <FontAwesomeIcon class="v-pagination__btn--icon" icon="angle-double-left" />
    </li>

    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInFirstPage,
      }"
      v-on="!isInFirstPage ? { click: onClickPreviousPage } : {}"
    >
      <FontAwesomeIcon class="v-pagination__btn--icon" icon="chevron-left" />
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
      <FontAwesomeIcon class="v-pagination__btn--icon" icon="chevron-right" />
    </li>

    <li
      class="v-pagination__btn"
      :class="{
        'v-pagination__btn--disabled': isInLastPage,
      }"
      v-on="!isInLastPage ? { click: onClickLastPage } : {}"
    >
      <FontAwesomeIcon class="v-pagination__btn--icon" icon="angle-double-right" />
    </li>
  </ul>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'VPagination',
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
        return props.totalPages - props.maxVisibleButtons;
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

    const onClickPage = (page) => {
      context.emit('page-changed', page);
    };

    const onClickNextPage = () => {
      context.emit('page-changed', props.currentPage + 1);
    };

    const onClickLastPage = () => {
      context.emit('page-changed', props.totalPages);
    };

    const isPageActive = (page) => {
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
};
</script>
