import axios from "axios";
import store from "../store";
import { getToken, removeToken } from "./auth";
import { ElMessage } from "element-plus";
// import router from 'vue-router'
// 创建axios实例
// console.log("process.env: ", process.env);
const service = axios.create({
  baseURL: process.env.BASE_URL, // api 的 base_url
  timeout: 5000 * 6, // 请求超时时间
});

// 拦截请求白名单
let whiteListUrls = [
  "/busWay/findByChannel",
  "/sysUser/checkRepeat",
  "/host/findByUid",
  "/channel/findByCode",
  "/node/findByBusWayId",
  "/monitoringZone/judgeDis",
  "/busWay/findByBusWayName",
  "/sectionSectionBusWay/resetXY",
];

// 正在进行中的请求列表
let reqList: any[] = [];

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function(
  reqList: any,
  url: string,
  cancel: any,
  errorMessage?: string
) {
  const errorMsg = errorMessage || "";
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !whiteListUrls.includes(url)) {
      cancel(errorMsg);
      return;
    }
  }
  reqList.push(url);
};

/**
 * 允许某个请求可以继续进行
 * @param {array} reqList 全部请求列表
 * @param {string} url 请求地址
 */
const allowRequest = function(reqList: any, url: string) {
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url && !whiteListUrls.includes(url)) {
      reqList.splice(i, 1);
      break;
    }
  }
};

// request拦截器
service.interceptors.request.use(
  (config) => {
    if (store.getters.token && config.url !== "/OpenApi/getAccident") {
      config.headers["Authorization"] = getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改 Accept
    }
    let cancel;
    // 设置cancelToken对象
    config.cancelToken = new axios.CancelToken(function(c) {
      cancel = c;
    });
    // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    stopRepeatRequest(reqList, config.url as string, cancel);
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    let time = setTimeout(() => {
      allowRequest(reqList, response.config.url as string);
      clearTimeout(time);
    }, 200);
    if (response.data.code === 401) {
      // removeToken();
      // localStorage.removeItem("ExpirationTime");
      sessionStorage.clear();
      localStorage.removeItem("Admin-Token");
      localStorage.removeItem("Router");
      localStorage.removeItem("ExpirationTime");
      ElMessage.warning("用户已超时,请确认账号情况重新登录");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
    if (
      response.data.code === 500 &&
      !whiteListUrls.includes(response.config.url as string)
    ) {
      ElMessage({
        message: response.data.msg,
        type: "error",
      });
    }
    return response;
  },
  (error) => {
    // console.log("axios.isCancel(error);: ", axios.isCancel(error));
    console.log("err" + error); // for debug
    let errorMsg =
      error.message.indexOf("timeout") !== -1 ? "请求超时" : error.message;
    if (error.message) {
      ElMessage({
        message: errorMsg,
        type: "error",
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);
export default service;
