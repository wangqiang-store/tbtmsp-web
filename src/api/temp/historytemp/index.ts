import request from "@/utils/request";

interface historyParams {
  endTime: string;
  nodeId: number;
  startTime: string;
}
interface buswayParams {
  endTime: string;
  busWayId: number;
  startTime: string;
}
//  根据节点和起始结束时间获取数据
export let searchHistoryData = (params: historyParams) => {
  return request({
    url: "/historicalData/searchData",
    method: "get",
    params,
    timeout: 0,
  });
};

// 起始结束时间查询该母线槽所有的历史数据
export let searchHistoryBuswayData = (params: buswayParams) => {
  return request({
    url: "/historicalData/findAll",
    method: "get",
    params,
    timeout: 0,
  });
};

//  根据id查询获取温度数据
export let findDataByBusway = (params: { id: number }) => {
  return request({
    url: "/historicalData/findDataByHistorical",
    method: "get",
    params,
    timeout: 0,
  });
};

//  搜索条件多级封装
export let searchNode = () => {
  return request({
    url: "/historicalData/searchNode",
    method: "get",
  });
};

//  节点相关信息和报警数据导出为Excel;
export let exportNodeExcel = (params: {
  endTime: string;
  nodeId: number;
  startTime: string;
}) => {
  return request({
    url: "/fileExport/exportNodeExcel",
    method: "get",
    params,
    responseType: "blob",
    timeout: 0,
  });
};
