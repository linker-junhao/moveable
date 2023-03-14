<template>
  <div style="">
    <div @click="() => changeCardType('horizontal')">横板名片</div>
    <div @click="() => changeCardType('vertical')">竖板名片</div>
    <hr />
    <div>
      <GroupWrapper />
      <Text @click="addItem" />
      <Name @click="addItem" />
      <Title @click="addItem" />
      <Avatar @click="addItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '../CardMetaEls/Text/BeOptionPreview/index.vue'
import GroupWrapper from '../CardMetaEls/GroupWrapper/BeOptionPreview/index.vue'
import Name from '../CardMetaEls/Name/BeOptionPreview/index.vue'
import Title from '../CardMetaEls/Title/BeOptionPreview/index.vue'
import Avatar from '../CardMetaEls/Avatar/BeOptionPreview/index.vue'
import { useStoreElsInEditor } from '../../storeElsInEditor';

const changeCardType = (type: 'vertical'|'horizontal') => {
  const storeElsInEditor = useStoreElsInEditor()
  if (type === 'horizontal') {
    storeElsInEditor.dataConfig[0].style.width = '345px'
    storeElsInEditor.dataConfig[0].style.height = '200px'
  }
  if (type === 'vertical') {
    storeElsInEditor.dataConfig[0].style.width = '375px'
    storeElsInEditor.dataConfig[0].style.height = '500px'
  }
}

const addItem = (configData) => {
  const storeElsInEditor = useStoreElsInEditor()
  console.log(configData)
  if(storeElsInEditor.dataConfig[0].dataType === 'branch') {
    storeElsInEditor.dataConfig[0].children.push(configData)
  }
}

</script>