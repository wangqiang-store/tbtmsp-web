import request from "@/utils/request";
import qs from "qs";

interface findPageParams {
  content?: string;
  hostId?: number;
  limit: number;
  page: number;
}

//  分页获取通道列表
export let findByPageChannel = (params: findPageParams) => {
  return request({
    url: "/channel/findByPage",
    method: "get",
    params,
  });
};

//  根据通道编号、主机ID查询通道（编号唯一）
export let findByCodeChannel = (params: { code: number; hostId: number }) => {
  return request({
    url: "/channel/findByCode",
    method: "get",
    params,
  });
};

//  获取通道下关联的数据
export let findChannelData = (params: { id: number }) => {
  return request({
    url: "/channel/findChannelData",
    method: "get",
    params,
  });
};

//  获取通道列表（级联查询）
export let findChannelList = (params: { hostId: number }) => {
  return request({
    url: "/channel/findList",
    method: "get",
    params,
  });
};

//  新增通道信息
export let createChannel = (params: object) => {
  return request({
    url: "/channel/create",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑通道信息
export let updateChannel = (params: object) => {
  return request({
    url: "/channel/update",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除通道信息
export let deleteChannel = (params: { id: number }) => {
  return request({
    url: "/channel/delete",
    method: "delete",
    params,
  });
};
