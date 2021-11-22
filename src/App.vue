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
    >
      <!--      <template #loader> here is your pagination </template>-->
      <!--    <template #pagination>-->
      <!--      <VPagination :total-pages="2" :per-page="2" :current-page="1" @page-changed="onPageChange" />-->
      <!--    </template>-->
      <!--      <template #[`item.calories`]="{ item }">-->
      <!--        <h2>-->
      <!--          {{ item.calories }}-->
      <!--        </h2>-->
      <!--      </template>-->
    </VTable>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch } from 'vue';

import { SortableField } from '@/types';
import VTable from '@/components/VTable.vue';

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

    const handleApiSorting = (sortedFields: SortableField[]) => {
      console.log('handleApiSorting', sortedFields);
    };

    watch(selected, (selectedItems) => {
      console.log('selectedItems', selectedItems);
    });

    return {
      headers,
      desserts,
      selected,
      handleApiSorting,
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
