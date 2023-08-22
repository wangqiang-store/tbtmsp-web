import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Layout from "../views/layout/index.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Layout",
    component: Layout,
    redirect: "/main",
    meta: { title: "首页" },
    children: [
      {
        path: "/main",
        name: "main",
        meta: { title: "首页" },
        component: () =>
          import(/* webpackChunkName: "main" */ "../views/main/index.vue"),
      },
      // {
      //   path: "/busway",
      //   name: "busway",
      //   meta: { title: "母线槽" },
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "busway" */ "@/views/main/busway/index.vue"
      //     ),
      // },
      // {
      //   path: "/node",
      //   name: "node",
      //   meta: { title: "节点" },
      //   component: () =>
      //     import(/* webpackChunkName: "node" */ "@/views/main/node/index.vue"),
      // },
      {
        path: "/dreamsetting",
        name: "dreamsetting",
        meta: { title: "短信设置" },
        component: () =>
          import(
            /* webpackChunkName: "dreamsetting" */ "@/views/dream/dreamsetting/index.vue"
          ),
      },
      {
        path: "/help",
        name: "help",
        meta: { title: "帮助" },
        component: () =>
          import(/* webpackChunkName: "help" */ "@/components/Help/index.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/login/index.vue"),
  },
  {
    path: "/OpenApi",
    name: "OpenApi",
    meta: { title: "报警详情", isHide: true },
    component: () =>
      import(/* webpackChunkName: "OpenApi" */ "../views/OpenApi/index.vue"),
    children: [
      {
        path: "getAccident",
        name: "getAccident",
        meta: { title: "报警详情", isHide: true },
        component: () =>
          import(
            /* webpackChunkName: "getAccident" */ "../views/OpenApi/getAccident/index.vue"
          ),
      },
      {
        path: "error",
        name: "error",
        meta: { title: "错误", isHide: true },
        component: () =>
          import(
            /* webpackChunkName: "error" */ "../views/OpenApi/error/index.vue"
          ),
      },
    ],
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
});

export default router;
