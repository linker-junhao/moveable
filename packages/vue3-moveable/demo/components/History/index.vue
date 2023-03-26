<template>
  <div class="history">
    <div class="history-header">
      <span class="history-title">History</span>
      <div class="history-buttons">
        <el-button class="history-undo" :disabled="!canUndo" @click="undo">
          Undo
        </el-button>
        <el-button class="history-redo" :disabled="!canRedo" @click="redo">
          Redo
        </el-button>
      </div>
    </div>
    <div class="history-body">
      <div class="history-list">
        <div
          class="history-item"
          v-for="(item, index) in history.operations"
          :key="index"
          :class="{ 'history-item-active': index === history.index }"
          @click="goTo(index)"
        >
          {{ new Date(item.timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from 'vue';
import { useHistoryStore } from '../../store/history'
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';
import { useStoreElsInEditor } from '../../store/storeElsInEditor';
import { ElButton } from 'element-plus';

export default defineComponent({
  name: 'History',
  components: {
    ElButton
  },
  setup(props, { emit }) {
    const storeElsInEditor = useStoreElsInEditor()
    const moveableStuffRefs = useMoveableStuffRefs()
    const history = useHistoryStore()
    const canUndo = computed(() => history.index > 0);
    const canRedo = computed(
      () => history.index < history.operations.length - 1
    );

    function undo() {
      if (canUndo.value) {
        history.undo();
        setRecordToHistoryIndex()
        emit('undo');
      }
    }

    function redo() {
      if (canRedo.value) {
        history.redo();
        setRecordToHistoryIndex()
        emit('redo');
      }
    }

    function goTo(index: number) {
      if (index !== history.index) {
        history.goto(index);
        setRecordToHistoryIndex()
        emit('goTo', index);
      }
    }

    function setRecordToHistoryIndex() {
      storeElsInEditor.setDataConfig(
        reactive(
          JSON.parse(history.operations[history.index].operation)
        )
      )
      moveableStuffRefs.setActiveElRef(null)
    }

    onMounted(() => {
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          history.addOperation(JSON.stringify(storeElsInEditor.dataConfig))
        }
      });
    })

    return {
      canUndo,
      canRedo,
      undo,
      redo,
      goTo,
      history
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
