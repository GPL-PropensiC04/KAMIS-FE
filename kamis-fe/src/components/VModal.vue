<template>
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick && $emit('update:modelValue', false)">
          <div class="modal-container" @click.stop>
            <div class="modal-content">
              <slot></slot>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
</template>
  
<script setup lang="ts">
// Remove the explicit imports as they're automatically available in <script setup>
// import { defineProps, defineEmits } from 'vue';

interface Props {
  modelValue: boolean;
  closeOnOverlayClick?: boolean;
}

// Define slot types
type SlotProps = Record<string, never>; // Empty props for default slot

withDefaults(defineProps<Props>(), {
  modelValue: false,
  closeOnOverlayClick: true
});

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// Define slots - this explicitly defines the slot structure
defineSlots<{
  default(props: SlotProps): unknown;
}>();
</script>
  
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
}

.modal-content {
  padding: 0;
}

/* Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>