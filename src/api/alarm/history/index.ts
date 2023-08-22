import request from "@/utils/request";
import qs from "qs";

interface pagingParams {
  content: string;
  host: number;
  limit: number;
  page: number;
}

//  关键字分页查询所有离线历史
export let pagingByOfflineLog = (params: pagingParams) => {
  return request({
    url: "/offlineLog/search",
    method: "get",
    params,
  });
};

//  添加备注
export let addRemark = (params: { id: number; remark: string }) => {
  return request({
    url: "/offlineLog/addRemark",
    method: "post",
    data: qs.stringify(params),
  });
};
