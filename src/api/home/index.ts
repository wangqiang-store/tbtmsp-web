import request from "@/utils/request";

//  首页信息展示
export let findList = () => {
  return request({
    url: "/homePage/findList",
    method: "get",
    timeout: 30000,
  });
};

//  首页节点信息展示
export let findNode = (params: { id: number }) => {
  return request({
    url: "/homePage/findNode",
    method: "get",
    params,
  });
};
