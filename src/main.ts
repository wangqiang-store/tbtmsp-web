import { createApp, nextTick } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./permission";
// 引入UI库element-plus
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import locale from "element-plus/lib/locale/lang/zh-cn";
// import locale from 'element-plus/es/locale/lang/zh-cn'
// 引入echarts
import * as echarts from "echarts";
// 引入iconfont字体
import "@/font/iconfont/iconfont.css";

import dayjs from 'dayjs'
// import customParseFormat from 'dayjs/plugin/customParseFormat'
// dayjs.extend(customParseFormat)

// 引入公共样式
import "@/styles/common.scss";
const app = createApp(App);
app.directive("focus", {
  mounted(el: Element, binding: any) {
    nextTick(() => {
      var input: any = el.children[0];
      input.focus();
    });
  },
});
app.config.globalProperties.echarts = echarts;
app.config.globalProperties.dayjs = dayjs;
app
  .use(store)
  .use(router)
  .use(ElementPlus, { locale })
  .mount("#app");
