import request from "@/utils/request";
import qs from "qs";

//  分页获取所有分段母线槽
export let searchSectionBusWay = (params: object) => {
  return request({
    url: "/sectionSectionBusWay/search",
    method: "GET",
    params,
  });
};

//  添加分段母线槽
export let createSectionBusWay = (params: object) => {
  return request({
    url: "/sectionSectionBusWay/save",
    method: "POST",
    data: qs.stringify(params),
  });
};

//  编辑分段母线槽数据
export let updateSectionBusWay = (params: object) => {
  return request({
    url: "/sectionSectionBusWay/update",
    method: "PUT",
    data: qs.stringify(params),
  });
};

//  删除分段母线槽
export let deleteSectionBusWay = (params: object) => {
  return request({
    url: "/sectionSectionBusWay/delete",
    method: "DELETE",
    params,
  });
};

//  获取分段母线槽列表（级联查询）
export let findSectionBusWay = (params: { busWayId: number }) => {
  return request({
    url: "/sectionSectionBusWay/findByBusWay",
    method: "GET",
    params,
  });
};

//  一键编辑母线槽分段预警值数据
export let oneClickEdit = (params: object) => {
  return request({
    url: "/sectionSectionBusWay/oneClickEdit",
    method: "put",
    data: params,
  });
};

// 编辑节点XY
export let sectionResetXY = (params: { id: number; x: number; y: number }) => {
  return request({
    url: "/sectionSectionBusWay/resetXY",
    method: "PUT",
    params,
  });
};

//  获取分段母线槽关联数据
export let findSectionBusWayData = (params: { id: number }) => {
  return request({
    url: "/sectionSectionBusWay/findSectionBusWayData",
    method: "GET",
    params,
  });
};

// 编辑分段母线槽XYZ
export let sectionResetXYZ = (params: {
  id: number;
  x: number;
  y: number;
  z: number;
}) => {
  return request({
    url: "/sectionSectionBusWay/resetXY",
    method: "PUT",
    params,
  });
};

//  编辑多段分段母线槽XYZ
export let moreSectionResetXYZ = (params: any) => {
  return request({
    url: "/sectionSectionBusWay/batchResetXY",
    method: "PUT",
    data: params,
  });
};
