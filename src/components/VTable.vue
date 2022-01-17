<template>
  <div class="v-component">
    <!--    loader slot -->
    <div v-if="isLoading">
      <slot name="loader">
        <VLoader :loader-message="loaderMessage" />
      </slot>
    </div>
    <!--    table content -->
    <div v-else>
      <div class="v-container">
        <table v-columns-resizable class="v-table">
          <thead class="v-table__header">
            <tr>
              <th
                v-if="showSelect"
                :style="{ width: sizeOfSelectableColumn }"
                :class="[
                  'v-table__header__item',
                  'v-table__header__item--selectable',
                  { 'v-table__header__item--fixed-side': selectCheckboxFixed },
                ]"
              >
                <slot
                  v-if="!singleSelect && sortedData.length"
                  name="header-select-checkbox"
                  :change="selectAllCheckboxes"
                  :checked="markedAllCheckboxes"
                  :is-some-checkbox-un-marked="isSomeCheckboxUnMarked"
                >
                  <VCheckbox
                    id="mark-all"
                    :checked="markedAllCheckboxes"
                    :is-some-checkbox-un-marked="isSomeCheckboxUnMarked"
                    @checkbox-changed="selectAllCheckboxChanged"
                  />
                </slot>
              </th>
              <th
                v-for="(header, idx) in settings.headers"
                :key="idx"
                :class="[
                  'v-table__header__item',
                  `v-table__header__item--${header.value}`,
                  { 'v-table__header__item--fixed-side': header.fixed },
                ]"
                :style="{ width: header.width, minWidth: header.width }"
              >
                <slot
                  :name="`header.${header.value}.content`"
                  :header="header"
                  :doSort="header.sortable ? doSort : false"
                  :has-sortable-icon="header.hasSortableIcon"
                >
                  <div
                    :class="{
                      'v-table__header__item--sortable': header.sortable,
                    }"
                    @click="header.sortable ? doSort(header.value) : false"
                  >
                    <span>
                      {{ header.text }}
                    </span>
                    <div v-if="header.sortable && header.hasSortableIcon" class="sortable-icons">
                      <div
                        :class="[
                          'sort-up-arrow',
                          { 'is-active': header.sortDirection === 'sort-up' },
                        ]"
                      ></div>
                      <div
                        :class="[
                          'sort-down-arrow',
                          { 'is-active': header.sortDirection === 'sort-down' },
                        ]"
                      ></div>
                    </div>
                  </div>
                </slot>
                <span v-if="header.resizable" class="resize-handle"></span>
              </th>
            </tr>
          </thead>
          <!--        table body-->
          <tbody class="v-table__body">
            <template v-if="sortedData.length">
              <template v-for="(item, idx) in sortedData" :key="idx">
                <tr class="v-table__row--plug">
                  <td
                    v-if="showSelect"
                    :class="[
                      'v-table__item',
                      'v-table__item--plug',
                      { 'v-table__item--fixed-side': selectCheckboxFixed },
                    ]"
                  ></td>
                  <td
                    v-for="(header, keyIdx) in settings.headers"
                    :key="keyIdx"
                    :class="[
                      'v-table__item',
                      'v-table__item--plug',
                      `v-table__item--${header.value}`,
                      { 'v-table__item--fixed-side': header.fixed },
                    ]"
                    :data-label="header.text"
                  ></td>
                </tr>
                <tr
                  :class="[
                    'v-table__row',
                    { 'v-table__row--checked': item.itemSettings.isChecked },
                    item.itemSettings.classes,
                  ]"
                >
                  <td
                    v-if="showSelect"
                    :style="{ width: sizeOfSelectableColumn }"
                    :class="['v-table__item', 'v-table__item--selectable']"
                  >
                    <slot
                      name="row-select-checkbox"
                      :id="idx"
                      :change="onCheckboxChange"
                      :checked="markedAllCheckboxes || item.itemSettings.isChecked"
                      :clickedItem="item"
                    >
                      <VCheckbox
                        :id="idx"
                        :checked="markedAllCheckboxes || item.itemSettings.isChecked"
                        @change="onCheckboxChange(item)"
                      />
                      <!--                    -->
                    </slot>
                  </td>
                  <td
                    @click="rowClick(item)"
                    v-for="(header, keyIdx) in settings.headers"
                    :key="keyIdx"
                    :class="[
                      'v-table__item',
                      `v-table__item--${header.value}`,
                      { 'v-table__item--fixed-side': header.fixed },
                    ]"
                    :data-label="header.text"
                  >
                    <slot :name="`item.${header.value}`" :item="item">
                      {{ item[header.value] || '' }}
                    </slot>
                  </td>
                  <!-- Fill empty cells             -->
                  <template v-if="headers.length < settings.headers.length">
                    <td
                      class="v-table__item"
                      v-for="rest in settings.headers.length - headers.length"
                      :key="rest"
                    ></td>
                  </template>
                </tr>
              </template>
            </template>
            <template v-else>
              <slot name="no-content">No table data</slot>
            </template>
          </tbody>
        </table>
      </div>
      <!--      pagination -->
      <template v-if="isPaginationModeEnabled">
        <slot name="pagination">
          <VPagination
            :total-pages="paginationOptions.totalPages"
            :per-page="paginationOptions.perPage"
            :current-page="currentPage"
            @page-changed="onPageChange"
          />
        </slot>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, onMounted, watch } from 'vue';

