import request from "@/utils/request";
import { getUnitName } from "../maintenance/unit";
import store from "@/store";

export let RES_SUCCESS = 200;

// 文件base路径
export let IMG_File = "";

// 图片上传
export let IMG_URL = "/file/upload";

// 视频上传
export let VIDEO_URL = "/file/upload";

//  Excel导入
export let EXCEL_URL = "/node/inputExcel";

// 根据键获取字典列表
export let getByKey = (params: { key: string }) => {
  return request({
    url: "/dict/getByKey",
    method: "get",
    params,
  });
};

// 获取商场区域
export let handleGetUnitName = async () => {
  // let { data } = await getUnitName({ unitName: "" });
  // if (data.code === RES_SUCCESS) {
  //   if (data.data.length > 0) {
  //     data.data.forEach((item: any) => {
  //       item.value = item.name;
  //     });
  //   }
  //   store.commit("SET_UnitNameList", data.data);
  // }
};

// localStorage存储数据
export let localWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
};

// localStorage读取数据
export let localRead = (key: string) => {
  let value: string | null = localStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};

// sessionStorage存储数据
export let sessionWrite = (key: string, value: any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(key, value);
};

// sessionStorage读取数据
export let sessionRead = (key: string) => {
  let value: string | null = sessionStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
    return JSON.parse(value);
  }
  return null;
};
