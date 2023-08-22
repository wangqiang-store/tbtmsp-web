import request from "@/utils/request";
import qs from "qs";

// 分页获取监测分区
export let searchMonitoringZone = (params: {
  busWayId?: number;
  electricRoomId?: number;
  limit: number;
  page: number;
  name?: string;
}) => {
  return request({
    url: "/monitoringZone/search",
    method: "get",
    params,
  });
};

//  添加监测分区
export let createMonitoringZone = (params: object) => {
  return request({
    url: "/monitoringZone/save",
    method: "post",
    data: qs.stringify(params),
  });
};

// 更新监测分区
export let updateMonitoringZone = (params: object) => {
  return request({
    url: "/monitoringZone/update",
    method: "put",
    data: qs.stringify(params),
  });
};

// 删除监测分区
export let deleteMonitoringZone = (params: { id: number }) => {
  return request({
    url: "/monitoringZone/delete",
    method: "delete",
    params,
  });
};

// 编辑监测分区XY
export let monitoringZoneResetXY = (params: {
  id: number;
  x: number;
  y: number;
}) => {
  return request({
    url: "/monitoringZone/resetXY",
    method: "put",
    data: qs.stringify(params),
  });
};

//  判断分区距离是否在母线槽范围
export let judgeDis = (params: { busWayId: number; distance: number }) => {
  return request({
    url: "/monitoringZone/judgeDis",
    method: "get",
    params,
  });
};
