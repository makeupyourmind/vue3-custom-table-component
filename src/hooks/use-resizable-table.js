export default function useResizableTable() {
  const table = document.querySelector('#custom-table');
  if (!table) return;
  const thead = table.querySelector('thead');

  const min = 150;
  // The max (fr) values for grid-template-columns
  const columnTypeToRatioMap = {
    'text-short': 1.67,
    'text-long': 3.33,
  };
  columnTypeToRatioMap.numeric = 1;

  /*
    The following will soon be filled with column objects containing
    the header element and their size value for grid-template-columns 
  */
  const columns = [];
  let headerBeingResized;

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
      column.size = Math.max(min, width) + 'px'; // Enforce our minimum

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
      thead.style.gridTemplateColumns = columns.map(({ size }) => size).join(' ');

      const tbodyTrs = table.querySelectorAll('tbody tr');
      tbodyTrs.forEach((tr) => {
        tr.style.gridTemplateColumns = columns.map(({ size }) => size).join(' ');
      });
      // tbodyTr.style.gridTemplateColumns = columns.map(({ size }) => size).join(' ');
    });
  };

  // Clean up event listeners, classes, etc.
  const onMouseUp = () => {
    console.log('onMouseUp');
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
  document.querySelectorAll('th').forEach((header) => {
    const max = columnTypeToRatioMap[header.dataset.type] + 'fr';
    columns.push({
      header,
      // The initial size value for grid-template-columns:
      size: `minmax(${min}px, ${max})`,
    });
    header.querySelector('.resize-handle').addEventListener('mousedown', initResize);
  });

  const theadClickListener = (e) => {
    const currentTheadStyles = e.currentTarget.style;
    const cssProperty = currentTheadStyles[0];
    const cssPropertyValue = currentTheadStyles[cssProperty];
    table.querySelectorAll('tbody tr').forEach((tr) => {
      tr.style[cssProperty] = cssPropertyValue;
    });
  };

  thead.addEventListener('click', theadClickListener);
}
