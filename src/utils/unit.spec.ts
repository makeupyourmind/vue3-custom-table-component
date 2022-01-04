import { ASC, DESC } from '../constants';

import {
  deepObjectEqual,
  dynamicSort,
  dynamicSortMultiple,
  extractStyleWidthValueWithUnit,
  findObjectIndex,
  isObject,
  transformToFieldsWithSortingSign,
} from './utils';

describe('Utils', () => {
  describe('transformToFieldsWithSortingSign', () => {
    test('should return array with sorting sing fields', () => {
      const sortableFields = [
        { order: ASC, field: 'name' },
        { order: DESC, field: 'price' },
      ];

      const result = ['name', '-price'];
      expect(transformToFieldsWithSortingSign(sortableFields)).toEqual(result);
    });
  });

  describe('dynamicSort', () => {
    const peoples = [
      { name: 'Name', surname: 'Surname' },
      { name: 'AAA', surname: 'ZZZ' },
      { name: 'Name', surname: 'AAA' },
    ];

    test('should sort array of objects by name property', () => {
      const result = [
        { name: 'AAA', surname: 'ZZZ' },
        { name: 'Name', surname: 'Surname' },
        { name: 'Name', surname: 'AAA' },
      ];

      expect(peoples.sort(dynamicSort('name'))).toEqual(result);
    });

    test('should sort array of objects by surname property', () => {
      const result = [
        { name: 'AAA', surname: 'ZZZ' },
        { name: 'Name', surname: 'Surname' },
        { name: 'Name', surname: 'AAA' },
      ];

      expect(peoples.sort(dynamicSort('-surname'))).toEqual(result);
    });
  });

  describe('dynamicSortMultiple', () => {
    const peoples = [
      { name: 'Name', surname: 'Surname' },
      { name: 'AAA', surname: 'ZZZ' },
      { name: 'Name', surname: 'AAA' },
    ];

    test('should sort array of objects by name ascending and by surname descending', () => {
      const result = [
        { name: 'AAA', surname: 'ZZZ' },
        { name: 'Name', surname: 'Surname' },
        { name: 'Name', surname: 'AAA' },
      ];

      expect(peoples.sort(dynamicSortMultiple('name', '-surname'))).toEqual(result);
    });

    test('should sort array of objects by name descending and by surname descending', () => {
      const result = [
        { name: 'Name', surname: 'Surname' },
        { name: 'Name', surname: 'AAA' },
        { name: 'AAA', surname: 'ZZZ' },
      ];

      expect(peoples.sort(dynamicSortMultiple('-name', '-surname'))).toEqual(result);
    });
  });

  describe('isObject', () => {
    test('should return true - object', () => {
      expect(isObject({})).toBeTruthy();
    });

    test('should return false - string', () => {
      expect(isObject('some string')).toBeFalsy();
    });

    test('should return false - number', () => {
      expect(isObject(3)).toBeFalsy();
    });

    test('should return false - boolean', () => {
      expect(isObject(false)).toBeFalsy();
    });

    test('should return false - null', () => {
      expect(isObject(null)).toBeFalsy();
    });
  });

  describe('findObjectIndex', () => {
    test('should return -1', () => {
      const list = [{ name: 'some name' }, { name: 'some second name' }];
      const searchingObject = { name: 'name' };

      expect(findObjectIndex(list, searchingObject)).toBe(-1);
    });

    test('should return 0', () => {
      const list = [{ name: 'some name' }, { name: 'some second name' }];
      const searchingObject = { name: 'some name' };

      expect(findObjectIndex(list, searchingObject)).toBe(0);
    });

    test('should return 1', () => {
      const list = [{ name: 'some name' }, { name: 'some second name' }];
      const searchingObject = { name: 'some second name' };

      expect(findObjectIndex(list, searchingObject)).toBe(1);
    });
  });

  describe('deepObjectEqual', () => {
    test('should return false. 1 level of object', () => {
      const obj1 = { name: 'developer', age: 25 };
      const obj2 = { name: 'developer', age: 24 };

      expect(deepObjectEqual(obj1, obj2)).toBeFalsy();
    });

    test('should return false. 2 level of object', () => {
      const obj1 = { name: 'developer', age: 24, level: { someProperty: 2 } };
      const obj2 = { name: 'developer', age: 24, level: { someProperty: 1 } };

      expect(deepObjectEqual(obj1, obj2)).toBeFalsy();
    });

    test('should return true. 1 level of object', () => {
      const obj1 = { name: 'developer', age: 24 };
      const obj2 = { name: 'developer', age: 24 };

      expect(deepObjectEqual(obj1, obj2)).toBeTruthy();
    });

    test('should return true. 2 level of object', () => {
      const obj1 = { name: 'developer', age: 24, level: { someProperty: 1 } };
      const obj2 = { name: 'developer', age: 24, level: { someProperty: 1 } };

      expect(deepObjectEqual(obj1, obj2)).toBeTruthy();
    });
  });

  describe('extractStyleWidthValueWithUnit', () => {
    test('should extract cortege of style width and style unit (px)', () => {
      expect(extractStyleWidthValueWithUnit('150px')).toEqual(['150', 'px']);
    });

    test('should extract cortege of style width and style unit(rem)', () => {
      expect(extractStyleWidthValueWithUnit('150rem')).toEqual(['150', 'rem']);
    });
  });
});
