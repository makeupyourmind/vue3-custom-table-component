<template>
  <div>
    <!--    loader slot -->
    <div v-if="isLoading">
      <slot name="loader">
        <VLoader :loader-message="loaderMessage" />
      </slot>
    </div>
    <!--    table content -->
    <div v-else>
      <table v-columns-resizable class="v-table">
        <thead>
          <tr>
            <th v-if="showSelect" class="v-table__header--selectable">
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
                  @change="selectAllCheckboxes"
                />
              </slot>
            </th>
            <th
              v-for="(header, idx) in filteredHeaders"
              :key="idx"
              class="v-table__header"
              :style="{ width: header.width }"
            >
              <slot
                :name="`header.${header.value}.content`"
                :header="header"
                :doSort="header.sortable ? doSort : false"
                :has-sortable-icon="hasSortableIcon(header.value)"
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
              </slot>
              <span v-if="header.resizable" class="resize-handle"></span>
            </th>
          </tr>
        </thead>
        <!--        table body-->
        <tbody>
          <template v-if="sortedData.length">
            <tr v-for="(item, idx) in sortedData" :key="idx">
              <td v-if="showSelect" class="v-table__item v-table__item--selectable">
                <slot
                  name="row-select-checkbox"
                  :id="idx"
                  :change="onCheckboxChange"
                  :checked="markedAllCheckboxes || isMarkedCheckbox(item)"
                  :clickedItem="item"
                >
                  <VCheckbox
                    :id="idx"
                    :checked="markedAllCheckboxes || isMarkedCheckbox(item)"
                    @change="onCheckboxChange(item)"
                  />
                </slot>
              </td>
              <td
                @click="rowClick(item)"
                v-for="(header, keyIdx) in filteredHeaders"
                :key="keyIdx"
                class="v-table__item"
                :data-label="header.text"
              >
                <slot :name="`item.${header.value}`" :item="item">
                  {{ getTableRowValue(item, header) }}
                </slot>
              </td>
              <template v-if="headers.length < filteredHeaders.length">
                <td
                  class="v-table__item"
                  v-for="rest in filteredHeaders.length - headers.length"
                  :key="rest"
                ></td>
              </template>
            </tr>
          </template>
          <template v-else>
            <slot name="no-content">No table data</slot>
          </template>
        </tbody>
      </table>
      <!--      pagination -->
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
  emits: ['handle-api-sorting', 'update:modelValue', 'row-click'],
  setup(props, context) {
    const currentPage = ref(1);

    const onPageChange = (page: number) => {
      currentPage.value = page;
    };

    const getTableRowValue = (item: { [key: string]: string }, header: Header) => {
      return item[header.value] || '';
    };

    const filteredHeaders = props.headers.filter((header) => header.value && header.text);

    const rowClick = (clickedItem: Item) => {
      context.emit('row-click', clickedItem);
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
      rowClick,
      filteredHeaders,
    };
  },
});
</script>

<style lang="scss" scoped>
.v-table {
  border-collapse: collapse;
  min-width: 100%;
  text-align: initial;
  position: sticky;
  top: 0;
  z-index: 1;

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

@media screen and (max-width: 600px) {
  .v-table {
    thead {
      border: none;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    tbody {
      tr {
        border-bottom: 3px solid #ddd;
        margin-bottom: 0.625em;
        display: block;
      }
    }

    &__item {
      border-bottom: 1px solid #ddd;
      display: block;
      font-size: 0.8em;
      text-align: right;

      &--selectable {
        margin-left: auto;
        border: none;
        width: 100%;
      }

      &::before {
        /*
          * aria-label has no advantage, it won't be read inside a table
          content: attr(aria-label);
        */
        content: attr(data-label);
        float: left;
        font-weight: bold;
        text-transform: uppercase;
      }

      &:last-child {
        border-bottom: 0;
      }
    }
  }
}
</style>
