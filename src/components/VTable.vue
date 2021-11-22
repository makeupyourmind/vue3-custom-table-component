<template>
  <div>
    <div v-if="isLoading">
      <slot name="loader">
        <VLoader :loader-message="loaderMessage" />
      </slot>
    </div>
    <div v-else>
      <table v-columns-resizable class="v-table">
        <thead>
          <tr>
            <th class="v-table__header--selectable">
              <VCheckbox
                v-if="showSelect && !singleSelect"
                id="mark-all"
                :checked="markedAllCheckboxes"
                :is-some-checkbox-un-marked="isSomeCheckboxUnMarked"
                @change="selectAllCheckboxes"
              />
            </th>
            <th
              v-for="(header, idx) in headers"
              :key="idx"
              class="v-table__header"
              :style="{ width: header.width }"
            >
              <span
                :class="{
                  'v-table__header--sortable': header.sortable,
                }"
                @click="header.sortable ? doSort(header.value) : false"
              >
                <span>
                  {{ header.text }}
                </span>
                <VIcon
                  v-if="header.sortable && hasSortableIcon(header.value)"
                  :icon="getSortDirection(header.value)"
                />
                <span v-if="hasSortableIcon(header.value)">{{
                  getSortableNumber(header.value) + 1
                }}</span>
              </span>
              <span v-if="header.resizable" class="resize-handle"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in sortedData" :key="idx">
            <td v-if="showSelect" class="v-table__item--selectable">
              <VCheckbox
                :id="idx"
                :checked="markedAllCheckboxes || isMarkedCheckbox(item)"
                @change="onCheckboxChange(item)"
              />
            </td>
            <td v-for="(itemKey, keyIdx) in Object.keys(item)" :key="keyIdx" class="v-table__item">
              <slot v-if="itemKey in item" :name="`item.${itemKey}`" :item="item">
                {{ getTableRowValue(item, itemKey) }}
              </slot>
              <template v-else>
                {{ getTableRowValue(item, itemKey) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isPaginationModeEnabled">
        <slot name="pagination">
          <VPagination
            :total-pages="paginationOptions.totalPages"
            :per-page="paginationOptions.perPage"
            :current-page="currentPage"
            @page-changed="onPageChange"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import VLoader from '@/components/VLoader.vue';
import VPagination from '@/components/VPagination.vue';
import VIcon from '@/components/VIcon.vue';
import VCheckbox from '@/components/VCheckbox.vue';
import { VueColumnsResizable } from '@/plugins/directives';
import { useRowSelection } from '@/hooks/use-row-selection.hook';
import { useSortable } from '@/hooks/use-sortable.hook';
import { Header, Item } from '@/types';

export default defineComponent({
  name: 'VTable',
  components: { VLoader, VPagination, VIcon, VCheckbox },
  directives: {
    'columns-resizable': VueColumnsResizable,
  },
  props: {
    headers: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    items: {
      type: Array,
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
      type: Object,
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
      type: Array as PropType<Item[]>,
      default: () => [],
    },
    // Hide select all elements checkbox
    singleSelect: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['handle-api-sorting', 'update:modelValue'],
  setup(props, context) {
    const currentPage = ref(1);

    const getTableRowValue = (item: { [key: string]: string }, key: string) => {
      const header: Header | undefined = props.headers.find(
        (header: Header) => header.value === key
      );
      return header ? item[key] : '';
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
    };

    const { doSort, hasSortableIcon, getSortableNumber, getSortDirection, sortedData } =
      useSortable(props, context, {
        currentPage,
      });

    const {
      selectAllCheckboxes,
      onCheckboxChange,
      isMarkedCheckbox,
      markedAllCheckboxes,
      isSomeCheckboxUnMarked,
    } = useRowSelection(props, context, { sortedData });

    return {
      getTableRowValue,
      doSort,
      sortedData,
      getSortDirection,
      hasSortableIcon,
      getSortableNumber,
      currentPage,
      onPageChange,
      selectAllCheckboxes,
      onCheckboxChange,
      isMarkedCheckbox,
      markedAllCheckboxes,
      isSomeCheckboxUnMarked,
    };
  },
});
</script>

<style lang="scss" scoped>
.v-table {
  border-collapse: collapse;
  min-width: 100%;
  text-align: initial;

  thead,
  tbody,
  tr {
    display: contents;
  }

  thead {
    display: grid;
    grid-template-columns: 4.375rem repeat(auto-fit, minmax(9.375rem, 1fr));
  }

  tbody {
    tr {
      display: grid;
      grid-template-columns: 4.375rem repeat(auto-fit, minmax(9.375rem, 1fr));
    }
  }

  th,
  td {
    padding: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  th {
    top: 0;
    background: #6c7ae0;
    text-align: left;
    font-weight: normal;
    font-size: 1.1rem;
    color: white;
    position: relative;
  }

  th:last-child {
    border: 0;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background: black;
    opacity: 0;
    width: 3px;
    cursor: col-resize;
  }

  .resize-handle:hover,
    /* The following selector is needed so the handle is visible during resize even if the mouse isn't over the handle anymore */
  .header--being-resized .resize-handle {
    opacity: 0.5;
  }

  th:hover .resize-handle {
    opacity: 0.3;
  }

  td {
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
    color: #808080;
  }

  tr:nth-child(even) td {
    background: #f8f6ff;
  }

  &__header {
    &--sortable {
      cursor: pointer;
      display: flex;
      margin-right: 1.875rem;
    }
  }

  &__header,
  &__item {
    &--selectable {
      width: 4.375rem;
    }
  }
}
</style>
