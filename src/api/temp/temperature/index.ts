import request from "@/utils/request";

// 实时温度查询;
export let searchTemperature = (params: { busWayId: number }) => {
  return request({
    url: "/historicalData/searchBusWay",
    method: "get",
    params,
  });
};
