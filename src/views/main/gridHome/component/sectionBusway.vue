<template>
  <div
    element-loading-background="rgba(225, 225, 225, 0)"
    element-loading-text="数据加载中"
    style="min-height:calc(100vh - 100px)"
    class="p-20"
  >
    <el-row>
      <el-col :span="24">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            @click="onGoHome"
            class="breadcrumb"
          >首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{buswayData.name}}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
    </el-row>
    <el-row
      class="sectionBusway"
      type="flex"
    >
      <el-col
        :span="6"
        :xs="24"
        :md="12"
        :sm="12"
        :lg="8"
        :xl="6"
        v-for="item of sectionBuswayList"
        :key="item.id"
        class="sectionBusway-item"
        :class="item.typeName ? 'warning' : '' "
      >
        <el-card
          @click="handleClickSectionbusway(item)"
          shadow="hover"
        >
          <div class="d_flex">
            <div class="mr-10">
              <el-image :src="require('@/assets/image/busway.png')"></el-image>
            </div>

            <div>
              <h4 class="mb-10">{{item.sectionBusWayName}}</h4>
              <div class="d_flex ">
                <div>
                  <p class="textInfo text-ellipsis">节点温度预警值:</p>
                  <p class="textInfo text-ellipsis">节点温度差预警值:</p>
                  <p class="textInfo text-ellipsis">节点最新平均温度:</p>
                  <p class="textInfo text-ellipsis">最新采集时间:</p>
                  <p class="textInfo text-ellipsis">报警类型</p>
                </div>
                <div>
                  <p class="text-ellipsis textInfo tal">{{item.temperatureWarning}}℃</p>
                  <p
                    class="text-ellipsis textInfo tal"
                    style="font-size:14px;margin-bottom:5px"
                  >{{item.differenceWarning}}℃</p>
                  <p
                    class="text-ellipsis textInfo tal"
                    style="font-size:14px;margin-bottom:5px"
                  >{{item.avgTemp ? item.avgTemp + '℃' : "暂无数据"}}</p>
                  <p
                    class="text-ellipsis textInfo tal"
                    style="font-size:14px;margin-bottom:5px"
                  >{{item.acquisitionTime || '暂无数据'}}</p>
                  <p
                    class="textInfo"
                    style="text-align:left"
                  >
                    <el-tag
                      v-for="(val,index) of formatterTag(item)"
                      :key="val.text + index"
                      :type="val.tagType"
                      :effect="val.effect || 'light'"
                      style="margin-right:5px;margin-bottom:5px"
                    >
                      {{val.text}}
                    </el-tag>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="sectionBusWayinfo">
            <h3 class="textInfo">{{item.sectionBusWayName}}</h3>
            <div class="info-box">
              <div class="info-left">
                <p class="textInfo">节点温度预警值:</p>
                <p class="textInfo">节点温度差预警值:</p>
                <p class="textInfo">节点最新平均温度:</p>
                <p class="textInfo">最新采集时间:</p>
                <p class="textInfo">报警类型:</p>
              </div>
              <div class="info-right">
                <p style="font-size:16px;margin-bottom:5px">{{item.temperatureWarning}}</p>
                <p style="font-size:16px;margin-bottom:5px">{{item.differenceWarning}}</p>
                <p style="font-size:16px;margin-bottom:5px">{{item.avgTemp ? item.avgTemp + '℃' : "暂无数据"}}</p>
                <p style="font-size:16px;margin-bottom:5px">{{item.acquisitionTime || '暂无数据'}}</p>
                <p style="font-size:15px;margin-bottom:5px">{{item.typeName || '未报警'}}</p>
              </div>
            </div>
          </div> -->
        </el-card>
      </el-col>
      <el-col
        :span="24"
        v-if="sectionBuswayList.length === 0"
      >
        <el-empty
          :image-size="200"
          description="暂无母线槽分段,请在母线槽分段管理添加"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { ElMessage } from "element-plus";
