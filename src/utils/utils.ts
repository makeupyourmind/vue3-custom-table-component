import { ref, Ref } from 'vue';

import { ASC, MIN_SIZE_OF_COLUMN } from '@/constants';
import { GeneralObject, SortableField } from '@/types';

/**
 * Get sortable fields in array format like ['field', '-field'].
 * If `-field` - desc, otherwise - asc.
 *
 * @param {SortableField[]} sortableFields - Array of sortable fields.
 * @return {Array<string>} - Sortable fields with sorting sign.
 */
export function transformToFieldsWithSortingSign(sortableFields: SortableField[]): Array<string> {
  return sortableFields.map((sortableField) => {
    const { field, order } = sortableField;
    return order === ASC ? field : `-${field}`;
  });
}

/**
 * Sort array of objects by property key.
 *
 * @param {string} property - Property name.
 */
export function dynamicSort<T, R extends Extract<keyof T, string>, Key extends R | `-${R}`>(
  property: Key
) {
  let sortOrder = 1;
  let prop = property as R;
  if (property[0] === '-') {
    sortOrder = -1;
    prop = property.substr(1) as R;
  }
  return function (a: T, b: T) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result = a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0;
    return result * sortOrder;
  };
}

export function dynamicSortMultiple(...arg: string[]) {
  /*
   * save the arguments object as it will be overwritten
   * note that arguments object is an array-like object
   * consisting of the names of the properties to sort by
   */
  const props = arg;
  return function (obj1: GeneralObject, obj2: GeneralObject) {
    const numberOfProperties = props.length;
    let i = 0,
      result = 0;
    /* try getting a different result from 0 (equal)
     * as long as we have extra properties to compare
     */
    while (result === 0 && i < numberOfProperties) {
      const prop = props[i] as never;
      result = dynamicSort(prop)(obj1, obj2);
      i += 1;
    }
    return result;
  };
}

/**
 * Get index of searching object.
 *
 * @param {Object} obj - The object that looking for.
 * @param {Array} list - The array in which looking for needed object.
 */
export function findObjectIndex(list: GeneralObject[], obj: GeneralObject) {
  let i;
  for (i = 0; i < list.length; i++) {
    if (deepObjectEqual(list[i], obj)) {
      return i;
    }
  }

  return -1;
}

/**
 * Deep object comparison.
 *
 * @param {GeneralObject} object1 - Object tp compare.
 * @param {GeneralObject} object2 - Object tp compare.
 * @return {boolean} - Equals objects or not.
 */
export function deepObjectEqual(object1: GeneralObject, object2: GeneralObject) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepObjectEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if passed parameter is an object.
 *
 * @param {unknown} object - Parameter that should be checked.
 * @return {boolean} - True or false.
 */
export function isObject(object: unknown): object is object {
  return object != null && typeof object === 'object';
}

/**
 * Insert node after referenceNode.
 *
 * @param {HTMLElement} referenceNode - Reference node, after which need to insert a new node.
 * @param {Node} newNode - A new node.
 */
export function insertAfter(referenceNode: Node, newNode: Node) {
  if (referenceNode.parentNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
}

/**
 * Split array into chunks.
 *
 * @param {Array} arr - Array that need to be split by chunks.
 * @param {Number} chunkSize - Size of chunk.
 */
export function sliceIntoChunks<T>(arr: T[], chunkSize = 10) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

/**
 * Debounce function to delay execution.
 *
 * @param {Function} func - Function that should be delayed.
 * @param {number} timeout - Timeout.
 */
export function debounce(func: (...args: unknown[]) => void, timeout = 500) {
  let timer: number;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

/**
 * Fill accumulator the sizes of header items.
 *
 * @param headerItem
 * @param gridTemplateSizesAccumulator
 * @param headerLength
 */
export function fillGridTemplateSizeForHeaderItem(
  headerItem: HTMLElement,
  gridTemplateSizesAccumulator: string[],
  headerLength: number
) {
  const isHeaderHasCheckbox = [...headerItem.classList].includes(
    'v-table__header__item--selectable'
  );
  const headerStyles = headerItem.style;
  const useCustomWidth = headerStyles[0] === 'width';

  if (gridTemplateSizesAccumulator.length !== headerLength) {
    if (isHeaderHasCheckbox) {
      const size = useCustomWidth ? headerStyles.width : 'auto';
      gridTemplateSizesAccumulator.push(size);
    } else if (useCustomWidth) {
      gridTemplateSizesAccumulator.push(`minmax(${headerStyles.width}, ${headerStyles.width})`);
    } else {
      gridTemplateSizesAccumulator.push(`minmax(${MIN_SIZE_OF_COLUMN}px, 1fr)`);
    }
  }

  return {
    useCustomWidth,
  };
}

/**
 * Calculate style width unit.
 *
 * @param {string} width - Element width.
 * @return {Array} - Actual element width and width unit (like 'px', 'rem' or etc.).
 */
export function extractStyleWidthValueWithUnit(width: string) {
  const unit = width.match(/[0-9]*\.?[0-9]+(px|rem)?/i)?.[1] || 'px';
  const size = width.split(unit)[0];
  return [size, unit];
}

/**
 * Convert size of selectable column to correct size with correct unit.
 *
 * @param {Ref<string>} sizeOfSelectableColumn - Default selectable column width.
 * @param {Array} propsSelectWidthValueWithUnit - Props select width with correct unit.
 */
export function calculateSizeOfSelectableColumnWithCorrectUnit(
  sizeOfSelectableColumn: Ref<string>,
  propsSelectWidthValueWithUnit: string[]
) {
  if (sizeOfSelectableColumn.value.includes(propsSelectWidthValueWithUnit[1])) {
    return sizeOfSelectableColumn;
  }
  if (propsSelectWidthValueWithUnit[1] === 'rem') {
    const value = parseInt(sizeOfSelectableColumn.value) / 16;
    return ref(`${value}rem`);
  }
  return sizeOfSelectableColumn;
}
