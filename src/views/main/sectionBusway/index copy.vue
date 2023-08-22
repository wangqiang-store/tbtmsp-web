<template>
  <div class="home_container">
    <!-- head  头部 -->
    <div class="home_head mt-10 ml-10">
      <el-switch v-model="isLock" active-text="解锁标识点" inactive-text="锁定标识点"></el-switch>
      <el-input v-model="markingValue" style="width:150px" class="mr-10 ml-10">
        <template #append>px</template>
      </el-input>
      <el-button type="primary" @click="handleReset">重置标识点大小</el-button>
    </div>

    <!-- body 主体 @mousemove="handleMousemoveImg"-->
    <div class="home_body" @mousemove="mousemoveaa" @mouseup="mouseupaa" @dblclick="aaabb" @mousedown="mousedownaa">
      <img src="models/home/万达.jpg" class="wanda_img" draggable="false" ref="homeImg">
      <!-- <ObjModel
        :markingList="markingList"
        modelType="FBX"
      /> -->
      <!-- <FbxModel :markingList="markingList" /> -->
      <el-tooltip placement="top" v-for="item of markingList" :key="item.id" :visible-arrow="false">
        <template #content>
          <div>
            <p class="markingInfo">母线槽分段:{{ item.sectionBusWayName }}</p>
            <p class="markingInfo">节点温度预警值:{{ item.temperatureWarning }}</p>
            <p class="markingInfo">节点温度差预警值:{{ item.differenceWarning }}</p>
            <p class="markingInfo">节点最新平均温度:{{ item.avgTemp ? item.avgTemp + '℃' : "暂无数据" }}</p>
            <p class="markingInfo">最新采集时间:{{ item.acquisitionTime || '暂无数据' }}</p>
          </div>
        </template>
        <span class="markingItem iconfont icon-dangqianweizhi"
          :style="{ fontSize: markingSize + 'px', left: item.x + '%', top: item.y + '%', color: item.color }"
          @mousedown="handleNodedrag($event, item)" :data-name="item.sectionBusWayName"
          :data-warning="item.typeName ? item.sectionBusWayName : ''" @click="handleClickMarking(item)">
        </span>
      </el-tooltip>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  onMounted,
  onUnmounted,
  ref,
  getCurrentInstance,
  inject,
  onActivated
} from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import initEcharts from "@/components/initEcharts/index.vue";
import EleTable from "@/components/eleTable/index.vue";
import DataLoading from "@/components/dataLoading/index.vue";
import { ElMessage } from "element-plus";
import { findList } from "@/api/home/index";
import ObjModel from "@/components/threeModel/index.vue";

