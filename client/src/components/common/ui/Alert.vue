<!-- client/src/components/common/ui/Alert.vue -->
<template>
  <div v-if="visible" class="ui-alert" :class="[`alert-${type}`, { dismissible }]">
    <div class="alert-icon" v-if="icon">
      <i :class="iconClass"></i>
    </div>
    <div class="alert-content">
      <h4 v-if="title" class="alert-title">{{ title }}</h4>
      <div class="alert-message">
        <slot></slot>
      </div>
    </div>
    <button v-if="dismissible" class="alert-close" @click="dismiss">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => {
      return ['info', 'success', 'warning', 'danger'].includes(value);
    }
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  autoDismiss: {
    type: Number,
    default: 0 // 0 significa nessun auto-dismiss
  }
});

const emits = defineEmits(['dismissed']);
const visible = ref(true);

const iconClass = computed(() => {
  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle'
  };

  return icons[props.type] || icons.info;
});

function dismiss() {
  visible.value = false;
  emits('dismissed');
}

// Auto-dismiss se impostato
if (props.autoDismiss > 0) {
  setTimeout(() => {
    dismiss();
  }, props.autoDismiss);
}
</script>

<style scoped>
.ui-alert {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.ui-alert:last-child {
  margin-bottom: 0;
}

.alert-info {
  background-color: rgba(52, 152, 219, 0.1);
  border-left: 4px solid var(--primary-color);
  color: #2980b9;
}

.alert-success {
  background-color: rgba(46, 204, 113, 0.1);
  border-left: 4px solid var(--secondary-color);
  color: #27ae60;
}

.alert-warning {
  background-color: rgba(243, 156, 18, 0.1);
  border-left: 4px solid var(--warning-color);
  color: #e67e22;
}

.alert-danger {
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid var(--danger-color);
  color: #c0392b;
}

.alert-icon {
  font-size: 18px;
  margin-right: 12px;
  padding-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.alert-message {
  font-size: 14px;
}

.alert-close {
  background: none;
  border: none;
  padding: 0;
  margin-left: 12px;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}
</style>
