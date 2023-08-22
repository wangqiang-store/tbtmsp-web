import request from "@/utils/request";
import qs from "qs";

interface findPageParams {
  content?: string;
  limit: number;
  page: number;
  status?: boolean;
  type?: number;
}
//  分页获取主机列表
export let findByPageHost = (params: findPageParams) => {
  return request({
    url: "/host/findByPage",
    method: "get",
    params,
  });
};

//  获取主机列表（根据单位）
export let findHostList = () => {
  return request({
    url: "/host/findList",
    method: "get",
  });
};

//  获取主机类型
export let findHostType = () => {
  return request({
    url: "/host/findHostType",
    method: "get",
  });
};

//  新增主机信息
export let createHost = (params: object) => {
  return request({
    url: "/host/create",
    method: "post",
    data: qs.stringify(params),
  });
};

//  编辑主机信息
export let updateHost = (params: object) => {
  return request({
    url: "/host/update",
    method: "put",
    data: qs.stringify(params),
  });
};

//  删除主机信息
export let deleteHost = (params: { id: number }) => {
  return request({
    url: "/host/delete",
    method: "delete",
    params,
  });
};

//  获取主机下关联的数据
export let findHostData = (params: { id: number }) => {
  return request({
    url: "/host/findHostData",
    method: "get",
    params,
  });
};

//  根据编号查找主机（判断主机唯一）
export let findByUid = (params: { uid: number }) => {
  return request({
    url: "/host/findByUid",
    method: "get",
    params,
  });
};
