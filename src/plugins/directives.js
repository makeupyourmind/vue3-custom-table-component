export const VueColumnsResizable = (el) => {
  const nodeName = el.nodeName;
  if (['TABLE', 'THEAD'].indexOf(nodeName) < 0) return;

  const thead = el.querySelector('thead');
  const ths = el.querySelectorAll('th'); // header items

  const min = 150; // minimum size of column that can be reached if we resize column
  // The max (fr) values for grid-template-columns
  const columnTypeToRatioMap = {
    'text-short': 1.67,
    'text-long': 3.33,
  };

  /*
    The following will soon be filled with column objects containing
    the header element and their size value for grid-template-columns
  */
  const columns = [];
  let headerBeingResized;

  const updateColumnSizes = (columns) => {
    thead.style.gridTemplateColumns = columns.map(({ size }) => size).join(' ');

    const tbodyTrs = el.querySelectorAll('tbody tr');

    tbodyTrs.forEach((tr) => {
      tr.style.gridTemplateColumns = columns.map(({ size }) => size).join(' ');
    });
  };

  // The next three functions are mouse event callbacks

  // Where the magic happens. I.e. when they're actually resizing
  const onMouseMove = (e) => {
    requestAnimationFrame(() => {
      // console.log('onMouseMove');
      // Calculate the desired width
      let horizontalScrollOffset = document.documentElement.scrollLeft;
      const width = horizontalScrollOffset + e.clientX - (headerBeingResized?.offsetLeft || 0);

      // Update the column object with the new size value
      const column = columns.find(({ header }) => header === headerBeingResized);
      const minSizeOfColumn = column.customMinSize ? parseInt(column.customMinSize) : min;
      column.size = Math.max(minSizeOfColumn, width) + 'px'; // Enforce our minimum

      // For the other headers which don't have a set width, fix it to their computed width
      columns.forEach((column) => {
        if (column.size.startsWith('minmax')) {
          // isn't fixed yet (it would be a pixel value otherwise)
          column.size = parseInt(column.header.clientWidth, 10) + 'px';
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
    headerBeingResized.classList.remove('header--being-resized');
    headerBeingResized = null;
  };

  // Get ready, they're about to resize
  const initResize = ({ target }) => {
    // console.log('initResize');
    headerBeingResized = target.parentNode;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    headerBeingResized.classList.add('header--being-resized');
  };

  // Let's populate that columns array and add listeners to the resize handles
  ths.forEach((header, idx) => {
    const max = (columnTypeToRatioMap[header.dataset.type] || 1) + 'fr';

    const headerStyles = header.style;
    const useCustomWidth = headerStyles[0] === 'width';
    const gridTemplateColumnsStyle = thead.style['grid-template-columns'];
    // If el is selectable (has a checkbox)
    const isSelectable = [...header.classList].includes('v-table__header--selectable');
    let minSize = `${min}px`;

    if (useCustomWidth) {
      minSize = headerStyles.width;
    }

    // to keep values when do resize and click on some header item
    if (gridTemplateColumnsStyle) {
      const arr = gridTemplateColumnsStyle.split(' ');
      minSize = arr[idx];
    }

    columns.push({
      header,
      // The initial size value for grid-template-columns:
      size: isSelectable ? 'minmax(70px, auto)' : `minmax(${minSize}, ${max})`,
      // To handle min width size, that user passed to header item.
      ...(useCustomWidth && { customMinSize: headerStyles[headerStyles[0]] }),
    });

    // If we use custom width, we need to fill empty spaces for items, that use custom width.
    if (useCustomWidth) {
      headerStyles.width = 'auto';
    }
    const headerHasResizeHandler = header.querySelector('.resize-handle');

    if (headerHasResizeHandler) {
      headerHasResizeHandler?.addEventListener('mousedown', initResize);
    }
  });

  // To apply width inline style prop if is passed to header element.
  updateColumnSizes(columns);
};
