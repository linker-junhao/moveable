<template>
    <div class="root">
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
            <div>
                <div @click.capture="handlePanelClick('ConfigPanel')">
                    <!-- <ActiveConfigJSONEditor /> -->
                    <ElementControlPane />
                </div>
                <div>
                    {{ storeElsInEditor.convertedOldFormatConfigData }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { computed, defineComponent, ref, watchEffect } from "vue"
import Guides from "@scena/guides"
import Gesto from 'gesto'
import Moveable from "../src/Moveable.vue"
import { useStoreElsInEditor } from './storeElsInEditor'
import TransparentBackground from './components/TransparentBackground'
import CardElGenerator from './components/CardElGenerator/index.vue'
import CardMetaElList from './components/CardMetaElList/index.vue'
import ActiveConfigJSONEditor from './components/ActiveConfigJSONEditor/index.vue'
import EditorMoveable from './components/EditorMoveable'
import ElementControlPane from './components/ElementControlPane'

export default defineComponent({
    components: {
        EditorMoveable,
        Moveable,
        TransparentBackground,
        CardElGenerator,
        CardMetaElList,
        ActiveConfigJSONEditor,
        ElementControlPane
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
                    console.log(e, e.inputEvent.target === box)
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
            console.log(storeElsInEditor.dataConfig)
            return storeElsInEditor.dataConfig
        })
        return {
            dataConfig,
            setRootContainer,
            rootContainerRef,
            handlePanelClick: storeElsInEditor.setUserFocusAt,
            storeElsInEditor,
            setHorizontalRulerRef,
            setVerticalRulerRef,
            setRulerBoxRef,
            setRenderAreaRef
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

</style>
