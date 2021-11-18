import { ASC, DESC } from '../constants';
import {
  dynamicSortMultiple,
  transformSortableFieldsOrderToSqlFormat,
  transformToFieldsWithSortingSign,
} from '../utils/utils';
import { computed, reactive } from 'vue';

export const useSortable = (props, context, { currentPage }) => {
  const sortableFields = reactive([]);

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

  const sliceArrayForPagination = (array) => {
    return [...array].slice(
      Math.max(0, (currentPage.value - 1) * props.paginationOptions.perPage),
      props.paginationOptions.perPage * currentPage.value
    );
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

    return [...items].sort(
      dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields))
    );
  });

  return {
    doSort,
    hasSortableIcon,
    getSortableNumber,
    getSortDirection,
    sortedData,
  };
};
