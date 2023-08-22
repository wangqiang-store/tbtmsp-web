import request from '@/utils/request';
import qs from 'qs';

interface searchRole {
  content:string,
  limit:number,
  page:number
}

//  添加角色
export let addRole = (param:any) => {
  return request({
    url:"/sysRole/addRole",
    method:"post",
    data:qs.stringify(param)
  })
}

// 删除角色
export let deleteRole = (params:{ roleId:number }) => {
  return request({
    url:"/sysRole/delete",
    method:"delete",
    params
  })
}

// 获取所有角色
export let getAllRole = () => {
  return request({
    url:"/sysRole/getAllRole",
    method:"get",
  })
}

// 获取所有角色，角色是否可选根据is_enable判断
export let getEnableRole = () => {
  return request({
    url:"/sysUser/getEnableRole",
    method:"get",
  })
}

//  关键字分页查找所有角色
export let getSysRole = (params:object) => {
  return request({
    url:"/sysRole/search",
    method:"get",
    params
  })
}

// 编辑角色
export let updateRole = (param:object) => {
  return request({
    url:"/sysRole/updateRole",
    method:"put",
    data:qs.stringify(param)
  })
}

//  根据角色ID获取模块
export let getRoleModule = (roleId:any) => {
  return request({
    url:"/roleModule/getRoleModule",
    method:"get",
    params:{
      roleId
    }
  })
}

//  添加/删除角色模块(只传树子节点ID)
export let roleModuleAddDel = (params:any) => {
  return request({
    url:"/roleModule/adddel",
    method:"post",
    data:qs.stringify(params)
  })
}

// 角色是否启用
export let enableRoleModule = (params:{ roleId:number }) => {
  return request({
    url:"/sysRole/isEnable",
    method:"put",
    data:qs.stringify(params)
  })
}