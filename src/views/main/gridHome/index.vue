<template>
  <transition name="fade-transform" mode="out-in">
    <component :is="componentName" :busway-data="buswayData"></component>
  </transition>
</template>
<script lang="ts">
import { defineComponent, provide, ref, watch, nextTick } from "vue";
import Busway from "./component/busway.vue";
import SectionBusway from "./component/sectionBusway.vue";
import Node from "./component/node.vue";
import { useStore } from "vuex";
export default defineComponent({
  components: { Busway, SectionBusway, Node },
  setup(props) {
    // 动态组件
    let componentName = ref("Busway");
    let buswayData = ref([]);
    const STORE = useStore();
    provide("componentName", componentName);

    // 修改组件属性值
    let setBuswayData = (data: any) => {
      buswayData.value = data;
    };
    provide("setBuswayData", setBuswayData);

    watch(() => STORE.state.data.isGoMain, async (newVal: boolean, oldVal: any) => {
      if (newVal) {
        nextTick(() => {
            componentName.value = "Busway";
            STORE.commit("setisGoMain", false);
        })
      }
    }, { deep: true, immediate: true })
    return {
      componentName,
      buswayData
    };
  }
});
</script>
<style scoped lang="scss">

</style>