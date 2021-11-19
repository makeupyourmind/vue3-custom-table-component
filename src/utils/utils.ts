import { ASC } from '@/constants';
import { SortableField } from '@/types';

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

export function dynamicSort(property: string) {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    // eslint-disable-next-line no-param-reassign
    property = property.substr(1);
  }
  return function (a: { [key: string]: number }, b: { [key: string]: number }) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
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
  return function (obj1: { [key: string]: number }, obj2: { [key: string]: number }) {
    const numberOfProperties = props.length;
    let i = 0,
      result = 0;
    /* try getting a different result from 0 (equal)
     * as long as we have extra properties to compare
     */
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i += 1;
    }
    return result;
  };
}
