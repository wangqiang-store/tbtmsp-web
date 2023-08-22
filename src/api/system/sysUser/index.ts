import request from "@/utils/request";
import qs from "qs";
// 搜索用户接口
interface searchUser {
  content?: string;
  limit: number;
  page: number;
  roleId?: number;
  unitId?: number;
}

// 用户密码是否六个月未修改(返回boolean结果,true为超过六个月没修改)
export function isUpdatePwd(userId: number) {
  return request({
    url: "/sysUser/isUpdatePwd",
    method: "get",
    params: {
      userId,
    },
  });
}

// 获取token
export let signIn = (params: { username: string; password: string }) => {
  return request({
    url: "/sysUser/token",
    method: "post",
    data: qs.stringify(params),
  });
};

// 获取用户信息
export let getInfo = () => {
  return request({
    url: "/sysUser/info",
    method: "get",
  });
};

// 修改密码
export let updatePwd = (newPwd: string, oldPwd: string) => {
  return request({
    url: "/sysUser/updatePwd",
    method: "put",
    data: qs.stringify({ newPwd, oldPwd }),
  });
};

//  关键字分页获取所有用户
export let sysUserSearch = (params: searchUser) => {
  return request({
    url: "/sysUser/search",
    method: "get",
    params,
  });
};

//  添加用户
export let createUser = (params: object) => {
  return request({
    url: "/sysUser/addUser",
    method: "post",
    data: qs.stringify(params),
  });
};

// 编辑用户
export let updateUser = (params: object) => {
  return request({
    url: "/sysUser/updateUser",
    method: "put",
    data: qs.stringify(params),
  });
};

//  用户名查重
export let checkRepeat = (params: { username: string }) => {
  return request({
    url: "/sysUser/checkRepeat",
    method: "get",
    params,
  });
};

//  用户是否启用
export let enableUser = (params: { userId: number }) => {
  return request({
    url: "/sysUser/enableUser",
    method: "put",
    data: qs.stringify(params),
  });
};

//  重置用户密码
export let resetPassword = (params: { userId: number }) => {
  return request({
    url: "/sysUser/resetPassword",
    method: "put",
    data: qs.stringify(params),
  });
};

//  根据用户绑定单位获取单位列表
export let getUnit = () => {
  return request({
    url: "/sysUser/getUnit",
    method: "get",
  });
};
