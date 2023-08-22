<template>
  <transition name="fade-transform" mode="out-in">
    <!-- <keep-alive include="sectionBusway"> -->
    <component :is="componentName"></component>
    <!-- </keep-alive> -->
  </transition>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, provide, ref, watch } from "vue";
import SectionBusWay from "./sectionBusway/index.vue";
import GridHome from "./gridHome/index.vue";
import Node from "./node/index.vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    SectionBusWay,
    Node,
    GridHome
  },
  setup(props) {
    // 判断是否存在模型文件
    // let isExistFile = (filepath: string, filename: string) => {
    //   if (
    //     filepath == null ||
    //     filename == null ||
    //     filepath === "" ||
    //     filename === ""
    //   ) {
    //     return false;
    //   }
    //   var xmlhttp;
    //   if (window.XMLHttpRequest) {
    //     xmlhttp = new XMLHttpRequest();
    //   } else {
    //     xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    //   }
    //   xmlhttp.open("GET", filepath, false);
    //   xmlhttp.send();
    //   if (xmlhttp.readyState === 4) {
    //     if (xmlhttp.status === 200) return true;
    //     //url存在
    //     else if (xmlhttp.status === 404) return false;
    //     //url不存在
    //     else return false; //其他状态
    //   }
    // };
    const STORE = useStore();
    // 动态组件
    let componentName = ref("");
    let componentNameCopy = ref("");

    let configInfo = computed(() => STORE.state.configInfo);

    async function getComponentName() {
      if (
        configInfo.value.MODEL_LIST !== undefined &&
        configInfo.value.MODEL_LIST.length > 0
      ) {
        componentName.value = "SectionBusWay";
      } else {
      componentName.value = "GridHome";
      }

      componentNameCopy.value = componentName.value
      provide("componentName", componentName);
    }
    getComponentName()


    watch(() => STORE.state.data.isGoMain, async (newVal: boolean, oldVal: any) => {
      if (newVal) {
        nextTick(() => {
          componentName.value = componentNameCopy.value;
          STORE.commit("setisGoMain", false);
        })
      }
    }, { deep: true, immediate: true })

    return {
      componentName
    };
  }
});
</script>
<style scoped lang="scss">

</style>