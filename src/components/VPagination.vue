<template>
  <ul class="v-pagination">
    <li
      :class="[
        'v-pagination__btn',
        'v-pagination__btn--start',
        {
          'v-pagination__btn--disabled': isInFirstPage,
        },
      ]"
      v-on="!isInFirstPage ? { click: onClickFirstPage } : {}"
    >
      To the beginning
    </li>

    <li
      :class="[
        'v-pagination__btn',
        'v-pagination__btn--arrow',
        {
          'v-pagination__btn--disabled': isInFirstPage,
        },
      ]"
      v-on="!isInFirstPage ? { click: onClickPreviousPage } : {}"
    >
      <img src="@/assets/pagination-arrow-left.svg" alt="left pagination arrow" />
    </li>

    <li
      :class="[
        'v-pagination__btn',
        'v-pagination__btn--arrow',
        {
          'v-pagination__btn--disabled': isInLastPage,
        },
      ]"
      v-on="!isInLastPage ? { click: onClickNextPage } : {}"
    >
      <img src="@/assets/pagination-arrow-right.svg" alt="right pagination arrow" />
    </li>

    <!-- Visible buttons start   -->
    <li v-for="page in pages" :key="page.name" class="v-pagination__numbers">
      <button
        type="button"
        :disabled="page.isDisabled"
        class="v-pagination__number"
        :class="{ active: isPageActive(page.name) }"
        @click="onClickPage(page.name)"
      >
        {{ page.name }}
      </button>
    </li>

    <!-- Visible buttons end   -->

    <li
      :class="[
        'v-pagination__btn',
        'v-pagination__btn--last',
        {
          'v-pagination__btn--disabled': isInLastPage,
        },
      ]"
      v-on="!isInLastPage ? { click: onClickLastPage } : {}"
    >
      Last
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
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
@import '../assets/styles/_fonts.scss';

.v-pagination {
  font-family: Inter, serif;
  list-style-type: none;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 2rem 1.75rem 2rem 0;
  border-radius: 0.6rem;
  background: #ffffff;

  & > &__numbers {
    margin-left: 1.25rem;
  }

  & > &__numbers ~ &__numbers {
    margin-left: 1rem;
  }

  &__number,
  &__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    cursor: pointer;
  }

  &__number {
    background: none;
    width: 1.25rem;
    height: 1.25rem;
    color: #181d3d;
    outline: none;
    border: none;

    &.active {
      background: #ebeefe;
      font-weight: 600;
    }
  }

  &__btn {
    color: #636992;

    &--arrow {
      width: 1.75rem;
      height: 1.75rem;

      &:active {
        background: #ebeefe;
      }

      &:nth-child(3) {
        margin-left: 6px;
      }
    }

    &--start {
      margin-right: 2.25rem;
    }

    &--last {
      margin-left: 2.25rem;
    }

    &--disabled {
      cursor: not-allowed;
      color: #423e3e;
      opacity: 0.7;

      &:active {
        background: none;
      }
    }
  }
}
</style>
