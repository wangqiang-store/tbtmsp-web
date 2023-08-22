<template>
  <h3 class="error_info">签名验证错误</h3>
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
.error_info {
  color: red;
  text-align: center;
  margin-top: 50px;
}
</style>