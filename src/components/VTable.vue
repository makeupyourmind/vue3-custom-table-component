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
            <th
              v-if="showSelect"
              :style="{ width: selectWidth }"
              class="v-table__header--selectable"
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
                'v-table__header',
                `v-table__header--${header.value}`,
                { 'v-table__header--fixed-side': header.fixed },
              ]"
              :style="{ width: header.width, minWidth: header.width }"
            >
              <slot
                :name="`header.${header.value}.content`"
                :header="header"
                :doSort="header.sortable ? doSort : false"
                :has-sortable-icon="header.hasSortableIcon"
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
                    v-if="header.sortable && header.hasSortableIcon"
                    :icon="header.sortDirection"
                  />
                  <span v-if="header.sortable && header.hasSortableIcon">{{
                    header.sortOrderNumber
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
            <tr
              v-for="(item, idx) in sortedData"
              :key="idx"
              :class="[
                'v-table__row',
                { 'v-table__row--checked': item.settings.isChecked },
                item.settings.classes,
              ]"
            >
              <td
                v-if="showSelect"
                :style="{ width: selectWidth }"
                class="v-table__item v-table__item--selectable"
              >
                <slot
                  name="row-select-checkbox"
                  :id="idx"
                  :change="onCheckboxChange"
                  :checked="markedAllCheckboxes || item.settings.isChecked"
                  :clickedItem="item"
                >
                  <VCheckbox
                    :id="idx"
                    :checked="markedAllCheckboxes || item.settings.isChecked"
                    @change="onCheckboxChange(item)"
                  />
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
import { defineComponent, PropType, reactive, ref, onMounted, watch } from 'vue';

import VLoader from '@/components/VLoader.vue';
import VPagination from '@/components/VPagination.vue';
import VIcon from '@/components/VIcon.vue';
import VCheckbox from '@/components/VCheckbox.vue';
import { useRowSelection } from '@/hooks/use-row-selection.hook';
import { useSortable } from '@/hooks/use-sortable.hook';
import { Header, Item, SortedItem } from '@/types';
import { VueColumnsResizable } from '@/plugins/directives';
import { useSetupFixedColumnsHook } from '@/hooks/use-setup-fixed-columns.hook';

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
      type: Array as PropType<Item[]>,
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
    selectWidth: {
      type: String,
      default: null,
    },
  },
  emits: ['handle-api-sorting', 'update:modelValue', 'row-click'],
  setup(props, context) {
    const settings = reactive({
      headers: [...props.headers].filter((header) => header.value && header.text),
    });

    const currentPage = ref(1);

    const onPageChange = (page: number) => {
      currentPage.value = page;
    };

    const rowClick = (clickedItem: SortedItem) => {
      const { settings, ...rest } = clickedItem;
      context.emit('row-click', rest);
    };

    const getRowClasses = (item: SortedItem) => {
      let styles: string[] = [];
      Object.keys(item).forEach((key) => {
        const header = settings.headers.find((header) => header.value === key);
        if (header?.style) {
          const itemValue = item[header.value];
          const expectedItemValue = header.style.expectedValue;
          const condition = header.style.condition;
          if (!itemValue || !expectedItemValue || !condition) return;

          const isValid = eval(`${itemValue} ${condition} ${expectedItemValue}`);
          if (isValid) {
            const className = Array.isArray(header.style.className)
              ? header.style.className.join(' ')
              : header.style.className;
            styles.push(className);
          }
        }
      });
      return styles.join(' ');
    };

    const { doSort, sortedData } = useSortable(props, context, {
      currentPage,
      settings,
    });

    onMounted(() => {
      // Apply default sort for some specific column.
      settings.headers
        .filter((header: Header) => header.defaultSort)
        .map(({ value, defaultSort }) => ({ value, defaultSort }))
        .forEach((item) => {
          doSort(item.value, item.defaultSort?.toUpperCase());
        });

      const table = document.querySelector<HTMLElement>('.v-table');
      if (!table) return;

      useSetupFixedColumnsHook(table);
    });

    watch(
      sortedData,
      (currentSortedData) => {
        currentSortedData.forEach((sortedItem: SortedItem) => {
          sortedItem.settings.classes = getRowClasses(sortedItem);
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
    position: relative;

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
      display: flex;
      justify-content: center;
    }

    &--fixed-side {
      position: sticky;
      left: 0;
      z-index: 2;
      background: white;
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
