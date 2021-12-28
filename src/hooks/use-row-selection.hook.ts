import { computed, ComputedRef } from 'vue';

import { Item, SortedItem } from '@/types';
import { findObjectIndex } from '@/utils/utils';

export const useRowSelection = (
  props: any,
  context: any,
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

    sortedData.value.forEach((item: SortedItem) => {
      item.settings.isChecked = !flag;
    });
  };

  const onCheckboxChange = (newItem: Item) => {
    const indexOfItem = findObjectIndex(props.modelValue, newItem);
    const modelValue = [...props.modelValue];

    const toggledItemIndex = findObjectIndex(sortedData.value, newItem);
    sortedData.value[toggledItemIndex].settings.isChecked =
      !sortedData.value[toggledItemIndex].settings.isChecked;

    if (indexOfItem !== -1) {
      modelValue.splice(indexOfItem, 1);
      updateSelectedItems(modelValue);
      return;
    }
    // If single select is enabled allow to select only one item
    const selectedItems = props.singleSelect ? [newItem] : modelValue.concat(newItem);
    updateSelectedItems(selectedItems);
  };

  const updateSelectedItems = (value: Item[]) => {
    context.emit('update:modelValue', value);
  };

  return {
    selectAllCheckboxes,
    onCheckboxChange,
    markedAllCheckboxes,
    isSomeCheckboxUnMarked,
  };
};
