import request from '@/utils/request';
import qs from 'qs';

//  查询所有省列表
export let getAllProvince = () => {
  return request({
    url:"/province/getAll",
    method:"get"
  })
}

//  根据代码查询省
export let getCodeProvince = (params:{ code:number }) => {
  return request({
    url:"/province/getByCode",
    method:"get",
    params
  })
}

//  根据省代码查询市
export let getProvinceCodeCity = (params:{ code:number }) => {
  return request({
    url:"/city/getByProvinceCode",
    method:"get",
    params
  })
}

//  根据代码获取市
export let getCity = (params:{ code:number }) => {
  return request({
    url:"/city/get",
    method:"get",
    params
  })
}

//  查询所有市
export let getAllCity = () => {
  return request({
    url:"/city/getAll",
    method:"get"
  })
}

//  根据市代码查询区
export let getCityCodeCounty = (params:{ code:number }) => {
  return request({
    url:"/county/getByCityCode",
    method:"get",
    params
  })
}

// 根据代码获取区
export let getCounty = (params:{ code:number }) => {
  return request({
    url:"/county/get",
    method:"get",
    params
  })
}

//  查询所有区
export let getAllCounty = () => {
  return request({
    url:"/county/getAll",
    method:"get"
  })
}
