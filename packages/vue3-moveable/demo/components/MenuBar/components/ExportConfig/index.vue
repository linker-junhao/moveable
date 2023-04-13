<template>
  <div @click="toggleExportConfigModel">导出配置</div>
  <el-dialog v-model="isShowModal" title="配置JSON" width="75%" lock-scroll append-to-body>
    <div style="max-height: 60vh; overflow: auto;">
      <JsonBox :json="convertedOldFormatConfigData" />
    </div>

    <template #footer>
      <span>
        <el-button @click="toggleExportConfigModel">关闭</el-button>
        <el-button type="primary" @click="exportAction">
          导出
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import JsonBox from '../../../JsonBox/index.vue'
import { ComponentConfig, useStoreElsInEditor } from '../../../../store/storeElsInEditor';
import { computed, ref } from 'vue';
import { saveJSONFile, filenameWithDate } from '../../../../utils/saveJson';

const storeElsInEditor = useStoreElsInEditor()

const isShowModal = ref(false)
const toggleExportConfigModel = () => {
  isShowModal.value = !isShowModal.value
}

const convertedOldFormatConfigData = computed(() => {
  type Item = ComponentConfig & { config_field_name?: string }
  const convertItem = (item: Item, result: any) => {
    if (item?.config_field_name) {
      result[item.config_field_name] = {
        isShow: true,
        value: item.value,
        style: item.style
      }
      if (item.dataType === 'leaf' && item.icon) {
        result[item.config_field_name].icon = {
          isShow: true,
          value: item.icon.value,
          style: item.icon.style,
          class: item.icon.class
        }
      }
    }
    if (item.dataType === 'branch') {
      item.children?.forEach(item => {
        convertItem(item, result)
      });
    }
  }
  const ret = {}
  const { dataConfig } = storeElsInEditor
  if (dataConfig?.length) {
    convertItem(dataConfig[0], ret)
  }
  return ret
})

const exportAction = () => {
  saveJSONFile(convertedOldFormatConfigData.value, filenameWithDate('export_config'))
}
</script>