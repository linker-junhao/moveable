<template>
    <div class="root">
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div>
            </div>
            <!-- 渲染预览 -->
            <div class="render-area">
                <TransparentBackground />
                <div class="target1" @click="setActiveElRef">Target1</div>
                <div class="target2" @click="setActiveElRef">Target2</div>
                <Moveable :ref="setMoveableRef" :target="activeElRef" :draggable="draggable"
                    :throttleDrag="throttleDrag" :edgeDraggable="edgeDraggable" :startDragRotate="startDragRotate"
                    :throttleDragRotate="throttleDragRotate" :resizable="resizable" :keepRatio="keepRatio"
                    :throttleResize="throttleResize" :renderDirections="renderDirections" :rotatable="rotatable"
                    :throttleRotate="throttleRotate" :rotationPosition="rotationPosition" @drag="onDrag" @resize="onResize"
                    @rotate="onRotate" />
            </div>
            <!-- 组件控制栏 -->
            <div>

            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import Moveable from "../src/Moveable.vue";
import { useStoreElsInEditor } from './storeElsInEditor'
import TransparentBackground from './components/TransparentBackground'

export default defineComponent({
    components: {
        Moveable,
        TransparentBackground,
        Text: () => import('./components/CardMetaEls/Text/EditorView/indev.vue')
    },
    setup() {
        const targetRef = ref(null)
        const hideChildMoveableDefaultLines = false;
        const draggable = true;
        const throttleDrag = 1;
        const edgeDraggable = false;
        const startDragRotate = 0;
        const throttleDragRotate = 0;
        const resizable = true;
        const keepRatio = true;
        const throttleResize = 1;
        const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
        const rotatable = true;
        const throttleRotate = 0;
        const rotationPosition = "top";
        const minWidth = 0;
        const minHeight = 0;
        const maxWidth = 0;
        const maxHeight = 0;
        const moveableRef = ref(null);
        const setMoveableRef = (el) => {
            console.log(el)
            console.log(moveableRef)
            moveableRef.value = el
        }
        const activeElRef = ref(null)
        const onDragGroup = ({ events }) => {
            events.forEach(ev => {
                ev.target.style.left = `${ev.left}px`;
                ev.target.style.top = `${ev.top}px`;
            });
        };
        const onResizeGroupStart = ({ setMin, setMax }) => {
            setMin([minWidth, minHeight]);
            setMax([maxWidth, maxHeight]);
        };
        const onResizeGroup = ({ events }) => {
            events.forEach(ev => {
                ev.target.style.width = `${ev.width}px`;
                ev.target.style.height = `${ev.height}px`;
                ev.target.style.transform = ev.drag.transform;
            });
        };
        const onRotateGroup = ({ events }) => {
            events.forEach(ev => {
                ev.target.style.transform = ev.drag.transform;
            });
        };

        const onDrag = e => {
            e.target.style.transform = e.transform;
        }
        const onResize = e => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
        }
        const onRotate = e => {
            e.target.style.transform = e.drag.transform;
        }
        return {
            moveableRef,
            hideChildMoveableDefaultLines,
            draggable,
            throttleDrag,
            edgeDraggable,
            startDragRotate,
            throttleDragRotate,
            resizable,
            keepRatio,
            throttleResize,
            renderDirections,
            rotatable,
            throttleRotate,
            rotationPosition,
            onDragGroup,
            onResizeGroupStart,
            onResizeGroup,
            onRotateGroup,
            onDrag,
            onResize,
            onRotate,
            targetRef,
            setActiveElRef: e => {
                activeElRef.value = e.target
            },
            activeElRef,
            setMoveableRef
        };
    },
    data() {
        return {
            target: [],
            className: ""
        };
    },
    methods: {
        mousedown(event) {
            this.target = ['.target'];
            event.target.classList.add("target");

            this.$nextTick(() => {
                this.$refs.moveable.dragStart(event);
            });
        }
    }
});
</script>

<style>
.editor-page-box {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
}

.render-area {
    position: relative;
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
