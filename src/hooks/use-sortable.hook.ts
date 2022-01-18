import { computed, Ref, reactive, ComputedRef, EmitsOptions, onMounted } from 'vue';
import { SetupContext } from '@vue/runtime-core';

import { ASC, DESC, SORT_DOWN, SORT_UP } from '@/constants';
import { dynamicSortMultiple, transformToFieldsWithSortingSign } from '@/utils/utils';
import {
  Header,
  TableItem,
  SortableField,
  VTableComponentProps,
  SortedItem,
  Settings,
} from '@/types';

export const useSortable = <E extends EmitsOptions>(
  props: VTableComponentProps,
  context: SetupContext<E>,
  {
    currentPage,
    settings,
  }: {
    currentPage: Ref<number>;
    settings: Settings;
  }
) => {
  const sortableFields: SortableField[] = reactive([]);

  // Apply default sort for some specific column.
  onMounted(() => {
    settings.headers
      .filter((header: Header) => header.defaultSort)
      .map(({ value, defaultSort }) => ({ value, defaultSort }))
      .forEach((item) => {
        doSort(item.value, item.defaultSort?.toUpperCase());
      });
  });

  const doSort = (field: string, sortDirection = ASC) => {
    const sortableFieldIdx = sortableFields.findIndex(
      (sortableField) => sortableField.field === field
    );

    if (sortableFieldIdx !== -1) {
      const sortableFieldByIndex = sortableFields[sortableFieldIdx];
      sortableFieldByIndex.order === ASC
        ? (sortableFieldByIndex.order = DESC)
        : sortableFields.splice(sortableFieldIdx, 1);
    } else {
      sortableFields.push({
        field,
        order: sortDirection,
      });
    }

    const sortableField = sortableFields.find((sortableField) => sortableField.field === field);
    if (sortableField) {
      const maxSortOrderNumber = Math.max(
        ...settings.headers.map((header: Header) => header.sortOrderNumber || 0)
      );

      settings.headers = settings.headers.map((header: Header) => {
        if (header.value === field) {
          const sortDirection = sortableField.order === ASC ? SORT_UP : SORT_DOWN;
          return {
            ...header,
            hasSortableIcon: true,
            sortDirection,
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
      context.emit('handle-api-sorting', sortableFields);
    }
  };

  const sliceArrayForPagination = <T>(array: T[]): T[] => {
    return [...array].slice(
      Math.max(0, (currentPage.value - 1) * props.paginationOptions.perPage),
      props.paginationOptions.perPage * currentPage.value
    );
  };

  const sortedData: ComputedRef<SortedItem[]> = computed(() => {
    const { useApiSorting, isPaginationModeEnabled } = props;
    const { items } = settings;
    const modifiedItems = items.map((el: TableItem | SortedItem) => {
      el.itemSettings = Object.prototype.hasOwnProperty.call(el, 'itemSettings')
        ? el.itemSettings
        : {};
      return el as SortedItem;
    });
    // check if user wants to use custom pagination
    const useCustomPagination = !!context.slots.pagination;

    if (
      (isPaginationModeEnabled && useCustomPagination) ||
      (useApiSorting && isPaginationModeEnabled && useCustomPagination) ||
      !useApiSorting
    ) {
      return modifiedItems;
    }

    if (
      (isPaginationModeEnabled && !useCustomPagination) ||
      (useApiSorting && isPaginationModeEnabled && !useCustomPagination)
    ) {
      return sliceArrayForPagination(modifiedItems).sort(
        dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields))
      );
    }

    return modifiedItems.sort(
      dynamicSortMultiple(...transformToFieldsWithSortingSign(sortableFields))
    );
  });

  return {
    doSort,
    sortedData,
  };
};
