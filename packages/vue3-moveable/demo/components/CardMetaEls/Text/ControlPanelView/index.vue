<template>
  <TextControl />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TextControl from '../../../BaseStyleControlPane/TextControl/index.vue'

export default defineComponent({
  name: 'TextControlPanelView',
  components: {
    TextControl
  }
});
</script>

<style scoped>
.text-control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-control-panel__input {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
