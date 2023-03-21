import { defineStore } from "pinia";
import { computed, CSSProperties, reactive, ref } from "vue";
import { genInitialConfig as genInitialConfigText } from "./components/CardMetaEls/Text/exUtils";
import { genInitialConfig as genInitialConfigGroupWrapper } from "./components/CardMetaEls/GroupWrapper/exUtils";

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
  // 目前活跃的元素
  const activeElRef = ref<HTMLElement>()
  const setActiveElRef = (el) => {
    activeElRef.value = el
  }
  // 目前活跃的元素
  const activeElContainerRef = ref<HTMLElement>()
  const setActiveElContainerRef = (el) => {
    activeElContainerRef.value = el
  }

  const initVal = genInitialConfigGroupWrapper([genInitialConfigText()])
  initVal.editBehavior.locked = true
  initVal.value = `url('https://img0.baidu.com/it/u=3032776730,2178451350&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800')`
  const dataConfig = ref(reactive<ComponentConfig[]>([initVal]))
  const setDataConfig = (config) => {
    setActiveComponentConfig(null)
    setActiveElRef(null)
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

  // 移动组件数据到某一枝干下
  const moveToBranch = (componentConfig: ComponentConfig, targetBranch: BranchComponentConfig, at?: number) => {
    if (at === undefined) {
      targetBranch.children.push(componentConfig)
    } else {
      targetBranch.children.splice(at, 0, componentConfig)
    }
  }

  type UserFocusAt = ''|'Lib'|'MoveableView'|'ConfigPanel'
  const userFocusAt = ref<UserFocusAt>('')
  const setUserFocusAt = (at: UserFocusAt) => {
    userFocusAt.value = at
  }

  const convertedOldFormatConfigData = computed(() => {
    const convertItem = (item, result) => {
      if (item?.config_field_name) {
        result[item.config_field_name] = {
          isShow: true,
          value: item.value,
          style: item.style
        }
      }
      item.children?.forEach(item => {
        convertItem(item, result)
      });
    }
    const ret = {}
    console.log('dataConfig changed', dataConfig.value)
    if(dataConfig.value?.length) {
      convertItem(dataConfig.value[0], ret)
    }
    return ret
  })

  // moveable ref
  const moveableRef = ref()
  const setMoveableRef = (moveableInstance) => {
    moveableRef.value = moveableInstance
  }


  return {
    // 添加一个组件
    addComponent,
    // 移动组件到某一枝干下
    moveToBranch,
    // 配置数据
    dataConfig,
    setDataConfig,
    setActiveComponentConfig,
    dataActiveComponentConfig,
    activeElRef,
    setActiveElRef,
    activeElContainerRef,
    setActiveElContainerRef,
    userFocusAt,
    setUserFocusAt,
    convertedOldFormatConfigData,
    moveableRef,
    setMoveableRef
  }
})

export {
  useStoreElsInEditor
}