import {
  IMG_File,
  localRead,
  localWrite,
  RES_SUCCESS,
  sessionRead
} from "@/api/common/common";
import { sectionResetXY } from "@/api/maintenance/buswaySubsection";
export default defineComponent({
  name: "sectionBusway",
  components: { initEcharts, EleTable, DataLoading, ObjModel },
  setup() {
    const { proxy }: any = getCurrentInstance();
    // 获取vue实例化对象
    const STORE = useStore();
    // 获取路由实例
    let scaleVal = ref(1)
    const offsetX = ref(0);
    const offsetY = ref(0);
    const canMove = ref(false);
    const aaabb = (e: any) => {
      // aa
      // homeImg.value.style.transform = "scale(1.2)";
      scaleVal.value += 0.1
      homeImg.value.style.transform = `scale(${scaleVal.value})`;
      homeImg.value.clientWidth = Number(homeImg.value.clientWidth)*scaleVal.value
      homeImg.value.clientHeight = Number(homeImg.value.clientHeight)*scaleVal.value

    }
    const mousedownaa = (e: any) => {
      console.log("mousedownaa", e);
      canMove.value = true
      offsetX.value = e.offsetX;
      offsetY.value = e.offsetY;
    }
    const mouseupaa = (e: any) => {
      canMove.value = false
    }
    const mousemoveaa = (e: any) => {
      if (canMove.value) {
        let left = e.clientX - offsetX.value;
        let top = e.clientY - offsetY.value;
        //设置pop的top和left属性
        // homeImg.value.style.left = left + "px";
        // homeImg.value.style.top = top + "px";
        homeImg.value.clientWidth = Number(homeImg.value.clientWidth)*scaleVal.value
      homeImg.value.clientHeight = Number(homeImg.value.clientHeight)*scaleVal.value
        // console.log("mousemoveaa", homeImg.value.clientWidth);
      }

    }
    const ROUTER = useRouter();
    let homeImg = ref();

    let triggerAlarm: any = inject("triggerAlarm");
    let setWarningList: any = inject("setWarningList");
    let setWaringStatus: any = inject("setWaringStatus");
    let componentName: any = inject("componentName");

    /******************************** 首页 静态模型展示 ********************************/
    let isLock = ref(false); //控制是否拖拽标识
    let markingValue = ref(localRead("markingSize") || 35); //标识大小
    let markingSize = ref(localRead("markingSize") || 35);
    let markingLocation: any = reactive({
      //保存标识 位置
      x: "",
      y: ""
    });
    let editmarkingLocation: any = reactive({
      x: "",
      y: "",
      id: null
    });
    let isMarkingMove = ref(false);
    // 设置标识大小
    let handleReset = () => {
      markingSize.value = markingValue.value;
      localWrite("markingSize", markingValue.value);
    };

    // 首页数据
    let markingList: any = ref([]); //标识数据
    let warningList: any = ref([]); //报警数据
    let getHomeData = async () => {
      let markings: any = [];
      // 判断是否报警
      let warningTypeList: Array<string> = [];
      warningList.value = [];
      let { data } = await findList();
      if (data.code === RES_SUCCESS) {
        if (data.data.length > 0) {
          // 循环遍历 电房
          data.data.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                // 循环遍历 分段母线槽 获取全部分段母线槽
                if (key.warningSectionBusWayDtos.length > 0) {
                  key.warningSectionBusWayDtos.forEach((val: any) => {
                    warningTypeList.push(val.typeName);
                    if (val.typeName) {
                      val.color = "#ff0000";
                      if (val.homePageNodeDtoList.length > 0) {
                        // 循环 节点数据
                        val.homePageNodeDtoList.forEach((k: any) => {
                          if (k.warningType) {
                            k.color = "#ff0000";
                            k.warningName = k.nodeName;
                          } else {
                            k.color = "#008800";
                          }
                        });
                      }
                      if (warningList.value.length <= 4) {
                        warningList.value.push({
                          busWayId: val.busWayId,
                          sectionBusWayId: val.sectionBusWayId,
                          sectionBusWayName: val.sectionBusWayName,
                          filePath:
                            val.filePath ||
                            require("@/assets/image/noFile.png"),
                          nodeList: val.homePageNodeDtoList,
                          createTime: val.createTime
                        });
                      }
                    } else {
                      val.color = "#008000";
                    }
                    markings.push(val);
                  });
                }
              });
            }
          });
        }
      }
      STORE.state.data.warkingList.forEach((v: any) => {
        // 保留 标识点温度数据
        markings.forEach((m: any) => {
          if (v.sectionBusWayId === m.sectionBusWayId) {
            m.homePageNodeDtoList.forEach((j: any) => {
              v.homePageNodeDtoList.forEach((k: any) => {
                if (j.nodeId === k.nodeId) {
                  j.nodeTemp = k.nodeTemp;
                  j.acquisitionTime = j.nodeTemp ? v.acquisitionTime : null;
                }
              });
            });
            m.avgTemp = v.avgTemp;
            m.acquisitionTime = v.acquisitionTime;
          }
        });

        // 保留 报警点数据
        warningList.value.forEach((w: any) => {
          if (v.sectionBusWayId === w.sectionBusWayId) {
            w.nodeList.forEach((j: any) => {
              v.homePageNodeDtoList.forEach((k: any) => {
                if (j.nodeId === k.nodeId) {
                  j.nodeTemp = k.nodeTemp;
                  j.realtimeTemp = k.nodeTemp
                    ? `${k.nodeTemp?.toFixed(1)}℃`
                    : null;

                  if (j.warningType) {
                    j.warningName = k.nodeTemp
                      ? `${k.nodeName} : ${k.nodeTemp?.toFixed(1)}℃`
                      : k.nodeName;
                  }
                }
              });
            });
          }
        });
      });

      markingList.value = JSON.parse(JSON.stringify(markings));
      // markingList.value = JSON.parse(JSON.stringify(markings)).map((item:any,index:number)=>{
      //   if(index===0){
      //     item.x = 43.33
      //     item.y = 3.82
      //   }
      //   return item
      // });
      // console.log(222333,markingList.value);

      // 更改报警状态
      let isWarning = warningTypeList.some((item) => {
        return typeof item === "string";
      });
      setWaringStatus(isWarning);
      setWarningList(warningList.value);
      triggerAlarm();
      STORE.commit("setWarkingList", markingList.value);
    };

    // 标识点拖拽
    let handleNodedrag = (e: any, item: any) => {
      let document = window.document;
      let ele = e.target;
      let disX = e.clientX - e.target.offsetLeft;
      let disY = e.clientY - e.target.offsetTop;
      markingLocation.x = item.x;
      markingLocation.y = item.y;
      var isDown = true;
      document.onmousemove = (e) => {
        if (isDown == false || isLock.value === false) {
          return;
        }
        isMarkingMove.value = true;
        // 获取节点位置
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        ele.style.left = left + "px";
        ele.style.top = top + "px";
        // 获取图片宽、高
        let ImgWidth = homeImg.value.clientWidth;
        let ImgHight = homeImg.value.clientHeight;

        editmarkingLocation.x = +((left / ImgWidth) * 100).toFixed(2);
        editmarkingLocation.y = +((top / ImgHight) * 100).toFixed(2);
        editmarkingLocation.id = item.sectionBusWayId;
        console.log("图片", left, top, editmarkingLocation);
        if (left < 0) {
          ele.style.left = 0;
        }
        if (left > ImgWidth) {
          ele.style.left = ImgWidth + "px";
        }
        if (top < 0) {
          ele.style.top = 0;
        }
        if (top > ImgHight) {
          ele.style.top = ImgHight + "px";
        }
      };
      document.onmouseup = function (e) {
        isDown = false;
        document.onmousemove = null;
        document.onmouseup = null;
        document.onclick = null;
        // 防止 锁定状态 拖动
        if (isLock.value) {
          let left = e.clientX - disX;
          let top = e.clientY - disY;
          // 获取图片宽、高
          let ImgWidth = homeImg.value.clientWidth;
          let ImgHight = homeImg.value.clientHeight;
          item.x = +((left / ImgWidth) * 100).toFixed(2);
          item.y = +((top / ImgHight) * 100).toFixed(2);
        }
        if (isLock.value !== false && isMarkingMove.value) {
          proxy
            .$confirm("是否将此分段标识点拖拽该区域", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(async () => {
              let { data } = await sectionResetXY(editmarkingLocation);
              if (data.code === RES_SUCCESS) {
                isMarkingMove.value = false;
                ElMessage({
                  message: "拖拽成功",
                  type: "success"
                });
                getHomeData();
              }
            })
            .catch(() => {
              isMarkingMove.value = false;
              item.x = +markingLocation.x;
              item.y = +markingLocation.y;
              ele.style.left = markingLocation.x + "%";
              ele.style.top = markingLocation.y + "%";
            });
        }
      };
    };

    // 禁止拖拽图片
    let handleMousemoveImg = () => {
      let document: any = window.document;
      window.getSelection
        ? window.getSelection()?.removeAllRanges()
        : document.selection.empty();
    };
    // 点击标识点
    let handleClickMarking = (item: any) => {
      // console.log("item: ", item);
      if (!isMarkingMove.value) {
        STORE.commit("setBuswaryInfo", item);
        // ROUTER.push({ path: '/busway' });
        componentName.value = "node";
      }
    };

    /********************************** 首页实时数据 逻辑 *******************************/
    let socket: any = ref(null); // 首页websocket 实例
    let SOCKET = reactive({
      initSocket: () => {
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        if ("WebSocket" in window) {
          socket.value = STORE.state.data.homeSocket;
        } else {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
          return;
        }
        // 收到消息回调
        socket.value.onmessage = SOCKET.scoketMessage;
      },
      scoketMessage: (result: any) => {
        if (result.data.slice(0, 4) === "dash") {
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );
          // 判断是否报警
          let warningTypeList: Array<string> = [];
          warningList.value = [];
          realTimeData.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                // 循环遍历 分段母线槽 获取全部分段母线槽
                if (key.warningSectionBusWayDtos.length > 0) {
                  key.warningSectionBusWayDtos.forEach((val: any) => {
                    warningTypeList.push(val.typeName);

                    // 遍历 现有分段母线槽
                    markingList.value.forEach((h: any) => {
                      if (val.sectionBusWayId === h.sectionBusWayId) {
                        // 计算平均温度
                        if (val.homePageNodeDtoList.length > 0) {
                          let tempList: any = [];
                          // 循环 节点数据
                          val.homePageNodeDtoList.forEach((k: any) => {
                            // 保存节点实时数据
                            h.homePageNodeDtoList.forEach((j: any) => {
                              if (k.nodeId === j.nodeId) {
                                j.acquisitionTime = k.nodeTemp
                                  ? new Date().toLocaleString()
                                  : j.acquisitionTime
                                    ? j.acquisitionTime
                                    : null;
                                // 多通道 保留之前 温度数据
                                k.nodeTemp = k.nodeTemp ?? j.nodeTemp;
                                j.nodeTemp = k.nodeTemp;
                                tempList.push(k.nodeTemp);
                              }
                            });
                          });
                          if (
                            tempList.length === 0 ||
                            tempList.includes(null) ||
                            tempList.includes(undefined)
                          ) {
                            h.avgTemp = null;
                            h.acquisitionTime = null;
                          } else {
                            let sumTemp = tempList.reduce((a: any, b: any) => {
                              return a + b;
                            }, 0);
                            h.avgTemp = (sumTemp / tempList.length).toFixed(1);
                            h.acquisitionTime = new Date().toLocaleString();
                          }
                        }
                        // 改变标识点颜色
                        if (val.typeName) {
                          h.color = "#ff0000";
                          if (val.homePageNodeDtoList.length > 0) {
                            // 循环 节点数据
                            val.homePageNodeDtoList.forEach((k: any) => {
                              h.homePageNodeDtoList.forEach((v: any) => {
                                if (k.nodeId === v.nodeId) {
                                  if (k.warningType) {
                                    v.color = "#ff0000";
                                    // 没有温度显示 之前的温度数据
                                    v.warningName =
                                      k.nodeTemp ?? v.nodeTemp
                                        ? `${k.nodeName} : ${(
                                          k.nodeTemp ?? v.nodeTemp
                                        ).toFixed(1)}℃`
                                        : k.nodeName;
                                  } else {
                                    v.color = "#008800";
                                    v.warningName = "";
                                  }
                                }
                              });
                            });
                          }
                        } else {
                          h.color = "#008000";
                        }
                      }
                    });

                    // 获取报警数据列表
                    if (val.typeName) {
                      if (warningList.value.length <= 4) {
                        let isSomeSectionBusWayId = warningList.value.some(
                          (q: any) => {
                            return q.sectionBusWayId === val.sectionBusWayId;
                          }
                        );
                        if (!isSomeSectionBusWayId) {
                          warningList.value.push({
                            busWayId: val.busWayId,
                            sectionBusWayId: val.sectionBusWayId,
                            sectionBusWayName: val.sectionBusWayName,
                            filePath:
                              val.filePath ||
                              require("@/assets/image/noFile.png"),
                            nodeList: val.homePageNodeDtoList,
                            createTime: val.createTime
                          });
                        }
                      }

                      // 实时显示报警节点温度
                      val.homePageNodeDtoList.forEach((v: any) => {
                        if (warningList.value.length > 0) {
                          // 遍历报警 列表
                          warningList.value.forEach((k: any) => {
                            if (k.nodeList.length > 0) {
                              // 遍历报警节点
                              k.nodeList.forEach((j: any) => {
                                if (v.nodeId === j.nodeId) {
                                  // 显示图片节点 实时温度
                                  j.realtimeTemp = v.nodeTemp
                                    ? `${v.nodeTemp?.toFixed(1)}℃`
                                    : null;
                                  if (v.warningType) {
                                    j.typeName = v.warningType;
                                    j.color = "#ff0000";
                                    j.warningName = v.nodeTemp
                                      ? `${v.nodeName} : ${v.nodeTemp?.toFixed(
                                        1
                                      )}℃`
                                      : v.nodeName;
                                  } else {
                                    j.typeName = null;
                                    j.color = "#008000";
                                  }
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          // 更改报警状态
          let isWarning = warningTypeList.some((item) => {
            return typeof item === "string";
          });
          setWaringStatus(isWarning);
          setWarningList(warningList.value, new Date().toLocaleString());
          triggerAlarm();
          STORE.commit("setWarkingList", markingList.value);
        }
      }
    });
    onMounted(() => {
      getHomeData();
      SOCKET.initSocket();
    });
    // onActivated(() => {
    //   getHomeData();
    //   SOCKET.initSocket();
    // });
    onUnmounted(() => { });
    return {
      isLock,
      homeImg,
      markingValue,
      markingSize,
      handleReset,
      aaabb,
      mousedownaa,
      mousemoveaa,
      mouseupaa,
      markingList,
      handleNodedrag,
      handleMousemoveImg,
      handleClickMarking,
      warningList,
      IMG_File,
      sessionRead
    };
  }
});
</script>
<style lang="scss" scoped>
@mixin marker {
  position: absolute;
  transform: translate(-50%, -100%);
  transform-origin: center;

  &::after {
    display: inline-block;
    content: attr(data-warning);
    font-size: 12px;
    font-weight: bold;
    position: absolute;
    top: -30px;
    left: 50%;
    min-width: 110px;
    // white-space: break-spaces;
    // white-space: break-spaces !important;
    text-align: center;
    color: #ff0000;
    // background-color: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 4px;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  // &:hover:after {
  //   display: inline-block;
  //   content: attr(data-name);
  //   font-size: 12px;
  //   font-weight: bold;
  //   position: absolute;
  //   top: -40px;
  //   left: 50%;
  //   min-width: 110px;
  //   // white-space: normal;
  //   // white-space: break-spaces;
  //   // white-space: break-spaces !important;
  //   text-align: center;
  //   color: #fff;
  //   background-color: rgba(0, 0, 0, 0.8);
  //   padding: 10px;
  //   border-radius: 4px;
  //   white-space: nowrap;
  //   transform: translateX(-50%);
  // }
}

.home_container {
  height: calc(100vh - 100px);

  .home_body {
    position: relative;

    // min-height: calc(100vh - 160px);
    // margin-top: 20px;
    .wanda_img {
      width: 100%;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
      position: relative;
      left: 0;
      top: 0;
      z-index: 1;
    }

    .markingItem {
      position: absolute;
      z-index: 9999;
      transform: translate(-50%, -100%);
      transform-origin: center;
      cursor: pointer;

      &::after {
        display: inline-block;
        content: attr(data-warning);
        // content: attr(data-name);
        font-size: 12px;
        font-weight: bold;
        position: absolute;
        top: -20px;
        left: 50%;
        min-width: 110px;
        text-align: center;
        // color: #ff0000;
        // padding: 10px;
        border-radius: 4px;
        white-space: nowrap;
        transform: translateX(-50%);
      }

      &:hover:after {
        display: inline-block;
        content: "";
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
      }

      &:hover {
        z-index: 1000;
      }
    }
  }
}

.warmingCard {
  .warning_box {
    position: relative;
    width: 100%;

    .warningSctionImg {
      width: 100%;
      height: 500px;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
      z-index: 10;
    }

    .sectionItem {
      @include marker;
    }
  }
}

.echarts {
  position: relative;

  .dataLoading {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}

.markingInfo {
  margin-bottom: 5px;
}

.warningInfo {
  text-align: right;
}
</style>