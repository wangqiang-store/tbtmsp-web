import request from "@/utils/request";
import qs from "qs";
interface pagingParams {
  busWayId?: number;
  content?: string;
  electricRoomId?: number;
  limit: number;
  page: number;
}
//  分页获取节点列表
export let pagingNode = (params: pagingParams) => {
  return request({
    url: "/node/findByPage",
    method: "get",
    params,
  });
};

//  获取节点下关联的数据
export let findNodeData = (params: { id: number }) => {
  return request({
    url: "/node/findNodeData",
    method: "get",
    params,
  });
};

// 新增节点信息
export let createNode = (params: object) => {
  return request({
    url: "/node/create",
    method: "post",
    data: params,
  });
};

// 编辑节点信息
export let updateNode = (params: object) => {
  return request({
    url: "/node/update",
    method: "put",
    data: params,
  });
};

// 删除节点信息
export let deleteNode = (params: { id: number }) => {
  return request({
    url: "/node/delete",
    method: "delete",
    params,
  });
};

//  编辑节点XY
export let resetXY = (params: { id: number; x: number; y: number }) => {
  return request({
    url: "/node/resetXY",
    method: "put",
    data: qs.stringify(params),
  });
};

//  根据母线槽编号查询重合距离段（距离段唯一）
export let findByBusWayId = (params: {
  busWayId: number;
  fiberDistance: number;
}) => {
  return request({
    url: "/node/findByBusWayId",
    method: "get",
    params,
  });
};

//  Excel导入
export let nodeInputExcel = (params: any) => {
  return request({
    url: "/node/inputExcel",
    method: "POST",
    data: params,
  });
};

//  根据分段母线槽id查询下属节点列表（级联查询）(按光纤距离正序排序)
export let findSectionNodes = (params: { SectionBusWayId: number }) => {
  return request({
    url: "/node/findNodesBySectionBusWayId",
    method: "GET",
    params,
  });
};
