<template>
    <div class="root">
        <div class="top-area">
            <MenuBar />
        </div>
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div class="left-panel" @click.capture="handlePanelClick('Lib')">
                <CardMetaElList />
                <History />
            </div>
            <!-- 渲染预览 -->
            <div style="overflow: hidden; position: relative;">
                <div @click.capture="handlePanelClick('MoveableView')" :ref="setRenderAreaRef" class="render-area">
                    <RulerAndGuide :renderAreaRef="renderAreaRef" />
                    <div :ref="setRootContainer" class="place-ground" style="margin: 30px;z-index: 1; position: relative;">
                        <CardElGenerator v-if="dataConfig.length" :key="dataConfig[0].uuid" :container="rootContainerRef"
                            :componentConfig="dataConfig" />
                        <EditorMoveable :root-container="rootContainerRef" />
                    </div>
                </div>
                <div class="scale-ctrl-box">
                    <ScaleControl />
                </div>
            </div>
            <!-- 组件控制栏 -->
            <div class="right-panel">
                <div @click.capture="handlePanelClick('ConfigPanel')">
                    <ElementControlPane />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from "vue"
import Moveable from "../src/Moveable.vue"
import { ComponentConfig, useStoreElsInEditor } from './store/storeElsInEditor'
import useUserFocusAt from './store/userFocusAt'
import { useCanvasConfig } from './store/editorConfigs/canvasConfig'
import CardElGenerator from './components/CardElGenerator/index.vue'
import CardMetaElList from './components/CardMetaElList/index.vue'
import ActiveConfigJSONEditor from './components/ActiveConfigJSONEditor/index.vue'
import EditorMoveable from './components/EditorMoveable/index.vue'
import ElementControlPane from './components/ElementControlPane/index.vue'
import MenuBar from './components/MenuBar/index.vue'
import History from './components/History/index.vue'
import RulerAndGuide from './components/RulerAndGuide/index.vue'
import ScaleControl from './components/ScaleControl/index.vue'

export default defineComponent({
    components: {
        ScaleControl,
        EditorMoveable,
        Moveable,
        CardElGenerator,
        CardMetaElList,
        ActiveConfigJSONEditor,
        ElementControlPane,
        MenuBar,
        RulerAndGuide,
        History
    },
    setup() {
        const storeElsInEditor = useStoreElsInEditor()

        const rootContainerRef = ref()
        const setRootContainer = (el: HTMLElement) => {
            if (rootContainerRef.value !== el) {
                rootContainerRef.value = el
            }
        }

        const canvasConfig = useCanvasConfig()
        watchEffect(() => {
            const scale = canvasConfig.scale
            if(rootContainerRef.value) {
                rootContainerRef.value.style.setProperty('--canvas-scale', scale)
            }
        })

        const renderAreaRef = ref()
        const setRenderAreaRef = (e: HTMLElement) => {
            renderAreaRef.value = e
        }

        const dataConfig = computed(() => {
            return storeElsInEditor.dataConfig
        })

        const convertedOldFormatConfigData = computed(() => {
            type Item = ComponentConfig & { config_field_name?: string }
            const convertItem = (item: Item, result: any) => {
                if (item?.config_field_name) {
                    result[item.config_field_name] = {
                        isShow: true,
                        value: item.value,
                        style: item.style
                    }
                    if(item.dataType === 'leaf' && item.icon) {
                        result[item.config_field_name].icon = {
                            isShow: true,
                            value: item.icon.value,
                            style: item.icon.style,
                            class: item.icon.class
                        }
                    }
                }
                if(item.dataType === 'branch') {
                    item.children?.forEach(item => {
                        convertItem(item, result)
                    });
                }
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

<style scoped>
.root {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.editor-page-box {
    display: grid;
    grid-template-columns: 220px 1fr 350px;
    column-gap: 0;
    z-index: 1;
    position: relative;
    flex-grow: 1;
}

.render-area {
    position: relative;
    height: 100%;
    background: #fcfcfc;
    touch-action: manipulation;
    overflow: auto;
}

.right-panel {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding: 18px;
}
.left-panel, .right-panel, .top-area {
    z-index: 2;
    box-shadow: 0 0 6px #cbcbcb;
    position: relative;
}
.top-area {
    z-index: 3;
}

</style>

<style>
.place-ground {
    --canvas-scale: 1;
}
.place-ground > .card-el {
    transform: scale(var(--canvas-scale, 1));
    transform-origin: top left;
}
body {
    margin: 0;
}
.scale-ctrl-box {
    position: absolute;
    bottom: 10px;
    right: 20px;
}
</style>