import { defineComponent, inject, onMounted, reactive, ref,getCurrentInstance } from "vue";
import { useStore } from "vuex";
// import dayjs from "dayjs";
import { filterTime } from '@/utils/filtration';
export default defineComponent({
  props: {
    buswayData: {
      type: Object,
      default: {}
    }
  },
  setup(props) {
    const { proxy }: any = getCurrentInstance();
    let dayjs: any = proxy.dayjs
    // console.log("props: ", props);
    let STORE = useStore();
    let triggerAlarm: any = inject("triggerAlarm");
    let setWarningList: any = inject("setWarningList");
    let setWaringStatus: any = inject("setWaringStatus");
    let componentName: any = inject("componentName");

    let warningList: any = ref([]); //报警数据
    let markingList: any = ref([]);
    // 分段母线槽数据
    let sectionBuswayList = ref([]);
    let initData = () => {
      sectionBuswayList.value = props.buswayData.warningSectionBusWayDtos;
      markingList.value = STORE.state.data.warkingList;
      STORE.state.data.warkingList.forEach((v: any) => {
        // 保留 标识点温度数据
        sectionBuswayList.value.forEach((m: any) => {
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
      });
    };

    let formatterTag = (row: any) => {
      interface tagProp {
        text: string;
        tagType: string;
        effect: string;
      }
      let list: Array<tagProp> = [];
      let tag = {
        text: "",
        tagType: "",
        effect: "light"
      };
      if (row.typeName) {
        let tagList: Array<string> = row.typeName.split(",");
        tagList.forEach((item) => {
          tag = {
            text: item,
            tagType: "",
            effect: "light"
          };
          switch (item) {
            case "升温过快":
              tag.tagType = "warning";
              break;
            case "定温报警":
              tag.tagType = "danger";
              tag.effect = "dark";
              break;
            case "差温报警":
              tag.tagType = "danger";
              break;
            default:
              break;
          }
          list.push(tag);
        });
      } else {
        tag.tagType = "success";
        tag.text = "未报警";
        list.push(tag);
      }
      return list;
    };
    let onGoHome = () => {
      componentName.value = "Busway";
    };
    let handleClickSectionbusway = (item: any) => {
      STORE.commit("setBuswaryInfo", item);
      componentName.value = "node";
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
          // 首页数据
          let warningTypeList: Array<string> = [];
          warningList.value = [];
          realTimeData.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                // 循环遍历 分段母线槽 获取全部分段母线槽
                if (key.warningSectionBusWayDtos.length > 0) {
                  key.warningSectionBusWayDtos.forEach((val: any) => {
                    // 同步报警状态
                    sectionBuswayList.value.forEach((h: any) => {
                      if (val.sectionBusWayId === h.sectionBusWayId) {
                        h.typeName = val.typeName;
                        // 计算平均温度
                        if (val.homePageNodeDtoList.length > 0) {
                          let tempList: any = [];
                          // 循环 节点数据
                          val.homePageNodeDtoList.forEach((k: any) => {
                            // 保存节点实时数据
                            h.homePageNodeDtoList.forEach((j: any) => {
                              if (k.nodeId === j.nodeId) {
                                // 多通道 保留之前 温度数据
                                k.nodeTemp = k.nodeTemp ?? j.nodeTemp;
                                j.nodeTemp = k.nodeTemp;
                                j.acquisitionTime = k.nodeTemp
                                  ? new Date().toLocaleString()
                                  : null;
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
                      }
                    });

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

                    warningTypeList.push(val.typeName);
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
      initData();
      SOCKET.initSocket();
    });
    return {
      onGoHome,
      handleClickSectionbusway,
      sectionBuswayList,
      formatterTag,
      dayjs
    };
  }
});
</script>
<style scoped lang="scss">
.breadcrumb {
  cursor: pointer;
  font-weight: bold;
}
.sectionBusway {
  margin-top: 30px;
  .sectionBusway-item {
    text-align: center;
    margin-bottom: 10px;
    box-sizing: border-box;
    padding: 0 10px;
    cursor: pointer;
    /deep/ .el-image__inner {
      -webkit-user-drag: none;
      -moz-user-drag: none;
    }
    // /deep/ .el-card__body {
    //   padding: 30px;
    // }
  }
  .warning {
    /deep/ .el-card__body {
      border: 2px solid #ff0000;
    }
  }
}

.el-card {
  position: relative;
}

.el-card:hover .sectionBusWayinfo {
  top: 0;
}

.sectionBusWayinfo {
  width: 100%;
  /* height: 231px; */
  position: absolute;
  top: 231px;
  right: 0;
  left: 0;
  bottom: 0;
  color: white;
  font-weight: bold;
  gap: 20px;
  backdrop-filter: blur(10px);
  background-color: rgba(66, 53, 66, 0.404);
  box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px;
  border: 0px rgba(255, 255, 255, 0.4) solid;
  border-bottom: 0px rgba(40, 40, 40, 0.35) solid;
  border-right: 0px rgba(40, 40, 40, 0.35) solid;
  transition: all 1s;
  h3 {
    margin-top: 20px;
  }
  .info-box {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    .info-left {
      text-align: right;
      margin-right: 10px;
    }
    .info-right {
      text-align: left;
    }
  }
  .textInfo {
    margin-bottom: 5px;
    font-size: 14px;
  }
}
.textInfo {
  margin-bottom: 5px;
  font-size: 14px;
  text-align: right;
  margin-right: 10px;
  // 文本设置
  white-space: nowrap;
  height: 20px;
  line-height: 20px;
  font-weight: bold;
}
.tal {
  text-align: left;
}
/deep/ .el-loading-spinner {
  top: 200px;
}
</style>