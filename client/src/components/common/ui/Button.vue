<!-- client/src/components/common/ui/Button.vue -->
<template>
  <button
      :class="buttonClasses"
      :type="type"
      :disabled="disabled || loading"
      @click="$emit('click', $event)"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin btn-icon"></i>
    <i v-else-if="icon" :class="icon" class="btn-icon"></i>
    <span v-if="$slots.default" class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => {
      return ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value);
    }
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg'].includes(value);
    }
  },
  outline: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button',
    validator: (value: string) => {
      return ['button', 'submit', 'reset'].includes(value);
    }
  },
  block: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['click']);

const buttonClasses = computed(() => {
  return [
    'ui-button',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      'btn-outline': props.outline,
      'btn-block': props.block,
      'btn-loading': props.loading,
      'btn-icon-only': props.icon && !props.loading && !slots.default //da verificare se slot o $slots
    }
  ];
});
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s all;
  border: 1px solid transparent;
}

.ui-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Varianti */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-warning {
  background-color: var(--warning-color);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
}

.btn-light {
  background-color: #f8f9fa;
  color: #343a40;
  border-color: #ddd;
}

.btn-light:hover:not(:disabled) {
  background-color: #e2e6ea;
}

.btn-dark {
  background-color: #343a40;
  color: white;
}

.btn-dark:hover:not(:disabled) {
  background-color: #23272b;
}

/* Varianti outline */
.btn-outline.btn-primary {
  background-color: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
}

.btn-outline.btn-secondary {
  background-color: transparent;
  color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.btn-outline.btn-secondary:hover:not(:disabled) {
  background-color: var(--secondary-color);
  color: white;
}

.btn-outline.btn-danger {
  background-color: transparent;
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.btn-outline.btn-danger:hover:not(:disabled) {
  background-color: var(--danger-color);
  color: white;
}

/* Dimensioni */
.btn-sm {
  font-size: 12px;
  padding: 6px 12px;
}

.btn-md {
  font-size: 14px;
  padding: 8px 16px;
}

.btn-lg {
  font-size: 16px;
  padding: 12px 20px;
}

/* Icone */
.btn-icon {
  margin-right: 8px;
}

.btn-text:empty + .btn-icon {
  margin-right: 0;
}

.btn-icon-only {
  width: 40px;
  height: 40px;
  padding: 0;
}

.btn-icon-only.btn-sm {
  width: 32px;
  height: 32px;
}

.btn-icon-only.btn-lg {
  width: 48px;
  height: 48px;
}

/* Block */
.btn-block {
  display: flex;
  width: 100%;
}
</style>
