<!-- client/src/components/common/ui/Card.vue -->
<template>
  <div class="ui-card" :class="{ 'no-padding': noPadding, hover: hover }">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body" :class="{ 'no-padding': bodyNoPadding }">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  noPadding: {
    type: Boolean,
    default: false
  },
  bodyNoPadding: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.ui-card {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.ui-card:last-child {
  margin-bottom: 0;
}

.ui-card.hover {
  transition: transform 0.2s, box-shadow 0.2s;
}

.ui-card.hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.card-body.no-padding {
  padding: 0;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.ui-card.no-padding .card-header,
.ui-card.no-padding .card-body,
.ui-card.no-padding .card-footer {
  padding: 0;
}
</style>
