import { defineStore } from 'pinia';


const MAX_HISTORY_LENGTH = 10;

const useHistoryStore = defineStore({
  id: 'history',
  state: () => ({
    operations: [] as {operation: string, timestamp: number}[],
    index: -1,
  }),
  actions: {
    addOperation(operation: string) {
      const timestamp = Date.now();
      this.operations.splice(this.index + 1);
      this.operations.push({operation, timestamp});
      this.index = this.operations.length - 1;
      if (this.operations.length > MAX_HISTORY_LENGTH) {
        this.operations.shift();
        this.index--;
      }
    },
    undo() {
      if (this.index > -1) {
        this.index--;
      }
    },
    redo() {
      if (this.index < this.operations.length - 1) {
        this.index++;
      }
    },
    goto(idx: number) {
      this.index = idx
    },
    clearOperations() {
      this.operations = [];
      this.index = -1;
    },
  },
});

export { useHistoryStore }
