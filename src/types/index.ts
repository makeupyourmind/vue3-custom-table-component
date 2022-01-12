export type Header = {
  text: string;
  value: string;
  sortable?: boolean;
  resizable?: boolean;
  width?: string;
  fixed?: string;
  defaultSort?: string;
  hasSortableIcon?: boolean;
  sortDirection?: string;
  sortOrderNumber?: number;
  style?: {
    className: string | string[];
    expectedValue: number | string;
    condition: string;
  };
};

export type Column = {
  header: HTMLElement;
  size: string;
  customSize?: string;
  customMinSize?: string;
};

export type SortableField = {
  field: string;
  order: string;
};

export type GeneralObject = {
  [key: string]: string | number | boolean | GeneralObject;
};

export type TableItem = GeneralObject;

export type SortedItem = TableItem & {
  itemSettings: {
    isChecked?: boolean;
    classes?: string;
  };
};

export type FixedColumnDictionary = {
  htmlElement: HTMLElement;
  newPosition: number;
  elementWidth: number;
  leftWidth: number;
};

export type PaginationOptions = {
  maxVisibleButtons?: number;
  totalPages: number;
  perPage: number;
};

export type VTableComponentProps = {
  headers: Header[];
  items: TableItem[];
  isLoading: boolean;
  loaderMessage: string;
  useApiSorting: boolean;
  paginationOptions: PaginationOptions;
  isPaginationModeEnabled: boolean;
  showSelect: boolean;
  modelValue: SortedItem[];
  singleSelect: boolean;
  selectCheckboxWidth: string;
  selectCheckboxFixed: boolean;
};

export type Settings = {
  headers: Header[];
  items: TableItem[] | SortedItem[];
};
