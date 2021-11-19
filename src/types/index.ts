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

export type SelectedItem = {
  [key: string]: string | number;
};
