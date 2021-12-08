import { Column } from '@/types';

export const VueColumnsResizable = (el: HTMLElement) => {
  const nodeName = el.nodeName;
  if (['TABLE', 'THEAD'].indexOf(nodeName) < 0) return;

  const thead: HTMLElement | null = el.querySelector('thead');
  if (!thead) return;
  const ths = el.querySelectorAll('th'); // header items

  const min = 150; // minimum size of column that can be reached if we resize column
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
  const columns: Column[] = [];
  let headerBeingResized: HTMLElement | null;

  const updateColumnSizes = (columns: Column[]) => {
    const gridTemplateColumns: string = columns
      .map(({ size }) =>
        size === 'auto' ? 'auto' : size.includes('minmax') ? size : `minmax(${size}, 1fr)`
      )
      .join(' ');
    thead.style.gridTemplateColumns = gridTemplateColumns;

    const tbodyTrs = el.querySelectorAll<HTMLElement>('tbody tr'); // tr content
    tbodyTrs.forEach((tr) => {
      tr.style.gridTemplateColumns = gridTemplateColumns;
    });
  };

  // The next three functions are mouse event callbacks

  // Where the magic happens. I.e. when they're actually resizing
  const onMouseMove = (e: MouseEvent) => {
    requestAnimationFrame(() => {
      // console.log('onMouseMove');
      // Calculate the desired width
      const horizontalScrollOffset = document.documentElement.scrollLeft;
      const width = horizontalScrollOffset + e.clientX - (headerBeingResized?.offsetLeft || 0);

      // Update the column object with the new size value
      const column: Column | undefined = columns.find(
        ({ header }) => header === headerBeingResized
      );
      if (column) {
        const minSizeOfColumn = column.customMinSize ? parseInt(column.customMinSize) : min;
        column.size = Math.max(minSizeOfColumn, width) + 'px'; // Enforce our minimum
      }

      // For the other headers which don't have a set width, fix it to their computed width
      columns.forEach((column) => {
        if (column.size.startsWith('minmax')) {
          // isn't fixed yet (it would be a pixel value otherwise)
          column.size = parseInt(String(column.header.clientWidth), 10) + 'px';
        }
      });

      /*
        Update the column sizes
        Reminder: grid-template-columns sets the width for all columns in one value
      */
      updateColumnSizes(columns);
    });
  };

  // Clean up event listeners, classes, etc.
  const onMouseUp = () => {
    // console.log('onMouseUp');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    headerBeingResized && headerBeingResized.classList.remove('header--being-resized');
    headerBeingResized = null;
  };

  // Get ready, they're about to resize
  const initResize = (e: MouseEvent) => {
    // console.log('initResize');
    if (!e.target) return;
    headerBeingResized = (e.target as HTMLElement).parentNode as HTMLElement;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    headerBeingResized && headerBeingResized.classList.add('header--being-resized');
  };

  // Let's populate that columns array and add listeners to the resize handles
  ths.forEach((header: HTMLElement, idx) => {
    const max = (header.dataset.type ? columnTypeToRatioMap[header.dataset.type] : 1) + 'fr';

    const headerStyles = header.style;
    const useCustomWidth = headerStyles[0] === 'width';
    const gridTemplateColumnsStyle = thead.style.gridTemplateColumns;
    // If el is selectable (has a checkbox)
    const isHeaderHasCheckbox = [...header.classList].includes('v-table__header--selectable');
    let minSize = `${min}px`;

    if (useCustomWidth) {
      minSize = headerStyles.width;
    }

    // to keep values when do resize and click on some header item
    if (gridTemplateColumnsStyle) {
      const arr = gridTemplateColumnsStyle.split(' ');
      minSize = arr[idx];
    }

    const column = {} as Column;
    column.header = header;
    // The initial size value for grid-template-columns:
    column.size = isHeaderHasCheckbox ? 'auto' : `minmax(${minSize}, ${max})`;
    column.customMinSize = useCustomWidth ? headerStyles.width : undefined;
    columns.push(column);

    // If we use custom width, we need to fill empty spaces for items, that use custom width.
    if (useCustomWidth) {
      headerStyles.width = 'auto';
    }
    const headerHasResizeHandler = header.querySelector<HTMLElement>('.resize-handle');

    if (headerHasResizeHandler) {
      headerHasResizeHandler.addEventListener('mousedown', initResize);
    }
  });

  // To apply width inline style prop if is passed to header element.
  updateColumnSizes(columns);

  el.addEventListener('DOMSubtreeModified', () => {
    updateColumnSizes(columns);
  });
};
