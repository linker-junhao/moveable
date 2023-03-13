import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import * as CSS from 'csstype'

interface BaseComponentConfig {
  name: String
  style: CSS.PropertiesHyphen<string | number>
}

interface LeafComponentConfig extends BaseComponentConfig {
  dataType: 'leaf'
}
interface BranchComponentConfig extends BaseComponentConfig {
  dataType: 'branch'
  children: Array<ComponentConfig>
}
export type ComponentConfig = LeafComponentConfig | BranchComponentConfig

const useStoreElsInEditor = defineStore('ElsInEditor', () => {
  const dataConfig = reactive<ComponentConfig[]>([])

  // 目前选中的组件对应的数据
  const dataActiveComponentConfig = ref<null|ComponentConfig>(null)
  const setActiveComponentConfig = (componentConfig: ComponentConfig) => {
    dataActiveComponentConfig.value = componentConfig
  }

  // 添加一个组件
  const addComponent = (componentConfig) => {
    dataConfig.push(componentConfig)
    return dataConfig
  }

  // 移动组件数据到某一枝干下
  const moveToBranch = (componentConfig: ComponentConfig, targetBranch: BranchComponentConfig, at?: number) => {
    if(at === undefined) {
      targetBranch.children.push(componentConfig)
    } else {
      targetBranch.children.splice(at, 0, componentConfig)
    }
  }

  return {
    // 添加一个组件
    addComponent,
    // 移动组件到某一枝干下
    moveToBranch,
    // 配置数据
    dataConfig,
    setActiveComponentConfig,
    dataActiveComponentConfig
  }
})

export {
  useStoreElsInEditor
}