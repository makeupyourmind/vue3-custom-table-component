import { Column } from '@/types';
import { MIN_SIZE_OF_COLUMN, MIN_WIDTH_OF_SELECTABLE_FIELD } from '@/constants';
import { fillGridTemplateSizeForHeaderItem } from '@/utils/utils';
import { useTableMutationObserverHook } from '@/hooks/use-table-mutation-observer.hook';

export const VueColumnsResizable = (el: HTMLElement) => {
  const gridTemplateSizesAccumulator: string[] = [];
  const nodeName = el.nodeName;
  if (['TABLE', 'THEAD'].indexOf(nodeName) < 0) return;

  const thead: HTMLElement | null = el.querySelector('thead');
  const tableContainer = document.querySelector<HTMLElement>('.v-container');
  if (!thead) return;
  const ths = thead.querySelectorAll('th'); // header items
  const headerHasSelectableField = thead.querySelector('.v-table__header__item--selectable');

  // The max (fr) values for grid-template-columns
  const columnTypeToRatioMap: { [key: string]: number } = {
    'number': 1,
    'text-short': 1.67,
    'text-long': 3.33,
  };

  /*
      The following will soon be filled with column objects containing
      the header element and their size value for grid-template-columns
    */
  let columns: Column[] = [];
  let headerBeingResized: HTMLElement | null;

  /**
   * Apply grid template columns style for thead and
   * every tbody tr (add grid-template-columns style).
   *
   * @param {Array} sizes - Array of sizes.
   */
  const applyGridStylesForTable = (sizes: string[]) => {
    thead.style.gridTemplateColumns = sizes.join(' ');
    const tbodyTrs = el.querySelectorAll<HTMLElement>('tbody tr'); // tr content
    tbodyTrs.forEach((tr) => {
      tr.style.gridTemplateColumns = sizes.join(' ');
    });
  };

  const onMouseMove = (e: MouseEvent) =>
    requestAnimationFrame(() => {
      const horizontalScrollOffset = document.documentElement.scrollLeft;
      const headerBeingResizedOffsetLeft =
        headerHasSelectableField && tableContainer?.scrollLeft === 0
          ? MIN_WIDTH_OF_SELECTABLE_FIELD
          : 0;
      const width = horizontalScrollOffset + e.clientX - headerBeingResizedOffsetLeft;
      // Update the column object with the new size value
      const column = columns.find(({ header }) => header === headerBeingResized);
      if (!column) return;
      column.size = Math.max(MIN_SIZE_OF_COLUMN, width) + 'px'; // Enforce our minimum

      const minAllowedWidth = column.customMinSize
        ? parseInt(column.customMinSize)
        : MIN_SIZE_OF_COLUMN;

      if (width < Math.max(minAllowedWidth, parseInt(column.size))) return;
      // For the other headers which don't have a set width, fix it to their computed width
      columns.forEach((column) => {
        if (column.size.startsWith('minmax')) {
          // isn't fixed yet (it would be a pixel value otherwise)
          column.size = parseInt(`${column.header.clientWidth}`, 10) + 'px';
        }
      });

      /*
        Update the column sizes
        Reminder: grid-template-columns sets the width for all columns in one value
        */
      const gridTemplateColumns = columns.map((column) => column.size);

      // set width style for header.
      (column.header as HTMLElement).style.width = `${width}px`;

      applyGridStylesForTable(gridTemplateColumns);
    });

  // Clean up event listeners, classes, etc.
  const onMouseUp = () => {
    // console.log('onMouseUp');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    const headerCellIndex = (headerBeingResized as HTMLTableCellElement).cellIndex;
    document.querySelectorAll('.v-table__body tr').forEach((tableRow) => {
      tableRow.children[headerCellIndex].classList.remove('header--being-resized');
    });
    headerBeingResized && headerBeingResized.classList.remove('header--being-resized');
    headerBeingResized = null;
  };

  // Get ready, they're about to resize
  const initResize = (e: MouseEvent) => {
    if (!e.target) return;
    headerBeingResized = (e.target as HTMLElement).parentNode as HTMLElement;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    const headerCellIndex = (headerBeingResized as HTMLTableCellElement).cellIndex;
    // every row cell that has being resized has related class
    document.querySelectorAll('.v-table__body tr').forEach((tableRow) => {
      tableRow.children[headerCellIndex].classList.add('header--being-resized');
    });
    headerBeingResized && headerBeingResized.classList.add('header--being-resized');
  };

  const theadGridTemplateColumns = thead.style.gridTemplateColumns.split(' ').filter((v) => !!v);

  const handleTableTrs = (ths: NodeListOf<HTMLTableCellElement>) => {
    ths.forEach((header: HTMLElement, idx: number) => {
      const { useCustomWidth } = fillGridTemplateSizeForHeaderItem(
        header,
        gridTemplateSizesAccumulator,
        ths.length
      );

      // This part set actual header (th) width when template has been updated.
      if (theadGridTemplateColumns.length) {
        header.style.width = `${theadGridTemplateColumns[idx]}`;
      }

      const max = (header.dataset.type ? columnTypeToRatioMap[header.dataset.type] : 1) + 'fr';
      columns.push({
        header,
        customSize: useCustomWidth ? header.style.width : undefined,
        customMinSize: useCustomWidth ? header.style.minWidth : undefined,
        // The initial size value for grid-template-columns:
        size: `minmax(${MIN_SIZE_OF_COLUMN}px, ${max})`,
      });

      const headerHasResizeHandler = header.querySelector<HTMLElement>('.resize-handle');

      if (headerHasResizeHandler) {
        headerHasResizeHandler.addEventListener('mousedown', initResize);
      }
    });
  };

  handleTableTrs(ths);

  // Apply custom width on initial setup
  if (theadGridTemplateColumns.length === 0) {
    applyGridStylesForTable(gridTemplateSizesAccumulator);
  } else {
    // Apply custom width in the case when template has been updated (click on header or some a new record has been added)
    applyGridStylesForTable(theadGridTemplateColumns);
  }

  // Observation table changes. Table thead resize
  useTableMutationObserverHook(el, (mutationList: MutationRecord[]) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'style' &&
        (mutation.target as HTMLElement).localName === 'thead'
      ) {
        columns = [];
        handleTableTrs(thead.querySelectorAll('th'));
      }
    }
  });
};
