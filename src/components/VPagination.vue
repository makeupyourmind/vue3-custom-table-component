<template>
  <ul class="v-pagination">
    <li class="v-pagination-item">
      <button type="button" :disabled="isInFirstPage" @click="onClickFirstPage">First</button>
    </li>

    <li class="v-pagination-item">
      <button type="button" :disabled="isInFirstPage" @click="onClickPreviousPage">Previous</button>
    </li>

    <!-- Visible Buttons Start -->

    <li v-for="page in pages" :key="page.name" class="v-pagination-item">
      <button
        type="button"
        :disabled="page.isDisabled"
        :class="{ active: isPageActive(page.name) }"
        @click="onClickPage(page.name)"
      >
        {{ page.name }}
      </button>
    </li>

    <!-- Visible Buttons End -->

    <li class="v-pagination-item">
      <button type="button" :disabled="isInLastPage" @click="onClickNextPage">Next</button>
    </li>

    <li class="v-pagination-item">
      <button type="button" :disabled="isInLastPage" @click="onClickLastPage">Last</button>
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
        let i = startPage;
        i <= Math.min(startPage + props.maxVisibleButtons - 1, props.totalPages);
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
