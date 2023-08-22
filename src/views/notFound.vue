<template>
  <el-row>
    <el-col
      :span="24"
      class="notFound"
    >
      <div class="notFound_main">
        <h3>404</h3>
        <p>非常抱歉，您访问的页面不存在</p>
        <el-button
          type="primary"
          @click="handleGoHome"
        >返回首页</el-button>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { useRouter } from 'vue-router';
import { defineComponent, reactive, toRefs, getCurrentInstance } from 'vue';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const ROUTER = useRouter();
    let DATA: any = reactive({});
    let METHODS: any = reactive({
      handleGoHome: () => {
        ROUTER.push('/');
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.notFound {
  height: 100vh;
  background-image: url('../assets/image/u3790.png');
  background-repeat: no-repeat;
  background-position: 30% center;
  position: relative;
  .notFound_main {
    position: absolute;
    top: 40%;
    left: 70%;
    h3 {
      font-size: 100px;
      font-weight: 1000;
    }
    p {
      color: #a3a3a3;
      font-size: 20px;
      margin-bottom: 20px;
    }
  }
}
</style>