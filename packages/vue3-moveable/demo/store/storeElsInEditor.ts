import { defineStore } from "pinia";
import { computed, CSSProperties, reactive, ref } from "vue";
interface BaseComponentConfig {
  name: string
  style: CSSProperties
  uuid: string
  value: any
  editBehavior?: {
    locked: boolean
  }
}

export interface LeafComponentConfig extends BaseComponentConfig {
  dataType: 'leaf'
}
export interface BranchComponentConfig extends BaseComponentConfig {
  dataType: 'branch'
  children: Array<ComponentConfig>
}
export type ComponentConfig = LeafComponentConfig | BranchComponentConfig

const useStoreElsInEditor = defineStore('ElsInEditor', () => {
  // 目前选中的组件对应的数据
  const dataActiveComponentConfig = ref<null | ComponentConfig>(null)
  const setActiveComponentConfig = (componentConfig: ComponentConfig|null) => {
    dataActiveComponentConfig.value = componentConfig
  }

  const dataConfig = ref(reactive<ComponentConfig[]>([]))
  const setDataConfig = (config) => {
    setActiveComponentConfig(null)
    dataConfig.value = config
  }

  // 添加一个组件
  const addComponent = (componentConfig) => {
    const activeConfigData = dataActiveComponentConfig.value
    if (activeConfigData?.dataType === 'branch') {
      activeConfigData.children.push(componentConfig)
    } else if(dataConfig[0].dataType === 'branch') {
      dataConfig[0].children.push(componentConfig)
    }
    return dataConfig
  }

  return {
    // 添加一个组件
    addComponent,
    // 配置数据
    dataConfig,
    setDataConfig,
    setActiveComponentConfig,
    dataActiveComponentConfig
  }
})

export {
  useStoreElsInEditor
}