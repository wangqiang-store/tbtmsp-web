<template>
  <div
    v-loading="pageLoading"
    element-loading-background="rgba(225, 225, 225, 0)"
    element-loading-text="数据加载中"
    style="min-height:calc(100vh - 100px)"
    class="p-20"
  >
    <el-row>
      <el-col :span="24">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>
            <h4>首页</h4>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
    </el-row>
    <el-row
      class="busway"
      type="flex"
    >
      <el-col
        :span="6"
        :xs="24"
        :sm="12"
        :lg="6"
        v-for="item of buswayList"
        :key="item.id"
        class="busway-item"
        :class="item.warningType ? 'warning' : '' "
      >
        <el-card
          @click="handleClickBusway(item)"
          shadow="hover"
        >
          <div class="d_flex">
            <el-image :src="require('@/assets/image/busway.png')"></el-image>

            <div>
              <h4 class="mb-10">{{item.name}}</h4>
              <div class="d_flex">
                <div>
                  <p class="textInfo text-ellipsis">长度:</p>
                  <p class="textInfo text-ellipsis">报警类型</p>
                </div>
                <div>
                  <p
                    class="text-ellipsis textInfo"
                    style="font-size:14px;margin-bottom:5px;text-align:left"
                  >{{item.length}}m</p>
                  <p class="textInfo">
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

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, reactive, ref } from "vue";
import { RES_SUCCESS } from "@/api/common/common";
import { findList } from "@/api/home/index";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";

export default defineComponent({
  setup(props) {
    // vuex 实例
    let STORE = useStore();
    let triggerAlarm: any = inject("triggerAlarm");
    let setWarningList: any = inject("setWarningList");
    let setWaringStatus: any = inject("setWaringStatus");
    let componentName: any = inject("componentName");
    let setBuswayData: any = inject("setBuswayData");

    let buswayList = ref<Array<any>>([]); //母线槽列表
    let pageLoading = ref(false);
    let markingList: any = ref([]); //标识数据
    let warningList: any = ref([]); //报警数据
    // 获取首页母线槽数据
    let getHomeData = async () => {
      let markings: any = [];
      pageLoading.value = true;
      // 判断是否报警
      let warningTypeList: Array<string> = [];
      warningList.value = [];
      let { data } = await findList();
      if (data.code === RES_SUCCESS) {
        pageLoading.value = false;
        if (data.data.length > 0) {
          // 循环遍历 电房
          data.data.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                buswayList.value.push(key);
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

      // 更改报警状态
      let isWarning = warningTypeList.some((item) => {
        return typeof item === "string";
      });
      setWaringStatus(isWarning);
      setWarningList(warningList.value);
      triggerAlarm();
      STORE.commit("setWarkingList", markingList.value);
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
      if (row.warningType) {
        let tagList: Array<string> = row.warningType.split(",");
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

    // 点击母线槽
    let handleClickBusway = (item: any) => {
      setBuswayData(item);
      componentName.value = "SectionBusway";
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
                buswayList.value.forEach((val) => {
                  if (key.id === val.id) {
                    val.warningType = key.warningType;
                  }
                });
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

    onMounted(async () => {
      await getHomeData();
      SOCKET.initSocket();
    });

    return {
      buswayList,
      pageLoading,
      handleClickBusway,
      formatterTag
    };
  }
});
</script>
<style scoped lang="scss">
.busway {
  margin-top: 30px;
  .busway-item {
    text-align: center;
    margin-bottom: 10px;
    box-sizing: border-box;
    padding: 0 10px;
    cursor: pointer;
    /deep/ .el-image__inner {
      -webkit-user-drag: none;
      -moz-user-drag: none;
    }
    /deep/ .el-card__body {
      padding: 30px;
    }
  }
  .warning {
    /deep/ .el-card__body {
      border: 2px solid #ff0000;
    }
  }
}
.textInfo {
  margin-bottom: 5px;
  font-size: 14px;
  text-align: right;
  margin-right: 10px;
  white-space: nowrap;
  height: 20px;
  line-height: 20px;
  font-weight: bold;
}
/deep/ .el-loading-spinner {
  top: 200px;
}
</style>