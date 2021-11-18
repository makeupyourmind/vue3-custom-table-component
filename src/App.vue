<template>
  <VTable :headers="headers" :items="desserts" :is-pagination-mode-enabled="false">
    <!--    <template #pagination>-->
    <!--      <VPagination :total-pages="2" :per-page="2" :current-page="1" @page-changed="onPageChange" />-->
    <!--    </template>-->
  </VTable>
</template>
<script>
import VTable from './components/VTable';

export default {
  name: 'App',
  components: { VTable },
  data: () => ({
    headers: [
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
    ],
    desserts: [
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
    ],
  }),
  methods: {
    // handleApiSorting(e) {
    //   console.log('handleApiSorting', e);
    // },
    // onPageChange(page) {
    //   console.log('page changed', page);
    // },
  },
};
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
