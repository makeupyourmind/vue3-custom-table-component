import { computed } from 'vue';

export const useRowSelection = (props, context, { sortedData }) => {
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

  const onCheckboxChange = (newItem) => {
    const indexOfItem = props.modelValue.findIndex((item) => item.name === newItem.name);
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

  const updateSelectedItems = (value) => {
    context.emit('update:modelValue', value);
  };

  const isMarkedCheckbox = (item) => {
    return !!props.modelValue.find((el) => el.name === item.name);
  };

  return {
    selectAllCheckboxes,
    onCheckboxChange,
    isMarkedCheckbox,
    markedAllCheckboxes,
    isSomeCheckboxUnMarked,
  };
};
