<template>
  <div class="v-checkbox">
    <input :id="checkboxId" :checked="checked" type="checkbox" @change="onChange" />
    <label
      :for="checkboxId"
      :class="{
        'some-checkbox-is-un-marked': isSomeCheckboxUnMarked,
      }"
    ></label>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'VCheckbox',
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    isSomeCheckboxUnMarked: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const checkboxId = computed(() => {
      return `checkbox-id-${props.id}`;
    });

    const onChange = (e) => {
      if (props.checked) {
        e.target.checked = props.checked;
      }
    };

    return {
      checkboxId,
      onChange,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_variables.scss';

@mixin vh() {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

.v-checkbox {
  // custom checkbox
  input[type='checkbox'] {
    @include vh();
    + label {
      position: relative;
      //padding: 4px 6px 0 32px;
      padding: 0.5rem 0 0 2rem;
      margin-bottom: 1rem;
      user-select: none;
      color: $checkbox-background;
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 1.75rem;
        height: 1.75rem;
        border: 2px solid $checkbox-border;
        border-radius: 0.25rem;
        background: $checkbox-background;
        text-align: center;
        transition: background 200ms ease-out;
      }
      &:after {
        content: '';
        position: absolute;
        transform: scale(0);
        transition: transform 200ms ease-out;
      }
    }
  }

  input[type='checkbox'] {
    + label {
      &.some-checkbox-is-un-marked {
        &:after {
          content: '';
          opacity: 1;
          background-color: transparent;
          display: block;
          position: absolute;
          left: 0.65rem;
          top: 0.25rem;
          width: 0.5rem;
          height: 1rem;
          border-bottom: none;
          border-right: 3px solid $checkbox-checked;
          transform: rotate(90deg);
          transition: border-color 0.3s ease;
        }
      }
    }

    &:checked {
      + label {
        &:before {
          content: '';
        }

        &:after {
          content: '';
          opacity: 1;
          background-color: transparent;
          display: block;
          position: absolute;
          left: 0.65rem;
          top: 0.25rem;
          width: 0.5rem;
          height: 1rem;
          border-bottom: 3px solid $checkbox-checked;
          border-right: 3px solid $checkbox-checked;
          transform: rotate(45deg);
          transition: border-color 0.3s ease;
        }
      }
    }
  }
}
</style>
