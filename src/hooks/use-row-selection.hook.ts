import { computed, ComputedRef, reactive, watch } from 'vue';

import { Item } from '@/types';
import { findObjectIndex } from '@/utils/utils';

export const useRowSelection = (
  props: any,
  context: any,
  { sortedData }: { sortedData: ComputedRef<Item[]> }
) => {
  const checkboxesState = reactive(new Map());

  watch(
    sortedData,
    (currentSortedData) => {
      currentSortedData.forEach((data) => {
        const value = checkboxesState.get(data) !== undefined ? checkboxesState.get(data) : false;
        checkboxesState.set(data, value);
      });
    },
    {
      immediate: true,
    }
  );

  const markedAllCheckboxes = computed(() => {
    return sortedData.value.length === props.modelValue.length;
  });

  const isSomeCheckboxUnMarked = computed(() => {
    if (!props.modelValue.length) return false;
    return !markedAllCheckboxes.value;
  });

  const selectAllCheckboxes = (flag: boolean) => {
    const value = markedAllCheckboxes.value ? [] : sortedData.value;
    for (const key of checkboxesState.keys()) {
      checkboxesState.set(key, !flag);
    }
    updateSelectedItems(value);
  };

  const onCheckboxChange = (newItem: Item) => {
    const checkboxState = checkboxesState.get(newItem);
    checkboxesState.set(newItem, !checkboxState);

    const indexOfItem = findObjectIndex(props.modelValue, newItem);
    const modelValue = [...props.modelValue];
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
    checkboxesState,
  };
};
