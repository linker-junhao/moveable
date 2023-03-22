<template>
  <div>
    <component :is="activeComponent"></component>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStoreElsInEditor } from '../../storeElsInEditor';
import Avatar from '../CardMetaEls/Avatar/ControlPanelView/index.vue';
import Company from '../CardMetaEls/Company/ControlPanelView/index.vue';
import Logo from '../CardMetaEls/Logo/ControlPanelView/index.vue';
import Name from '../CardMetaEls/Name/ControlPanelView/index.vue';
import Text from '../CardMetaEls/Text/ControlPanelView/index.vue';
import Title from '../CardMetaEls/Title/ControlPanelView/index.vue';
import GroupWrapper from '../CardMetaEls/GroupWrapper/ControlPanelView/index.vue';

export default defineComponent({
  name: 'ElementControlPane',
  components: {
    Avatar,
    Company,
    Logo,
    Name,
    Text,
    Title,
    GroupWrapper
  },
  setup() {
    const store = useStoreElsInEditor();
    const activeComponent = computed(() => {
      const activeName = store.dataActiveComponentConfig?.name;
      return activeName
    });
    return {
      activeComponent,
    };
  },
});
</script>
