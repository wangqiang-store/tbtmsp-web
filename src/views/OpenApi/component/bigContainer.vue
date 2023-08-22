<template>
  <el-row>
    <el-col :span="24">
      <el-card>
        <template #header>
          <div class="header w-100">
            <h3 class="ml-20">{{title}}</h3>
          </div>
        </template>
        <div class="body">
          <slot name="body"></slot>
        </div>
      </el-card>
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
/deep/ .el-card__header {
  padding: 0;
}
.header {
  height: 50px;
  line-height: 50px;
  background-color: #f7d77a;
}
.el-card {
  min-height: 100vh;
}
</style>