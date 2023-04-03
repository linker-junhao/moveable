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
  const setDataConfig = (config: ComponentConfig[]) => {
    setActiveComponentConfig(null)
    dataConfig.value = config
  }

  const addComponentToRoot = (componentConfig: ComponentConfig) => {
    dataConfig.value.push(componentConfig)
  }

  const addComponentToActiveConfigData = (componentConfig: ComponentConfig) => {
    const activeConfigData = dataActiveComponentConfig.value
    if (activeConfigData?.dataType === 'branch') {
      activeConfigData.children.push(componentConfig)
    } else if(dataConfig.value[0].dataType === 'branch') {
      dataConfig.value[0].children.push(componentConfig)
    }
  }

  // 添加一个组件
  const addComponent = (componentConfig: ComponentConfig) => {
    if (!dataConfig.value.length) {
      addComponentToRoot(componentConfig)
    } else {
      addComponentToActiveConfigData(componentConfig)
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