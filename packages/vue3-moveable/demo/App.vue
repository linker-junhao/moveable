<template>
    <div class="root">
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div @click.capture="handlePanelClick('Lib')">
                <CardMetaElList />
            </div>
            <!-- 渲染预览 -->
            <div @click.capture="handlePanelClick('MoveableView')" class="render-area">
                <TransparentBackground />
                <div :ref="setRootContainer" class="place-ground" style="z-index: 1; position: relative;">
                    <CardElGenerator v-if="dataConfig.length" :key="dataConfig[0].uuid" :container="rootContainerRef" :componentConfig="dataConfig" />
                    <EditorMoveable />
                </div>
            </div>
            <!-- 组件控制栏 -->
            <div @click.capture="handlePanelClick('ConfigPanel')">
                <ActiveConfigJSONEditor />
            </div>
        </div>
    </div>
</template>
<script>
import { computed, defineComponent, ref } from "vue";
import Moveable from "../src/Moveable.vue";
import { useStoreElsInEditor } from './storeElsInEditor'
import TransparentBackground from './components/TransparentBackground'
import CardElGenerator from './components/CardElGenerator/index.vue'
import CardMetaElList from './components/CardMetaElList/index.vue'
import ActiveConfigJSONEditor from './components/ActiveConfigJSONEditor/index.vue'
import EditorMoveable from './components/EditorMoveable'

export default defineComponent({
    components: {
        EditorMoveable,
        Moveable,
        TransparentBackground,
        CardElGenerator,
        CardMetaElList,
        ActiveConfigJSONEditor
    },
    setup() {
        const storeElsInEditor = useStoreElsInEditor()
        const rootContainerRef = ref()
        const setRootContainer = (el) => {
            rootContainerRef.value = el
        }
        const dataConfig = computed(() => {
            console.log(storeElsInEditor.dataConfig)
            return storeElsInEditor.dataConfig
        })
        return {
            dataConfig,
            setRootContainer,
            rootContainerRef,
            handlePanelClick: storeElsInEditor.setUserFocusAt
        };
    }
});
</script>

<style>
.editor-page-box {
    display: grid;
    grid-template-columns: 200px 1fr 600px;
}

.render-area {
    position: relative;
    height: 100%;
}

.target {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: rgb(43, 74, 253);
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}

.target1 {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: #ee8;
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}

.target2 {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: #ee8;
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}
</style>
