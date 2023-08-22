import Layout from "@/views/layout/index.vue";
// 生成动态路由
export function generaMenu(routers: any, data: any) {
  data.forEach((item: any) => {
    if (item.component != null && item.href != null) {
      const menu = {
        path: item.href,
        component:
          item.component == "Layout"
            ? Layout
            : () => import("@/views" + item.component + "/index.vue"),
        children: [],
        meta: { title: item.name, id: item.id, icon: item.icon },
      };
      if (item.children && item.children[0].href != "editable") {
        generaMenu(menu.children, item.children);
      }
      routers.push(menu);
    }
  });
  return routers;
}
