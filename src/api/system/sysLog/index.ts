import request from "@/utils/request";
import qs from 'qs';

//  关键字分页获取日志(没有时间参数时不传时间字段，而不是传null值)
export let getLog = (params:any) => {
  return request({
    url:"/log/getPage",
    method:"get",
    params
  })
}