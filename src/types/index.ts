export type Header = {
  text: string;
  value: string;
  sortable?: boolean;
  resizable?: boolean;
  width?: string;
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
  [key: string]: string | number;
};

export type Item = GeneralObject;

export type SortedItem = GeneralObject;