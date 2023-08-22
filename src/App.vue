<template>
  <el-config-provider :locale="locale">
    <!-- <app /> -->
    <router-view v-if="isRouterAlive" />
  </el-config-provider>
</template>

<script lang="ts">
import { useStore } from "vuex";
import {
  defineComponent,
  nextTick,
  onMounted,
  provide,
  reactive,
  toRefs
} from "vue";
import { sessionRead, sessionWrite } from "./api/common/common";
import axios from "axios";
import { ElConfigProvider } from 'element-plus'

import zhCn from "element-plus/lib/locale/lang/zh-cn";
export default defineComponent({
  components: {
      ElConfigProvider,
    },
  setup() {
    const STORE = useStore();
    let DATA: any = reactive({
      isRouterAlive: true
    });
    let METHODS = reactive({
      reload() {
        DATA.isRouterAlive = false;
        nextTick(() => {
          DATA.isRouterAlive = true;
        });
      }
    });
    provide("reload", METHODS.reload);
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionRead("store")) {
      STORE.replaceState(Object.assign({}, STORE.state, sessionRead("store")));
    }

    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload", () => {
      STORE.commit("SET_ROLES", []);
      sessionStorage.setItem("store", JSON.stringify(STORE.state));
    });

    axios.get("config/index.json").then((res) => {
      STORE.commit("setConfiginfo", res.data);
    });
    onMounted(() => {
      localStorage.removeItem("Router");
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      locale: zhCn,
    };
  }
});
</script>

<style>
#app {
  background-image: url("./assets/image/login_bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
