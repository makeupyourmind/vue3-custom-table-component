import { ASC, MIN_SIZE_OF_COLUMN } from '@/constants';
import { GeneralObject, SortableField } from '@/types';

/**
 * Get sortable fields in array format like ['field', '-field'].
 * If `-field` - desc, otherwise - asc.
 *
 * @param {Array} sortableFields - Array of sortable fields.
 * @return {*}
 */
export function transformToFieldsWithSortingSign(sortableFields: SortableField[]) {
  return sortableFields.map((sortableField) => {
    const { field, order } = sortableField;
    return order === ASC ? field : `-${field}`;
  });
}

/**
 * Transform field order to SQL format. Like asc|desc.
 *
 * @param {Array} sortableFields - Sortable fields.
 * @return {Array} - Sortable fields with order field in sql format.
 */
export function transformSortableFieldsOrderToSqlFormat(sortableFields: SortableField[]) {
  return sortableFields.map((sortableField) => {
    return {
      ...sortableField,
      order: sortableField.order === ASC ? 'asc' : 'desc',
    };
  });
}

export function dynamicSort<T, Key extends Extract<keyof T, string>>(property: Key) {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    // eslint-disable-next-line no-param-reassign
    property = property.substr(1) as Key;
  }
  return function (a: T, b: T) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

export function dynamicSortMultiple<T>(...arg: string[]) {
  /*
   * save the arguments object as it will be overwritten
   * note that arguments object is an array-like object
   * consisting of the names of the properties to sort by
   */
  const props = arg;
  return function (obj1: T, obj2: T) {
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
    if (list[i] === obj) {
      return i;
    }
  }

  return -1;
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
  const isHeaderHasCheckbox = [...headerItem.classList].includes('v-table__header--selectable');
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
