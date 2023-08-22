import request from "@/utils/request";
import qs from "qs";

interface findParams {
  electricName?: string;
  limit: number;
  page: number;
}
//  分页获取所有电房
export let findByPageElectricRoom = (params: findParams) => {
  return request({
    url: "/electricRoom/search",
    method: "get",
    params,
  });
};

//  新增电房
export let createElectricRoom = (params: object) => {
  return request({
    url: "/electricRoom/save",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑电房数据
export let updateElectricRoom = (params: object) => {
  return request({
    url: "/electricRoom/update",
    method: "put",
    data: qs.stringify(params),
  });
};

//  删除电房
export let deleteElectricRoom = (params: { id: number }) => {
  return request({
    url: "/electricRoom/delete",
    method: "delete",
    params,
  });
};

//  获取电房列表
export let findElectricRoom = () => {
  return request({
    url: "/electricRoom/findElectricRoom",
    method: "get",
  });
};

//  获取电房关联数据
export let electricData = (params: { id: number }) => {
  return request({
    url: "/electricRoom/findElectricData",
    method: "get",
    params,
  });
};
