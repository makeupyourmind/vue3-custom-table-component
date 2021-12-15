import { computed, Ref, reactive, ComputedRef } from 'vue';

import { ASC, DESC } from '@/constants';
import {
  dynamicSortMultiple,
  transformSortableFieldsOrderToSqlFormat,
  transformToFieldsWithSortingSign,
} from '@/utils/utils';
import { Header, Item, SortableField, SortedItem } from '@/types';

export const useSortable = (
  props: any,
  context: any,
  { currentPage, settings }: { currentPage: Ref<number>; settings: { headers: Header[] } }
) => {
  const sortableFields: SortableField[] = reactive([]);

  const doSort = (field: string, sortDirection = ASC) => {
    const indexOfSearchableField = sortableFieldsManipulations('findIndex', field);
    if (indexOfSearchableField !== -1) {
      const sortableFieldByIndex: SortableField = sortableFields[indexOfSearchableField];
      sortableFieldByIndex.order === ASC
        ? (sortableFieldByIndex.order = DESC)
        : sortableFields.splice(indexOfSearchableField, 1);
    } else {
      sortableFields.push({
        field,
        order: sortDirection,
      });
    }

    const sortableField = sortableFieldsManipulations('find', field);

    if (sortableField) {
      // eslint-disable-next-line prefer-spread
      const maxSortOrderNumber = Math.max.apply(
        Math,
        settings.headers.map((header: Header) => header.sortOrderNumber || 0)
      );

      settings.headers = settings.headers.map((header: Header) => {
        if (header.value === field) {
          const sortDirectionOrder = sortableField.order === ASC ? 'up' : 'down';
          return {
            ...header,
            hasSortableIcon: true,
            sortDirection: `sort-${sortDirectionOrder}`,
            sortOrderNumber: header.sortOrderNumber
              ? header.sortOrderNumber
              : maxSortOrderNumber + 1,
          };
        }
        return header;
      });
    } else {
      settings.headers = settings.headers.map((header: Header) => {
        if (header.value === field) {
          return {
            ...header,
            hasSortableIcon: false,
            sortDirection: '',
            sortOrderNumber: 0,
          };
        }
        return header;
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
      (useApiSorting && isPaginationModeEnabled && useCustomPagination) ||
      !useApiSorting
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
    sortedData,
  };
};
