<template>
  <template v-if="Array.isArray(props.componentConfig)">
    <component v-for="(configItem) in props.componentConfig"
      :key="configItem.uuid" @click.stop="(e) => setActiveElRef(e, configItem)" :is="components[configItem.name]"
      :component-config="configItem" v-slot="slotProps">
      <template v-if="configItem.dataType === 'branch'">
        <CardElGenerator :container="slotProps.container" :component-config="configItem.children" />
      </template>
    </component>
  </template>
  <template v-else>
    <component :is="components[props.componentConfig.name]" :component-config="props.componentConfig">
      <template v-if="props.componentConfig.dataType === 'branch'">
        <CardElGenerator :key="props.componentConfig.uuid" :component-config="props.componentConfig.children" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import { ComponentConfig, useStoreElsInEditor } from '../../store/storeElsInEditor'
import CardElGenerator from './index.vue'
import { ref } from 'vue';
import GroupWrapper from '../CardMetaEls/GroupWrapper/EditorView/index.vue'
import Text from '../CardMetaEls/Text/EditorView/index.vue'
import Name from '../CardMetaEls/Name/EditorView/index.vue'
import Title from '../CardMetaEls/Title/EditorView/index.vue'
import Avatar from '../CardMetaEls/Avatar/EditorView/index.vue'
import Company from '../CardMetaEls/Company/EditorView/index.vue'
import Logo from '../CardMetaEls/Logo/EditorView/index.vue'
import Image from '../CardMetaEls/Image/EditorView/index.vue'
import useUserFocusAt from '../../store/userFocusAt';
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';

const components: Record<string, any> = {
  GroupWrapper,
  Text,
  Name,
  Title,
  Avatar,
  Company,
  Logo,
  Image
}

type Container = HTMLElement | SVGElement | null | undefined

const props = defineProps<{
  componentConfig: ComponentConfig[] | ComponentConfig,
  container?: Container
}>()

const userFocusAt = useUserFocusAt()
const storeElsInEditor = useStoreElsInEditor()
const moveableStuffRefs = useMoveableStuffRefs()
const activeElRef = ref(null)



const setActiveElRef = (e, activeConfigData) => {
  activeElRef.value = e?.target
  moveableStuffRefs.setActiveElRef(e?.target)
  moveableStuffRefs.setActiveElContainerRef(props.container)
  storeElsInEditor.setActiveComponentConfig(activeConfigData)
}

window.addEventListener('keydown', (e) => {
  const activeConfig = storeElsInEditor.dataActiveComponentConfig as any
  if (userFocusAt.userFocusAt === 'MoveableView' && e.keyCode === 8 && Array.isArray(props.componentConfig) && props.componentConfig.includes(activeConfig)) {
    const dataIdx = props.componentConfig.findIndex((d) => d === activeConfig)
    props.componentConfig.splice(dataIdx, 1)
    setActiveElRef(null, null)
  }
})


</script>