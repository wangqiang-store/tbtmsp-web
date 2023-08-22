import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
  electricRoomId?: number;
  limit: number;
  page: number;
  name?: string;
}
//  分页获取所有母线槽
export let pagingByBusbar = (params: pagingParams) => {
  return request({
    url: "/busWay/search",
    method: "get",
    params,
  });
};

// 获取母线槽列表（级联查询）
export let findListBusbar = (params: { electricRoomId: number }) => {
  return request({
    url: "/busWay/findList",
    method: "get",
    params,
  });
};

// 新增母线槽
export let createBusbar = (params: object) => {
  return request({
    url: "/busWay/save",
    method: "post",
    data: params,
  });
};

// 编辑母线槽数据
export let updateBusbar = (params: object) => {
  return request({
    url: "/busWay/update",
    method: "put",
    data: params,
  });
};

//  删除母线槽
export let deleteBusbar = (params: { id: number }) => {
  return request({
    url: "/busWay/delete",
    method: "delete",
    params,
  });
};

//  获取母线槽关联数据
export let findBusWayData = (params: { id: number }) => {
  return request({
    url: "/busWay/findBusWayData",
    method: "get",
    params,
  });
};

//  验证母线槽开始距离、结束距离
export let busWayDis = (params: {
  id: number | null;
  channelId: number;
  startDis: number;
  endDis: number;
}) => {
  return request({
    url: "/busWay/findByChannel",
    method: "get",
    params,
  });
};

//  根据母线槽 重名查询
export let nuptialQuery = (params: { name: string }) => {
  return request({
    url: "/busWay/findByBusWayName",
    method: "GET",
    params,
  });
};

//  新增通道补偿信息
export let createCompensation = (params: object) => {
  return request({
    url: "/busWay/createCompensation",
    method: "POST",
    data: qs.stringify(params),
  });
};

// 删除通道补偿信息
export let deleteCompensation = (params: { compensationId: number }) => {
  return request({
    url: "/busWay/deleteCompensation",
    method: "DELETE",
    params,
  });
};

// 编辑通道补偿信息
export let updateCompensation = (params: object) => {
  return request({
    url: "/busWay/updateCompensation",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  获取通道的基准温度列表
export let findCompensation = (params: { busWayId: number }) => {
  return request({
    url: "/busWay/findCompensation",
    method: "GET",
    params,
  });
};
