import { computed, ComputedRef, EmitsOptions } from 'vue';
import { SetupContext } from '@vue/runtime-core';

import { SortedItem, VTableComponentProps } from '@/types';
import { findObjectIndex } from '@/utils/utils';

export const useRowSelection = <E extends EmitsOptions>(
  props: VTableComponentProps,
  context: SetupContext<E>,
  { sortedData }: { sortedData: ComputedRef<SortedItem[]> }
) => {
  const markedAllCheckboxes = computed(() => {
    return sortedData.value.length === props.modelValue.length;
  });

  const isSomeCheckboxUnMarked = computed(() => {
    if (!props.modelValue.length) return false;
    return !markedAllCheckboxes.value;
  });

  const selectAllCheckboxes = (flag: boolean) => {
    const value = markedAllCheckboxes.value ? [] : sortedData.value;
    updateSelectedItems(value);

    sortedData.value.forEach((sortedItem: SortedItem) => {
      sortedItem.itemSettings.isChecked = !flag;
    });
  };

  const onCheckboxChange = (newItem: SortedItem) => {
    const modelValue = [...props.modelValue];
    const indexOfItem = findObjectIndex(modelValue, newItem);

    const toggledItemIndex = findObjectIndex(sortedData.value, newItem);
    sortedData.value[toggledItemIndex].itemSettings.isChecked =
      !sortedData.value[toggledItemIndex].itemSettings.isChecked;

    if (indexOfItem !== -1) {
      modelValue.splice(indexOfItem, 1);
      updateSelectedItems(modelValue);
      return;
    }
    // If single select is enabled allow to select only one item
    const value = props.singleSelect ? [newItem] : modelValue.concat(newItem);
    updateSelectedItems(value);
  };

  const updateSelectedItems = (selectedItems: SortedItem[]) => {
    context.emit('update:modelValue', selectedItems);
  };

  return {
    selectAllCheckboxes,
    onCheckboxChange,
    markedAllCheckboxes,
    isSomeCheckboxUnMarked,
  };
};
