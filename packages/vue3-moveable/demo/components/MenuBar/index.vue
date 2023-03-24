<template>
  <div class="menu-bar">
    <el-button @click="openFile">Open File</el-button>
    <el-button @click="saveFile">Save File</el-button>
    <input type="file" :ref="setFileInput" style="display:none" @change="handleFileUpload"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { ElButton } from 'element-plus';
import { useStoreElsInEditor } from '../../store/storeElsInEditor';
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';

export default defineComponent({
  name: 'MenuBar',
  components: {
    ElButton,
  },
  setup() {
    const storeElsInEditor = useStoreElsInEditor()
    const moveableStuffRefs = useMoveableStuffRefs()
    const fileInput = ref<HTMLInputElement | null>(null)
    const setFileInput = (e) => fileInput.value = e

    const openFile = () => {
      fileInput.value?.click();
    };

    const handleFileUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = JSON.parse(e.target?.result as string);
        storeElsInEditor.setDataConfig(reactive(contents));
        moveableStuffRefs.setActiveElRef(null)
      };
      reader.readAsText(file as Blob);
    };

    const saveFile = () => {
      const data = JSON.stringify(storeElsInEditor.dataConfig);
      const blob = new Blob([data], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    return {
      openFile,
      handleFileUpload,
      setFileInput,
      saveFile
    };
  },
});
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}
</style>
