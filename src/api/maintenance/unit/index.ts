import request from "@/utils/request";
import qs from "qs";

interface findUnitParams {
  content?: string;
  limit: number;
  page: number;
}

//  获取单位管理页面信息
export let findByPageUnit = (params: findUnitParams) => {
  return request({
    url: "/unit/findByPage",
    method: "get",
    params,
  });
};

//  获取单位管理页面信息
export let findOneUnit = () => {
  return request({
    url: "/unit/findOne",
    method: "get",
  });
};

//  新增维保单位信息
export let createUnit = (params: object) => {
  return request({
    url: "/unit/create",
    method: "post",
    data: qs.stringify(params),
  });
};

//  编辑维保单位信息
export let updateUnit = (params: object) => {
  return request({
    url: "/unit/update",
    method: "put",
    data: qs.stringify(params),
  });
};

//  删除维保单位信息
export let deleteUnit = (params: { id: number }) => {
  return request({
    url: "/unit/delete",
    method: "put",
    data: qs.stringify(params),
  });
};

//  获取单位电房列表
export let findUnitElectric = (params: { unitId: number }) => {
  return request({
    url: "/unitNode/findUnitElectric",
    method: "get",
    params,
  });
};

interface daaesttParams {
  addList: Array<number>;
  delList: Array<number>;
  unitId: number;
}
//  单位电房的添加与修改
export let addDel = (params: daaesttParams) => {
  return request({
    url: "/unitNode/setData",
    method: "post",
    data: qs.stringify(params),
  });
};

// 单位名字搜索
export let getUnitName = (params: { unitName: string }) => {
  return request({
    url: "/unit/getUnitName",
    method: "get",
    params,
  });
};
