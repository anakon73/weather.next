<script setup lang="ts">
defineProps<{ show: boolean }>()
const emits = defineEmits<{ close: [] }>()
</script>

<template>
  <div v-if="show" class="dialog_overlay" @click="emits('close')">
    <div class="dialog_content" @click.stop>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dialog_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog_content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}
</style>
