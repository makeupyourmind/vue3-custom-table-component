import { Settings, SortedItem } from '@/types';
enum Operator {
  '=' = '=',
  '>' = '>',
  '>=' = '>=',
  '<' = '<',
  '<=' = '<=',
}
type AvailableOperators = keyof typeof Operator;
/**
 * Add classes for item if condition is passed.
 * @param {Settings} settings
 */
export const useRowClassesHook = (settings: Settings) => {
  const operatorToFunction = {
    '>': (num1: string, num2: string) => +num1 > +num2,
    '>=': (num1: string, num2: string) => +num1 >= +num2,
    '<': (num1: string, num2: string) => +num1 < +num2,
    '<=': (num1: string, num2: string) => +num1 <= +num2,
    '=': (num1: string, num2: string) => num1 === num2,
  };

  const findOperator = (str: string) => {
    const [operator] = str
      .split('')
      .filter((ch) =>
        [Operator['<'], Operator['='], Operator['>'], Operator['<='], Operator['>=']].includes(
          ch as Operator
        )
      );
    return operator as AvailableOperators;
  };

  const executeOperation = (str: string) => {
    const operationStr = str.replace(/[ ]/g, '');
    const operator = findOperator(operationStr);
    const [num1, num2] = operationStr.split(operator);
    return operatorToFunction[operator](num1, num2);
  };

  const getRowClasses = (item: SortedItem) => {
    const styles: string[] = [];
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
          styles.push(className);
        }
      }
    });
    return styles.join(' ');
  };

  return {
    getRowClasses,
  };
};
