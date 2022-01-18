import { Settings, SortedItem } from '@/types';

enum Operator {
  EQUAL = '=',
  BIGGER = '>',
  BIGGER_THAN = '>=',
  LESS = '<',
  LESS_THAN = '<=',
}

type AvailableOperators = keyof Record<Operator, string>;

type OperatorToFunctionType = {
  [key in AvailableOperators]: (num1: string, num2: string) => boolean;
};

/**
 * Add classes for item if condition is passed.
 * @param {Settings} settings
 */
export const useRowClassesHook = (settings: Settings) => {
  const operatorToFunction: OperatorToFunctionType = {
    [Operator.BIGGER]: (num1: string, num2: string) => +num1 > +num2,
    [Operator.BIGGER_THAN]: (num1: string, num2: string) => +num1 >= +num2,
    [Operator.LESS]: (num1: string, num2: string) => +num1 < +num2,
    [Operator.LESS_THAN]: (num1: string, num2: string) => +num1 <= +num2,
    [Operator.EQUAL]: (num1: string, num2: string) => num1 === num2,
  };

  const findOperator = (str: string) => {
    const [operator] = str
      .split('')
      .filter((ch) => Object.values(Operator).includes(ch as Operator));
    return operator as AvailableOperators;
  };

  const executeOperation = (str: string) => {
    const operationStr = str.replace(/[ ]/g, '');
    const operator = findOperator(operationStr);
    const [num1, num2] = operationStr.split(operator);
    return operatorToFunction[operator](num1, num2);
  };

  /**
   * Apply row classes by reading style property from header item.
   *
   * @param {SortedItem} item
   */
  const getRowClasses = (item: SortedItem) => {
    const classes: string[] = [];
    Object.keys(item).forEach((key) => {
      const header = settings.headers.find((header) => header.value === key);
      if (header?.style) {
        const itemValue = item[header.value];
        const expectedItemValue = header.style.expectedValue;
        const condition = header.style.condition;
        if (!itemValue || !expectedItemValue || !condition) return;
        const isValid = executeOperation(`${itemValue} ${condition} ${expectedItemValue}`);
        if (isValid) {
          const className = Array.isArray(header.style.className)
            ? header.style.className.join(' ')
            : header.style.className;
          classes.push(className);
        }
      }
    });
    return classes.join(' ');
  };

  return {
    getRowClasses,
  };
};
