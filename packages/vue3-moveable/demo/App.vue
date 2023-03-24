<template>
    <div class="root">
        <div>
            <MenuBar />
        </div>
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div @click.capture="handlePanelClick('Lib')">
                <CardMetaElList />
                <History />
            </div>
            <!-- 渲染预览 -->
            <div @click.capture="handlePanelClick('MoveableView')" :ref="setRenderAreaRef" class="render-area">
                <RulerAndGuide :renderAreaRef="renderAreaRef" />
                <div :ref="setRootContainer" class="place-ground" style="margin: 30px;z-index: 1; position: relative;">
                    <CardElGenerator v-if="dataConfig.length" :key="dataConfig[0].uuid" :container="rootContainerRef" :componentConfig="dataConfig" />
                    <EditorMoveable />
                </div>
            </div>
            <!-- 组件控制栏 -->
            <div class="right-panel">
                <div @click.capture="handlePanelClick('ConfigPanel')">
                    <!-- <ActiveConfigJSONEditor /> -->
                    <ElementControlPane />
                </div>
                <div class="result-json">
                    <JsonBox :json="convertedOldFormatConfigData" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from "vue"
import Moveable from "../src/Moveable.vue"
import { useStoreElsInEditor } from './store/storeElsInEditor'
import useUserFocusAt from './store/userFocusAt'
import CardElGenerator from './components/CardElGenerator/index.vue'
import CardMetaElList from './components/CardMetaElList/index.vue'
import ActiveConfigJSONEditor from './components/ActiveConfigJSONEditor/index.vue'
import EditorMoveable from './components/EditorMoveable/index.vue'
import ElementControlPane from './components/ElementControlPane/index.vue'
import JsonBox from './components/JsonBox/index.vue'
import MenuBar from './components/MenuBar/index.vue'
import History from './components/History/index.vue'
import RulerAndGuide from './components/RulerAndGuide/index.vue'

export default defineComponent({
    components: {
        EditorMoveable,
        Moveable,
        CardElGenerator,
        CardMetaElList,
        ActiveConfigJSONEditor,
        ElementControlPane,
        JsonBox,
        MenuBar,
        RulerAndGuide,
        History
    },
    setup() {
        const storeElsInEditor = useStoreElsInEditor()
        const rootContainerRef = ref()
        const setRootContainer = (el) => {
            if(rootContainerRef.value !== el) {
                rootContainerRef.value = el
            }
        }

        const renderAreaRef = ref()
        const setRenderAreaRef = (e) => {
            renderAreaRef.value = e
        }

        const dataConfig = computed(() => {
            return storeElsInEditor.dataConfig
        })

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
            const { dataConfig } = storeElsInEditor
            if (dataConfig?.length) {
                convertItem(dataConfig[0], ret)
            }
            return ret
        })

        return {
            dataConfig,
            setRootContainer,
            rootContainerRef,
            handlePanelClick: useUserFocusAt().setUserFocusAt,
            storeElsInEditor,
            setRenderAreaRef,
            renderAreaRef,
            convertedOldFormatConfigData
        };
    }
});
</script>

<style>
.editor-page-box {
    display: grid;
    grid-template-columns: 200px 1fr 400px;
    column-gap: 20px;
}

.render-area {
    position: relative;
    height: 90vh;
    background: #f5f5f5;
    touch-action: manipulation;
}

.right-panel {
    display: flex;
    flex-direction: column;
    height: 90vh;
    row-gap: 16px;
}

.result-json {
    overflow: auto;
}
</style>
