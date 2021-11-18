<template>
  <div>
    <div v-if="isLoading">
      <VLoader />
    </div>
    <div v-else>
      <table v-columns-resizable class="v-table">
        <thead>
          <tr>
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
            <td v-for="(itemKey, keyIdx) in Object.keys(item)" :key="keyIdx">
              {{ getTableRowValue(item, itemKey) }}
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

<script>
import { computed, defineComponent, reactive, ref } from 'vue';
import {
  dynamicSortMultiple,
  transformSortableFieldsOrderToSqlFormat,
  transformToFieldsWithSortingSign,
} from '../utils/utils';
import { ASC, DESC } from '../constants';
import { VueColumnsResizable } from '../plugins/directives';
import VLoader from './VLoader';
import VPagination from './VPagination.vue';
import VIcon from './VIcon';

export default defineComponent({
  name: 'VTable',
  components: { VLoader, VPagination, VIcon },
  directives: {
    'columns-resizable': VueColumnsResizable,
  },
  props: {
    headers: {
      type: Array,
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
  },
  emits: ['handle-api-sorting'],
  setup(props, context) {
    const sortableFields = reactive([]);
    const currentPage = ref(1);

    const getTableRowValue = (item, key) => {
      const header = props.headers.find((header) => header.value === key);
      return header ? item[key] : '';
    };

    const doSort = (field) => {
      const indexOfSearchableField = sortableFieldsManipulations('findIndex', field);
      if (indexOfSearchableField !== -1) {
        const sortableField = sortableFields[indexOfSearchableField];
        sortableField.order === ASC
          ? (sortableField.order = DESC)
          : sortableFields.splice(indexOfSearchableField, 1);
      } else {
        sortableFields.push({
          field,
          order: ASC,
        });
      }

      if (props.useApiSorting) {
        context.emit('handle-api-sorting', transformSortableFieldsOrderToSqlFormat(sortableFields));
      }
    };

    const hasSortableIcon = (field) => {
      return !!sortableFieldsManipulations('find', field);
    };

    const getSortableNumber = (field) => {
      return sortableFieldsManipulations('findIndex', field);
    };

    const getSortDirection = (field) => {
      const sortableField = sortableFieldsManipulations('find', field);
      const order = sortableField.order === ASC ? 'up' : 'down';
      return `sort-${order}`;
    };

    const sortableFieldsManipulations = (method, field) => {
      return sortableFields[method]((sortableField) => sortableField.field === field);
    };

    const onPageChange = (page) => {
      currentPage.value = page;
    };

    const sliceArrayForPagination = (array) => {
      return [...array].slice(
        Math.max(0, (currentPage.value - 1) * props.paginationOptions.perPage),
        props.paginationOptions.perPage * currentPage.value
      );
    };

    const sortedData = computed(() => {
      const { useApiSorting, isPaginationModeEnabled, items } = props;
      // check if user wants to use custom pagination
      const useCustomPagination = !!context.slots.pagination;

      if (
        (isPaginationModeEnabled && useCustomPagination) ||
        (useApiSorting && isPaginationModeEnabled && useCustomPagination)
      ) {
        return items;
      }

      if (
        (isPaginationModeEnabled && !useCustomPagination) ||
        (useApiSorting && isPaginationModeEnabled && !useCustomPagination)
      ) {
        return sliceArrayForPagination(items).sort(
          dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields))
        );
      }

      return items.sort(dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields)));
    });

    return {
      getTableRowValue,
      doSort,
      sortedData,
      getSortDirection,
      hasSortableIcon,
      getSortableNumber,
      currentPage,
      onPageChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.v-table {
  display: grid;
  border-collapse: collapse;
  min-width: 100%;
  grid-template-columns: auto;
  text-align: initial;

  thead,
  tbody,
  tr {
    display: contents;
  }

  thead {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  tbody {
    tr {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }

  th,
  td {
    padding: 15px;
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
    padding-top: 10px;
    padding-bottom: 10px;
    color: #808080;
  }

  tr:nth-child(even) td {
    background: #f8f6ff;
  }

  &__header {
    &--sortable {
      cursor: pointer;
      display: flex;
      margin-right: 30px;
    }
  }
}
</style>
