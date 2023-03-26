<template>
  <div style="">
    <h4>预设名片模板</h4>
    <div @click="() => changeCardType('horizontal')">横板名片</div>
    <div @click="() => changeCardType('vertical')">竖板名片</div>
    <hr />
    <h4>基础名片配件</h4>
    <div>
      <GroupWrapper @click="addItem" />
      <Text @click="addItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '../CardMetaEls/Text/BeOptionPreview/index.vue'
import GroupWrapper from '../CardMetaEls/GroupWrapper/BeOptionPreview/index.vue'
import Name from '../CardMetaEls/Name/BeOptionPreview/index.vue'
import Title from '../CardMetaEls/Title/BeOptionPreview/index.vue'
import Avatar from '../CardMetaEls/Avatar/BeOptionPreview/index.vue'
import Company from '../CardMetaEls/Company/BeOptionPreview/index.vue'
import { useStoreElsInEditor, ComponentConfig } from '../../store/storeElsInEditor';
import { reactive } from 'vue'
import verticalStyleTemplate from '../../presetCardTemplate/verticalStyleTemplate.json'
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs'

const changeCardType = (type: 'vertical' | 'horizontal') => {
  const storeElsInEditor = useStoreElsInEditor()
  const moveableStuffRefs = useMoveableStuffRefs()
  if (type === 'horizontal') {
    storeElsInEditor.dataConfig[0].style.width = '345px'
    storeElsInEditor.dataConfig[0].style.height = '200px'
  }
  if (type === 'vertical') {
    storeElsInEditor.setDataConfig(
      reactive<ComponentConfig[]>([JSON.parse(JSON.stringify(verticalStyleTemplate)) as ComponentConfig])
    )
    moveableStuffRefs.setActiveElRef(null)
  }
}

const addItem = (configData) => {
  const storeElsInEditor = useStoreElsInEditor()
  storeElsInEditor.addComponent(configData)
}

</script>