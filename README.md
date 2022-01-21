# vue3-table-component

## SampleCode
````js
import { VTable } from 'vue3-table-component';
````

## Setup
````
$ npm install
$ npm run serve
````

## Package update
```
$ npm run build-library

check if version in package json has been changed.

$ npm publish 
```

### QuickStart
<hr />

### component

````vue
  <VTable
    v-model="selected"
    :is-loading="false"
    :use-api-sorting="false"
    :headers="headers"
    :items="desserts"
    :is-pagination-mode-enabled="false"
    :pagination-options="{
      totalPages: 1,
      perPage: 10,
    }"
    single-select
    show-select
    @handle-api-sorting="handleApiSorting"
    @row-click="rowClick"
  />
````

### data

```js
const selected = ref([]);

const headers = reactive([
  {
    text: 'Dessert (100g serving)', // Text that will be dipslayed in header
    // One of items shoud have key equals `name`. items = [{ name: 'Some name' }]
    // Then 'Some name' will be displayed in the header
    value: 'name',
    sortable: true, // Make column sortable
    resizable: true, // Make column resizable
    width: '350px', // Use custom width for column
  },
  {
    text: 'Calories',
    value: 'calories',
    sortable: true,
    resizable: true,
    width: '360px',
    defaultSort: 'asc|desc|ASC|DESC',
    fixed: true,
    style: {
      className: 'calories-class' | ['calories-class', 'one-more-class'],
      expectedValue: 250,
      condition: '>',
    },
  },
  {
    text: 'Fat (g)',
    value: 'fat',
  },
  {
    text: 'Carbs (g)',
    value: 'carbs',
  },
]);

const desserts = reactive([
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
  },
]);
```

### Component Props

| Prop name  | Required | Default value | Description |
| ------------- | ------------- | ------------- | ------------- |
| `headers`  | Yes | N/A  | Items that will be displayed in table header |
| `items`  | Yes | N/A  | Content of table |
| `isLoading`  | No | `false` | Prop to indicate that data in the table is currently loading |
| `loaderMessage`  | No | `null` | Customize default loader message |
| `useApiSorting`  | No | `false` | If `true` then do sort using API, but not using table. Need `@handle-api-sorting` event |
| `paginationOptions`  | No | `false` | Options that will be used when use default pagination |
| `isPaginationModeEnabled`  | No | `{ totalPages: 1, perPage: 10 }` | Display slot with pagination. By default uses package basic pagination |
| `show-select`  | No | `false` | Allow to select row |
| `select-width`  | No | `null` | Manage width for selectable block. Can be in `px`, `rem`. By default uses `70px` value. That value is minimum that allowed to be used. |
| `select-fixed`  | No | `false` | Make selectable field fixed to the left side |
| `single-select`  | Yes | `false` | Hide/Show select all items checkbox |
| `v-model="modelName"`  | No | `null` | To store the selected values |

### Header props
| Prop name  | Required | Default value | Description |
| ------------- | ------------- | ------------- | ------------- |
| `text`  | Yes | N/A  | Text that uses in the header |
| `value`  | Yes | N/A  | Contains the key by that should be in item object to get ceil content |
| `sortable`  | No | `false`  | Sortable field |
| `resizable`  | No | `false`  | Resizable field |
| `width`  | No | null | Use custom width for column |
| `fixed`  | No | null | Make a column fixed to the left side |
| `defaultSort`  | No | null | Default sorting for specific field. Example `asc`, `ASC`, `desc`, `DESC` |
| `style`  | No | null | Apply custom class by some condition |


### Slots

### pagination
Support slot that uses to display component pagination. By default, uses own pagination
```vue
<VTable :is-pagination-mode-enabled="true">
    <template #pagination>
    <!-- Your custom pagination goes here  -->
    </template>
</VTable>
```

### loader
Overwrite default loader 
```vue
<VTable :is-loading="true">
    <template #loader>
    <!-- Your custom loader goes here  -->
    </template>
</VTable>
```

### Events

### @handle-api-sorting - event fires when we want to use API sorting (:use-api-sorting="true"),
Send to API sortable fields in array format like ```[{field: 'name', order: 'asc'}]```
```vue
<VTable
  ...restProps
  @handle-api-sorting="handleApiSorting"
>
</VTable>
```

```js
export default {
    setup() {
        const handleApiSorting = (sortableFields) => {
          console.log('handleApiSorting', sortableFields);
          // some API request goes here where we paste these sortableFields
        };
    
        return {
          handleApiSorting
        }
    }
}
```

### @row-click - Handle row click. As param would be the clicked item.
```vue
<VTable
  ...restProps
  @row-click="rowClick"
>
</VTable>
```

```js
export default {
    setup() {
        const rowClick = (clickedItem) => {
          console.log('row click', clickedItem);
        };

        return {
          rowClick
        }
    }
}
```