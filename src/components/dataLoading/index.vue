<template>
  <div class="info">
    <i class="el-icon-loading"></i>
    <p>数据加载中...</p>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
export default defineComponent({
  setup(props) {
    let DATA: any = reactive({});
    let METHODS = reactive({});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
.info {
  color: #61afef;
  text-align: center;
}
</style>