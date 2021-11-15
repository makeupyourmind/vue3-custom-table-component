<template>
  <VTable
    :use-api-sorting="false"
    :is-loading="false"
    :headers="headers"
    :items="desserts"
    @handle-api-sorting="handleApiSorting"
  >
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
      },
      {
        text: 'Calories',
        value: 'calories',
        sortable: true,
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
    handleApiSorting(e) {
      console.log('handleApiSorting', e);
    },
  },
};
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
