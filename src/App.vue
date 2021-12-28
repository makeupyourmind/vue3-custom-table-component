<template>
  <div>
    <VTable
      v-model="selected"
      :is-loading="false"
      :use-api-sorting="true"
      :headers="headers"
      :items="desserts"
      :is-pagination-mode-enabled="false"
      :pagination-options="{
        totalPages: 1,
        perPage: 10,
      }"
      :show-select="true"
      :single-select="false"
      @handle-api-sorting="handleApiSorting"
      @row-click="rowClick"
    >
      <!--    <template #loader> here is your loader </template>-->
      <!--    <template #pagination>-->
      <!--      <VPagination :total-pages="2" :per-page="2" :current-page="1" @page-changed="onPageChange" />-->
      <!--    </template>-->
      <!--      <template #[`item.calories`]="{ item }">-->
      <!--        <h2>-->
      <!--          {{ item.calories }}-->
      <!--        </h2>-->
      <!--      </template>-->
      <!--      <template #no-content>No content for table</template>-->
      <!--      <template #[`header.name.content`]="{ header, doSort }">-->
      <!--        &lt;!&ndash;            Todo: move logic to component?&ndash;&gt;-->
      <!--        <span @click="doSort && doSort(header.value)">{{ header.text }} custom</span>-->
      <!--      </template>-->
      <!--      <template #header-select-checkbox="slotProps">-->
      <!--        <VCheckbox-->
      <!--          :is-some-checkbox-un-marked="slotProps.isSomeCheckboxUnMarked"-->
      <!--          :checked="slotProps.checked"-->
      <!--          @change="slotProps.change"-->
      <!--          id="parent-mark-all"-->
      <!--        />-->
      <!--      </template>-->
      <!--      <template #row-select-checkbox="slotProps">-->
      <!--        <VCheckbox-->
      <!--          :checked="slotProps.checked"-->
      <!--          @change="slotProps.change(slotProps.clickedItem)"-->
      <!--          :id="`parent-${slotProps.id}`"-->
      <!--        />-->
      <!--      </template>-->
      <template #[`item.management`]="slotsProps">
        <button @click.stop="managementClick(slotsProps.item)">Click me</button>
        <!--        <button @click.stop="managementClick(slotsProps.item)">Click me</button>-->
      </template>
    </VTable>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch } from 'vue';

import { ASC } from './constants';

import { Item, SortableField } from '@/types';
import VTable from '@/components/VTable.vue';
// import VCheckbox from '@/components/VCheckbox.vue';

export default defineComponent({
  name: 'App',
  components: { VTable },
  setup() {
    const selected = ref([]);

    const headers = reactive([
      {
        text: 'Dessert (100g serving)',
        value: 'name',
        sortable: true,
        resizable: true,
        width: '350px',
      },
      {
        text: 'Calories',
        value: 'calories',
        sortable: true,
        resizable: true,
        width: '360px',
        defaultSort: ASC,
        style: {
          className: 'calories-class',
          expectedValue: 220,
          condition: '>',
        },
      },
      {
        text: 'Fat (g)',
        value: 'fat',
        style: {
          className: ['fat-class', 'one-more-class'],
          expectedValue: 6,
          condition: '>',
        },
      },
      {
        text: 'Carbs (g)',
        value: 'carbs',
      },
      {
        text: 'Management',
        value: 'management',
      },
    ]);

    const desserts = reactive([
      {
        id: 1,
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
        management: null,
      },
      {
        name: 'Lollipop',
        calories: 392,
        fat: 0.2,
        carbs: 98,
        management: 'f',
      },
    ]);

    setTimeout(() => {
      desserts.push({
        name: 'Lollipop2',
        calories: 392,
        fat: 0.2,
        carbs: 98,
        management: 'f',
      });
    }, 1000);

    const handleApiSorting = (sortedFields: SortableField[]) => {
      console.log('handleApiSorting', sortedFields);
    };

    const rowClick = (clickedItem: Item) => {
      console.log('clicked item', clickedItem);
    };

    const managementClick = (item: Item) => {
      console.log('managementClick', item);
    };

    watch(selected, (selectedItems) => {
      console.log('selectedItems', selectedItems);
    });

    return {
      headers,
      desserts,
      selected,
      handleApiSorting,
      rowClick,
      managementClick,
    };
  },
});
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
}

body {
  font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}
</style>
