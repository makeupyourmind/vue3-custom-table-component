export type Header = {
  text: string;
  value: string;
  sortable?: boolean;
  resizable?: boolean;
  width?: string;
  defaultSort?: string;
  hasSortableIcon?: boolean;
  sortDirection?: string;
  sortOrderNumber?: number;
};

export type Column = {
  header: HTMLElement;
  size: string;
  customMinSize?: string;
};

export type SortableField = {
  field: string;
  order: string;
};

export type GeneralObject = {
  [key: string]: string | number | boolean;
};

export type Item = GeneralObject;

export type SortedItem = GeneralObject & {
  settings: {
    isChecked?: boolean;
  };
};
