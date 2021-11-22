import { ASC, DESC } from '@/constants';
import {
  dynamicSortMultiple,
  transformSortableFieldsOrderToSqlFormat,
  transformToFieldsWithSortingSign,
} from '@/utils/utils';
import { computed, Ref, reactive, ComputedRef } from 'vue';
import { Item, SortableField, SortedItem } from '@/types';

export const useSortable = (
  props: any,
  context: any,
  { currentPage }: { currentPage: Ref<number> }
) => {
  const sortableFields: SortableField[] = reactive([]);

  const doSort = (field: string) => {
    const indexOfSearchableField = sortableFieldsManipulations('findIndex', field);
    if (indexOfSearchableField !== -1) {
      const sortableField: SortableField = sortableFields[indexOfSearchableField];
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

  const sliceArrayForPagination = (array: Item[]) => {
    return [...array].slice(
      Math.max(0, (currentPage.value - 1) * props.paginationOptions.perPage),
      props.paginationOptions.perPage * currentPage.value
    );
  };

  const hasSortableIcon = (field: string) => {
    return !!sortableFieldsManipulations('find', field);
  };

  const getSortableNumber = (field: string) => {
    return sortableFieldsManipulations('findIndex', field);
  };

  const getSortDirection = (field: string) => {
    const sortableField: SortableField | undefined = sortableFieldsManipulations('find', field);
    const order = sortableField?.order === ASC ? 'up' : 'down';
    return `sort-${order}`;
  };

  const sortableFieldsManipulations = (method: string, field: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return sortableFields[method]((sortableField: SortableField) => sortableField.field === field);
  };

  const sortedData: ComputedRef<SortedItem[]> = computed(() => {
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
