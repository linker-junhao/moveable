<template>
    <div class="root">
        <div>
            <MenuBar />
        </div>
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div @click.capture="handlePanelClick('Lib')">
                <CardMetaElList />
            </div>
            <!-- 渲染预览 -->
            <div @click.capture="handlePanelClick('MoveableView')" :ref="setRenderAreaRef" class="render-area">
                <div :ref="setRulerBoxRef" class="ruler-box"></div>
                <div :ref="setVerticalRulerRef" class="ruler vertical"></div>
                <div :ref="setHorizontalRulerRef" class="ruler horizontal"></div>
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
import Guides from "@scena/guides"
import Gesto from 'gesto'
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

export default defineComponent({
    components: {
        EditorMoveable,
        Moveable,
        CardElGenerator,
        CardMetaElList,
        ActiveConfigJSONEditor,
        ElementControlPane,
        JsonBox,
        MenuBar
    },
    setup() {
        const storeElsInEditor = useStoreElsInEditor()
        const rootContainerRef = ref()
        const setRootContainer = (el) => {
            if(rootContainerRef.value !== el) {
                rootContainerRef.value = el
            }
        }

        const verticalRulerRef = ref()
        const setVerticalRulerRef = (e) => {
            verticalRulerRef.value = e
        }

        const horizontalRulerRef = ref()
        const setHorizontalRulerRef = (e) => {
            horizontalRulerRef.value = e
        }

        const rulerBoxRef = ref()
        const setRulerBoxRef = (e) => {
            rulerBoxRef.value = e
        }

        const renderAreaRef = ref()
        const setRenderAreaRef = (e) => {
            renderAreaRef.value = e
        }

        watchEffect(() => {
            if(horizontalRulerRef.value && verticalRulerRef.value && rulerBoxRef.value && renderAreaRef.value) {
                const guides1 = new Guides(horizontalRulerRef.value, {
                    type: "horizontal",
                    displayDragPos: true,
                    rulerStyle: { left: "30px", width: "calc(100% - 30px)", height: "100%" },
                    useResizeObserver: true,
                });
                const guides2 = new Guides(verticalRulerRef.value, {
                    type: "vertical",
                    displayDragPos: true,
                    rulerStyle: { top: "30px", height: "calc(100% - 30px)", width: "100%" },
                    useResizeObserver: true,
                });

                let scrollX = 0;
                let scrollY = 0;

                const box = rulerBoxRef.value;

                new Gesto(renderAreaRef.value).on("dragStart", e => {
                    if (e.inputEvent.target === box || e.inputEvent.target.nodeName === "A") {
                        return false;
                    }
                }).on("drag", e => {
                    if([...e.inputEvent.target.classList].includes('card-el')) {
                        return
                    }
                    scrollX -= e.deltaX;
                    scrollY -= e.deltaY;

                    guides1.scroll(scrollX);
                    guides1.scrollGuides(scrollY);
                    guides2.scroll(scrollY);
                    guides2.scrollGuides(scrollX);
                });
                box.addEventListener("click", () => {
                    scrollX = 0;
                    scrollY = 0;
                    guides1.scroll(0);
                    guides1.scrollGuides(0);
                    guides2.scroll(0);
                    guides2.scrollGuides(0);
                });
            }
        })

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
            setHorizontalRulerRef,
            setVerticalRulerRef,
            setRulerBoxRef,
            setRenderAreaRef,
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

.ruler-box {
    height: 30px;
    width: 30px;
    top: 0;
    left: 0;
    position: absolute;
    background: #444;
    box-sizing: border-box;
    z-index: 21;
}

.ruler {
    position: absolute;
    top: 0;
    left: 0;
}
.ruler.vertical {
    width: 30px;
    height: 100%;
}
.ruler.horizontal {
    width: 100%;
    height: 30px;
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
