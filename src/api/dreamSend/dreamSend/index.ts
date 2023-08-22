import request from "@/utils/request";
import qs from "qs";

interface findPageParams {
  content?: string;
  limit: number;
  page: number;
  reviewId?: number | string;
}

//  分页获取短信模板管理列表
export let findByPage = (params: findPageParams) => {
  return request({
    url: "/smsManagement/findByPage",
    method: "get",
    params,
  });
};

//  获取全部审核状态
export let findReviewType = () => {
  return request({
    url: "/smsManagement/findReviewType",
    method: "get",
  });
};

//  编辑短信模板信息
export let updateTemplate = (params: object) => {
  return request({
    url: "/smsManagement/update",
    method: "put",
    data: qs.stringify(params),
  });
};
