import { computed, ComputedRef } from 'vue';
import { SelectedItem } from '@/types';

export const useRowSelection = (
  props: { [key: string]: any },
  context: any,
  { sortedData }: { sortedData: ComputedRef<[]> }
) => {
  const markedAllCheckboxes = computed(() => {
    return sortedData.value.length === props.modelValue.length;
  });

  const isSomeCheckboxUnMarked = computed(() => {
    if (!props.modelValue.length) return false;
    return !markedAllCheckboxes.value;
  });

  const selectAllCheckboxes = () => {
    const value = markedAllCheckboxes.value ? [] : sortedData.value;
    updateSelectedItems(value);
  };

  const onCheckboxChange = (newItem: SelectedItem) => {
    const indexOfItem = props.modelValue.findIndex(
      (item: SelectedItem) => item.name === newItem.name
    );
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

  const updateSelectedItems = (value: SelectedItem[]) => {
    context.emit('update:modelValue', value);
  };

  const isMarkedCheckbox = (item: SelectedItem) => {
    return !!props.modelValue.find((el: SelectedItem) => el.name === item.name);
  };

  return {
    selectAllCheckboxes,
    onCheckboxChange,
    isMarkedCheckbox,
    markedAllCheckboxes,
    isSomeCheckboxUnMarked,
  };
};