import VLoader from '@/components/VLoader.vue';
import VPagination from '@/components/VPagination.vue';
import VCheckbox from '@/components/VCheckbox.vue';
import { useRowSelection } from '@/hooks/use-row-selection.hook';
import { useSortable } from '@/hooks/use-sortable.hook';
import { Header, TableItem, SortedItem, PaginationOptions } from '@/types';
import { VueColumnsResizable } from '@/plugins/directives';
import { useSetupFixedColumnsHook } from '@/hooks/use-setup-fixed-columns.hook';
import {
  calculateSizeOfSelectableColumnWithCorrectUnit,
  extractStyleWidthValueWithUnit,
} from '@/utils/utils';
import { MIN_WIDTH_OF_SELECTABLE_FIELD } from '@/constants';
import { useRowClassesHook } from '@/hooks/use-row-classes.hook';

export default defineComponent({
  name: 'VTable',
  components: { VLoader, VPagination, VCheckbox },
  directives: {
    'columns-resizable': VueColumnsResizable,
  },
  props: {
    headers: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    items: {
      type: Array as PropType<TableItem[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    loaderMessage: {
      type: String,
      default: null,
    },
    useApiSorting: {
      type: Boolean,
      default: false,
    },
    paginationOptions: {
      type: Object as PropType<PaginationOptions>,
      default: () => ({
        totalPages: 1,
        perPage: 10,
      }),
    },
    // enable pagination slot
    isPaginationModeEnabled: {
      type: Boolean,
      default: false,
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
    // Model for selected elements
    modelValue: {
      type: Array as PropType<SortedItem[]>,
      default: () => [],
    },
    // Hide select all elements checkbox
    singleSelect: {
      type: Boolean,
      default: false,
    },
    selectCheckboxWidth: {
      type: String,
      default: null,
    },
    selectCheckboxFixed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['handle-api-sorting', 'update:modelValue', 'row-click'],
  setup(props, context) {
    let sizeOfSelectableColumn = ref(`${MIN_WIDTH_OF_SELECTABLE_FIELD}px`);
    const settings = reactive({
      headers: props.headers.filter((header) => header.value && header.text),
      items: props.items,
    });

    const currentPage = ref(1);

    const propsSelectWidthValueWithUnit = extractStyleWidthValueWithUnit(
      props.selectCheckboxWidth || sizeOfSelectableColumn.value
    );

    let sizeOfSelectableColumnWithCorrectUnit = calculateSizeOfSelectableColumnWithCorrectUnit(
      sizeOfSelectableColumn,
      propsSelectWidthValueWithUnit
    );

    if (
      parseFloat(propsSelectWidthValueWithUnit[0]) <=
      parseFloat(sizeOfSelectableColumnWithCorrectUnit.value)
    ) {
      sizeOfSelectableColumn = sizeOfSelectableColumnWithCorrectUnit;
    } else {
      sizeOfSelectableColumn = ref(propsSelectWidthValueWithUnit.join(''));
    }

    const onPageChange = (page: number) => {
      currentPage.value = page;
    };

    const rowClick = (clickedItem: SortedItem) => {
      const { itemSettings, ...rest } = clickedItem;
      context.emit('row-click', rest);
    };

    const { getRowClasses } = useRowClassesHook(settings);

    const { doSort, sortedData } = useSortable(props, context, {
      currentPage,
      settings,
    });

    onMounted(() => {
      const table = document.querySelector<HTMLElement>('.v-table');
      if (!table) return;

      // check if we need to enable fixed columns hook
      const applyFixedColumnsHook =
        settings.headers.some((header) => header.fixed) || props.selectCheckboxFixed;

      if (applyFixedColumnsHook) {
        useSetupFixedColumnsHook(table);
      }
    });

    watch(
      sortedData,
      (currentSortedData) => {
        currentSortedData.forEach((sortedItem: SortedItem) => {
          sortedItem.itemSettings.classes = getRowClasses(sortedItem);
        });
      },
      {
        immediate: true,
      }
    );

    const { selectAllCheckboxes, onCheckboxChange, markedAllCheckboxes, isSomeCheckboxUnMarked } =
      useRowSelection(props, context, { sortedData });

    const selectAllCheckboxChanged = (val: boolean) => {
      selectAllCheckboxes(val);
    };

    return {
      doSort,
      sortedData,
      currentPage,
      onPageChange,
      selectAllCheckboxes,
      onCheckboxChange,
      markedAllCheckboxes,
      isSomeCheckboxUnMarked,
      rowClick,
      settings,
      selectAllCheckboxChanged,
      sizeOfSelectableColumn,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../assets/styles/_fonts.scss';
@import '../assets/styles/_variables.scss';

.v-component {
  box-shadow: 0px 4px 12px 1px rgb(2 61 151 / 18%);
  border-radius: 8px;
  border-bottom: 1px solid transparent;
}

.v-table {
  font-family: Inter, serif;
  border-collapse: collapse;
  min-width: 100%;
  text-align: initial;
  position: sticky;
  top: 0;
  z-index: 1;

  $v-table: &;

  &__row {
    display: grid;
    grid-template-columns: 4.375rem repeat(auto-fit, minmax(9.375rem, 1fr));

    &:active {
      background: $table-row-item-hover-bg-color;

      #{$v-table}__item--selectable {
        border-radius: 4px 0px 0px 4px;
        border-left: 4px solid #071fb8;
      }
    }

    &--plug {
      display: grid;
      height: 1rem;
    }
  }

  &__header {
    display: grid;
    grid-template-columns: 4.375rem repeat(auto-fit, minmax(9.375rem, 1fr));
    background: $table-header-bg-color;

    tr {
      display: contents;
    }
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background: $table-header-being-resized-border-color;
    opacity: 1;
    width: 1px;
    cursor: col-resize;

    border-right: 2px solid $table-border-color;
  }

  .resize-handle:hover,
    /* The following selector is needed so the handle is visible during resize even if the mouse isn't over the handle anymore */
  .header--being-resized .resize-handle {
    opacity: 0.5;

    &:after {
      content: '';
      background-image: url('~@/assets/resized-icon.svg');
      width: 56px;
      height: 30px;
      display: block;
      background-repeat: no-repeat;
      position: absolute;
      left: -29px;
      top: 4px;
    }
  }

  &__header__item {
    font-size: 0.875rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $table-header-text-color;
    text-transform: uppercase;

    &--sortable {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;

      .sortable-icons {
        position: absolute;
        right: 0;
        margin-right: -1rem;
      }
    }

    &--fixed-side {
      background: $table-header-bg-color;
    }

    &.header--being-resized {
      background: $table-header-being-resized;
      border-right: 1px solid $table-header-being-resized-border-color;
      z-index: 3;
    }
  }

  &__item {
    color: $table-row-item-text-color;
    font-size: 0.875rem;
    line-height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid $table-border-color;

    &--plug {
      height: 1rem !important;
    }

    &.header--being-resized {
      background: $table-header-being-resized-for-row;
      border-right: 1px solid $table-header-being-resized-border-color;
    }

    &--fixed-side {
      background: $white-color;
    }
  }

  &__header__item,
  &__item {
    height: 2.75rem;
    position: relative;

    &--selectable {
      position: relative;
      width: 2.75rem;
      height: 2.75rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &--fixed-side {
      position: sticky;
      left: 0;
      z-index: 2;

      &:hover {
        z-index: 3;
      }
    }
  }
}

.sort-up-arrow {
  width: 0;
  height: 0;
  transform: rotate(90deg);
  position: relative;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #636992;

  &:after {
    content: '';
    position: absolute;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-right: 3px solid #fff;
    top: -3px;
    left: 2px;
  }
}

.sort-down-arrow {
  width: 0;
  height: 0;
  transform: rotate(-90deg);
  position: relative;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid $sort-icon-bg-color;

  &:after {
    content: '';
    position: absolute;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-right: 3px solid #fff;
    top: -3px;
    left: 2px;
  }
}

.sort-up-arrow,
.sort-down-arrow {
  &.is-active {
    &:after {
      content: none;
    }
  }
}

.v-container {
  position: relative;
  overflow-x: scroll;
  min-width: 100%;
  background: $white-color;
  padding: 1.25rem 0 1.25rem 0.5rem;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    height: 28px; /* height of horizontal scrollbar ← You're missing this */
  }

  &::-webkit-scrollbar-track {
    border-radius: 5px;
    margin: 0 20px;
    border: 1px solid $table-border-color;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 14px;
    background-color: $scrollbar-thumb-color;
    border: 10px solid transparent;
    background-clip: content-box;
  }
}
</style>
