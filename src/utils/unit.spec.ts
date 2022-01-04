import { isObject } from './utils';

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
