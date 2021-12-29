import { fillGridTemplateSizeForHeaderItem, dynamicSort, insertAfter } from '@/utils/utils';
import { useTableMutationObserverHook } from '@/hooks/use-table-mutation-observer.hook';
import { FixedColumnDictionary } from '@/types';

export const useSetupFixedColumnsHook = (table: HTMLElement) => {
  /**
   * Create dictionary/
   * @return {Record<string, FixedColumnDictionary>} - Dictionary object.
   */
  const createDictionary = (): Record<string, FixedColumnDictionary> => {
    return {};
  };

  /**
   * Apply left ident for dictionary elements.
   * @param sortedRecords
   */
  const applyLeftIndentForElementsFromDictionary = <D extends FixedColumnDictionary>(
    sortedRecords: D[]
  ) => {
    sortedRecords.forEach((item) => {
      item.htmlElement.style.left = `${item.leftWidth}px`;
    });
  };

  /**
   * Fill dictionary.
   * @param {NodeListOf<ChildNode>} array - Array of ChildNode.
   * @param {Record<string, FixedColumnDictionary>} dictionary - Dictionary.
   */
  const fillDictionary = (
    array: NodeListOf<ChildNode>,
    dictionary: Record<string, FixedColumnDictionary>
  ) => {
    [...array]
      .filter((el) => (el as HTMLElement).classList?.value.includes('fixed-side'))
      .forEach((entity, idx: number, arr: ChildNode[]) => {
        const currentHtmlEl = entity as HTMLElement;
        const elementWidth = (arr[idx] as HTMLElement).offsetWidth;
        dictionary[currentHtmlEl.classList.value] = {
          htmlElement: currentHtmlEl,
          elementWidth,
          leftWidth: 0,
          newPosition: 0,
        };

        const previousHtmlElement = arr[idx - 1] as HTMLElement;
        if (previousHtmlElement && dictionary[previousHtmlElement.classList.value]) {
          dictionary[currentHtmlEl.classList.value].newPosition =
            dictionary[previousHtmlElement.classList.value].newPosition + 1;
        }

        const previousDictionaryEl = dictionary[previousHtmlElement?.classList.value];
        dictionary[currentHtmlEl.classList.value] = {
          ...dictionary[currentHtmlEl.classList.value],
          leftWidth: previousDictionaryEl
            ? previousDictionaryEl.leftWidth + previousDictionaryEl.elementWidth
            : 0,
        };
      });
  };

  /**
   * Sort dictionary by field new position ascending
   * @param {FixedColumnDictionary} dictionary - Dictionary list.
   */
  const sortDictionaryByNewPositionAscending = <D extends Record<string, FixedColumnDictionary>>(
    dictionary: D
  ): FixedColumnDictionary[] => {
    return Object.values(dictionary).sort(dynamicSort('newPosition'));
  };

  /**
   * Inset html elements from dictionary in document
   * @param {FixedColumnDictionary} dictionary - Dictionary elements.
   */
  const insertElementsFromDictionary = <D extends FixedColumnDictionary>(dictionary: D[]) => {
    dictionary.forEach((entityWithFixedSide) => {
      if (entityWithFixedSide.htmlElement.parentNode?.childNodes[entityWithFixedSide.newPosition]) {
        insertAfter(
          entityWithFixedSide.htmlElement.parentNode.childNodes[entityWithFixedSide.newPosition],
          entityWithFixedSide.htmlElement
        );
      }
    });
  };

  const setupFixedHeaders = () => {
    const headerDictionary = createDictionary();
    const theadTrs = table.querySelector('thead tr')?.childNodes;

    if (!theadTrs?.length) return;

    fillDictionary(theadTrs, headerDictionary);
    const sortedDictionary = sortDictionaryByNewPositionAscending(headerDictionary);
    insertElementsFromDictionary(sortedDictionary);

    applyLeftIndentForElementsFromDictionary(sortedDictionary);
  };

  const setupFixedRows = () => {
    const nodes = table.querySelectorAll('tbody tr');
    nodes.forEach((node) => {
      const rowsDictionary: Record<string, FixedColumnDictionary> = {};
      fillDictionary(node.childNodes, rowsDictionary);
      const sortedDictionary = sortDictionaryByNewPositionAscending(rowsDictionary);
      insertElementsFromDictionary(sortedDictionary);

      applyLeftIndentForElementsFromDictionary(sortedDictionary);
    });
  };

  const setupChangedFixedRows = (nodeList: NodeList) => {
    nodeList.forEach((node) => {
      const rowsDictionary = createDictionary();
      fillDictionary(node.childNodes, rowsDictionary);
      insertElementsFromDictionary(Object.values(rowsDictionary));

      fillDictionary(node.childNodes, rowsDictionary);
      const sortedDictionary = sortDictionaryByNewPositionAscending(rowsDictionary);
      applyLeftIndentForElementsFromDictionary(sortedDictionary);
    });
  };

  setupFixedHeaders();
  setupFixedRows();

  // recalculate table grid template column style after setup fixed items
  const thead = table.querySelector('thead') ?? table;
  const gridTemplateSizesAccumulator: string[] = [];
  const ths = thead.querySelectorAll('th'); // header items
  ths.forEach((header: HTMLElement) => {
    fillGridTemplateSizeForHeaderItem(header, gridTemplateSizesAccumulator, ths.length);
  });

  thead.style.gridTemplateColumns = gridTemplateSizesAccumulator.join(' ');

  const tbodyTrs = table.querySelectorAll<HTMLElement>('tbody tr'); // tr content
  tbodyTrs.forEach((tr) => {
    tr.style.gridTemplateColumns = gridTemplateSizesAccumulator.join(' ');
  });

  // Handle table mutation. A new record has been added either header has being resized
  useTableMutationObserverHook(table, (mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'style' &&
        (mutation.target as HTMLElement).localName === 'thead'
      ) {
        // update headers and columns left position
        setupFixedHeaders();
        setupFixedRows();
      }

      if (mutation.type === 'childList' && (mutation.target as HTMLElement).localName === 'tbody') {
        setupChangedFixedRows(mutation.addedNodes);
      }
    }
  });
};
