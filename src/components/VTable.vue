<template>
  <div>
    <div v-if="isLoading">
      <VLoader />
    </div>
    <div v-else>
      <table id="custom-table" v-columns-resizable>
        <thead>
          <tr>
            <th
              v-for="(header, idx) in headers"
              :key="idx"
              :class="{
                sortable: header.sortable,
              }"
              @click="header.sortable ? doSort(header.value) : false"
            >
              <span>{{ header.text }}</span>
              <FontAwesomeIcon
                v-if="header.sortable && hasSortableIcon(header.value)"
                :icon="getSortDirection(header.value)"
              />
              <span v-if="hasSortableIcon(header.value)">{{
                getSortableNumber(header.value) + 1
              }}</span>
              <span v-if="header.resizable" class="resize-handle"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in sortedData" :key="idx">
            <td v-for="(key, keyIdx) in Object.keys(item)" :key="keyIdx">
              {{ getTableRowValue(item, key) }}
            </td>
          </tr>
        </tbody>
      </table>
      <div>
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
import VLoader from './VLoader';
import VPagination from './VPagination.vue';
import {
  dynamicSortMultiple,
  transformSortableFieldsOrderToSqlFormat,
  transformToFieldsWithSortingSign,
} from '../utils/utils';
import { ASC, DESC } from '../constants';

export default defineComponent({
  name: 'VTable',
  components: { VLoader, VPagination },
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
        currentPage: 0,
        totalPages: 1,
        perPage: 10,
      }),
    },
    isSlotMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['handle-api-sorting'],
  setup(props, context) {
    const initialPropsItems = reactive([...props.items]);
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
        if (sortableField.order === ASC) {
          sortableField.order = DESC;
        } else {
          sortableFields.splice(indexOfSearchableField, 1);
        }
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
      return array.slice(
        Math.max(
          0,
          ((props.paginationOptions.currentPage || currentPage.value) - 1) *
            props.paginationOptions.perPage
        ),
        props.paginationOptions.perPage * (props.paginationOptions.currentPage || currentPage.value)
      );
    };

    const sortedData = computed(() => {
      return props.useApiSorting || !sortableFields.length
        ? sliceArrayForPagination([...initialPropsItems])
        : sliceArrayForPagination([...props.items]).sort(
            dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields))
          );
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
