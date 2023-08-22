<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
export default defineComponent({
  setup(props) {
    let DATA = reactive({});
    let METHODS = reactive({});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
</style>