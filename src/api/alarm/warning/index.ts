import request from "@/utils/request";
import qs from "qs";

interface findWarningParams {
  busWayId?: number;
  content?: string;
  electricRoomId?: number;
  endTime?: string | null;
  startTime?: string | null;
  handle?: number;
  limit: number;
  page: number;
  type?: number;
}

interface handleWarningParams {
  content: string;
  dictValue: number;
  fileId: number;
  handle: number;
  warningId: number;
}
// 关键字分页查找所有报警记录
export let findWarning = (params: findWarningParams) => {
  return request({
    url: "/warning/search",
    method: "get",
    params,
  });
};

// 报警详情
export let warningDetails = (params: { warningId: number }) => {
  return request({
    url: "/warning/details",
    method: "get",
    params,
  });
};

// 获取报警类型列表
export let findWarningType = () => {
  return request({
    url: "/warning/findWarningType",
    method: "get",
  });
};

//  查看报告
export let getWarningReport = (params: { warningId: number }) => {
  return request({
    url: "/warning/getReport",
    method: "get",
    params,
  });
};

// 报警处理
export let handleWarning = (params: handleWarningParams) => {
  return request({
    url: "/warning/handle",
    method: "get",
    params,
  });
};

interface excelParams {
  busWayId?: number;
  electricRoomId?: number;
  sectionBusWayId?: number;
  endTime?: string;
  handle?: number;
  startTime?: string;
  type?: number;
}

//  报警信息导出为excel
export let warningExcel = (params: excelParams) => {
  return request({
    url: "/fileExport/warningExcel",
    method: "get",
    responseType: "blob",
    params,
  });
};
