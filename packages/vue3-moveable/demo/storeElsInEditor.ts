import { defineStore } from "pinia";
import { CSSProperties, reactive, ref } from "vue";
import { genInitialConfig as genInitialConfigText } from "./components/CardMetaEls/Text/exUtils";
import { genInitialConfig as genInitialConfigGroupWrapper } from "./components/CardMetaEls/GroupWrapper/exUtils";

interface BaseComponentConfig {
  name: string
  style: CSSProperties
  uuid: string
  value: any
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
  const dataConfig = reactive<ComponentConfig[]>([
    genInitialConfigGroupWrapper([genInitialConfigText()])
  ])

  // 目前选中的组件对应的数据
  const dataActiveComponentConfig = ref<null | ComponentConfig>(null)
  const setActiveComponentConfig = (componentConfig: ComponentConfig) => {
    dataActiveComponentConfig.value = componentConfig
  }
  // 目前活跃的元素
  const activeElRef = ref<HTMLElement>()
  const setActiveElRef = (el) => {
    activeElRef.value = el
  }

  // 添加一个组件
  const addComponent = (componentConfig) => {
    dataConfig.push(componentConfig)
    return dataConfig
  }

  // 移动组件数据到某一枝干下
  const moveToBranch = (componentConfig: ComponentConfig, targetBranch: BranchComponentConfig, at?: number) => {
    if (at === undefined) {
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
    dataActiveComponentConfig,
    activeElRef,
    setActiveElRef
  }
})

export {
  useStoreElsInEditor
}