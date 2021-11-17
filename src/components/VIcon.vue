<template>
  <FontAwesomeIcon :icon="icon" />
</template>

<script>
import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSortDown,
  faSortUp,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faSortDown,
  faSortUp,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleRight,
  faAngleDoubleLeft
);

export default defineComponent({
  name: 'VFontAwesome',
  components: { FontAwesomeIcon },
  props: {
    namespace: {
      type: String,
      default: 'fas',
      note: 'Default namespace',
    },
    icon: {
      type: String,
      required: true,
      note: 'the name of the fontAwesome icon to display ie. "cross" for "fa-cross"',
    },
  },
});
</script>
