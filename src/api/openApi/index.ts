import request from "@/utils/request";

// 报警数据
export let getAccident = (params: { alarmId: number }) => {
  return request({
    url: "/OpenApi/getAccident",
    method: "get",
    params,
  });
};

// 母线槽详情
export let getBusWay = (params: { busWayId: number }) => {
  return request({
    url: "/OpenApi/getBusWay",
    method: "get",
    params,
  });
};

// 节点历史数据
export let getHistory = (params: {
  nodeId: number;
  startTime?: string;
  endTime?: string;
}) => {
  return request({
    url: "/OpenApi/getHistory",
    method: "get",
    params,
  });
};
