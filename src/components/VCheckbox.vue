<template>
  <div class="v-checkbox">
    <input
      :id="checkboxId"
      :aria-labelledby="checkboxId"
      :checked="checked"
      type="checkbox"
      @change="onChange"
    />
    <label
      title="checkbox-label"
      :for="checkboxId"
      :class="{
        'some-checkbox-is-un-marked': isSomeCheckboxUnMarked,
      }"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
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
      return `v-checkbox-id-${props.id}`;
    });

    const onChange = (e: Event) => {
      if (props.checked) {
        (e.target as HTMLInputElement).checked = props.checked;
      }
    };

    return {
      checkboxId,
      onChange,
    };
  },
});
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

@mixin after-pseudo {
  content: '';
  opacity: 1;
  background-color: transparent;
  display: block;
  position: absolute;
  left: 0.65rem;
  top: 0.25rem;
  width: 0.5rem;
  height: 1rem;
  border-right: 3px solid $checkbox-checked;
  transition: border-color 0.3s ease;
}

.v-checkbox {
  // custom checkbox
  input[type='checkbox'] {
    @include vh();
    + label {
      position: relative;
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
          @include after-pseudo;
          border-bottom: none;
          transform: rotate(90deg);
        }
      }
    }

    &:checked {
      + label {
        &:before {
          content: '';
        }

        &:after {
          @include after-pseudo;
          border-bottom: 3px solid $checkbox-checked;
          transform: rotate(45deg);
        }
      }
    }
  }
}
</style>
