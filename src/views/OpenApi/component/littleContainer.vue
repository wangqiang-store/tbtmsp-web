<template>
  <el-row>
    <el-col :span="24">
      <div class="title w-100">
        <h4>{{title}}</h4>
      </div>
      <div class="line w-100"></div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
  },
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
.title {
  width: 200px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background-color: #f7d77a;
}
.line {
  border-bottom: 1px solid #d7d7d7;
}
</style>