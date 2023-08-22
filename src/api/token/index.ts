import request from "@/utils/request";
import qs from "qs";

//  二次认证的认证绑定
export let bindingSecret = (params: { code: string; secret: string }) => {
  return request({
    url: "/sysUser/bindingSecret",
    method: "post",
    data: qs.stringify(params),
  });
};

// 二次验证的URI接口
export let createSecretUri = () => {
  return request({
    url: "/sysUser/createSecretUri",
    method: "get",
  });
};

//  通过token获取用户数据
export let getByJwsAndKey = (params: { jws: string; key: string }) => {
  return request({
    url: "/sysUser/getByJwsAndKey",
    method: "get",
    params,
  });
};

//  刷新token
export let refreshToken = (params: { jws: string | null }) => {
  return request({
    url: "/sysUser/refreshToken",
    method: "get",
    params,
  });
};

//  二次验证的解绑
export let removeSecret = (params: { code: string }) => {
  return request({
    url: "/sysUser/removeSecret",
    method: "post",
    params,
  });
};

//  二次验证获取token
export let twoLogin = (params: {
  code: string;
  password: string;
  username: string;
}) => {
  return request({
    url: "/sysUser/totp",
    method: "post",
    data: qs.stringify(params),
  });
};
