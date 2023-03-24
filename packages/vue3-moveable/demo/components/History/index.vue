<template>
  <div class="history">
    <div class="history-header">
      <span class="history-title">History</span>
      <div class="history-buttons">
        <button class="history-undo" :disabled="!canUndo" @click="undo">
          Undo
        </button>
        <button class="history-redo" :disabled="!canRedo" @click="redo">
          Redo
        </button>
      </div>
    </div>
    <div class="history-body">
      <div class="history-list">
        <div
          class="history-item"
          v-for="(item, index) in history"
          :key="index"
          :class="{ 'history-item-active': index === currentIndex }"
          @click="goTo(index)"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'History',
  props: {
    history: {
      type: Array,
      default: () => [],
    },
    currentIndex: {
      type: Number,
      default: -1,
    },
  },
  setup(props, { emit }) {
    const canUndo = computed(() => props.currentIndex > -1);
    const canRedo = computed(
      () => props.currentIndex < props.history.length - 1
    );

    function undo() {
      if (canUndo.value) {
        emit('undo');
      }
    }

    function redo() {
      if (canRedo.value) {
        emit('redo');
      }
    }

    function goTo(index: number) {
      if (index !== props.currentIndex) {
        emit('goTo', index);
      }
    }

    return {
      canUndo,
      canRedo,
      undo,
      redo,
      goTo,
    };
  },
});
</script>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.history-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 0;
}
.history-buttons {
  display: flex;
  align-items: center;
}
.history-undo,
.history-redo {
  margin-left: 8px;
}
.history-body {
  flex: 1;
  overflow-y: auto;
}
.history-list {
  padding: 8px;
}
.history-item {
  padding: 4px;
  cursor: pointer;
}
.history-item-active {
  background-color: #f5f5f5;
}

</style>