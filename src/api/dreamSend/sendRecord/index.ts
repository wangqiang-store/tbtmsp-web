import request from "@/utils/request";

interface pagingParams {
  content?: string;
  limit: number;
  page: number;
  state?: number | string;
}
//  分页获取短信发送记录列表
export let findByPage = (params: pagingParams) => {
  return request({
    url: "/smsSendRecord/findByPage",
    method: "get",
    params,
  });
};

// 获取全部发送状态
export let findSendType = () => {
  return request({
    url: "/smsSendRecord/findSendType",
    method: "get",
  });
};
