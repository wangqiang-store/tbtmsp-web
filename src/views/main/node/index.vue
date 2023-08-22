<template>
  <div v-loading="pageLoading" element-loading-background="rgba(225, 225, 225, 0)" element-loading-text="数据加载中"
    style="min-height:calc(100vh - 80px);padding:20px">
    <el-row>
      <el-col :span="24">
        <el-breadcrumb separator="/" style="margin-bottom:10px">
          <el-breadcrumb-item>
            <span class="nav-back" @click="goMain">首页</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <span class="nav-back" @click="handleBack">{{ buswaryInfo.busWayName }}</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ buswaryInfo.sectionBusWayName }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h3>{{ buswaryInfo.sectionBusWayName }}</h3>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" v-if="!buswaryInfo.filePath">
        <el-row class="node" type="flex">
          <el-col :span="6" :xs="24" :md="12" :sm="12" :lg="8" :xl="6" class="node-item" v-for="item of nodeList"
            :key="item.nodeId" :class="item.warningType ? 'warning' : ''">
            <el-card @click="handleClickNode(item)" shadow="hover">
              <div class="d_flex d_flex_sa">
                <el-image style="width:120px" :src="require('@/assets/image/node.png')"></el-image>
                <div style="flex:1">
                  <h4 class="mb-20">{{ item.nodeName }}</h4>
                  <div style="display:flex">
                    <div style="flex:1 ">
                      <p class="mb-10 text-setting">
                        <b>母线槽分段：</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>光纤距离：</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>最新温度：</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>最新采集时间：</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>报警状态</b>
                      </p>
                    </div>
                    <div style="flex:2">
                      <p class="mb-10 text-setting">
                        <b>{{ buswaryInfo.sectionBusWayName }}</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>{{ item.fiberDistance }}m</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>{{ item.temp ? item.temp : '暂无数据' }}</b>
                      </p>
                      <p class="mb-10 text-setting">
                        <b>{{ item.acquisitionTime || '暂无数据'
}}</b>
                      </p>
                      <p></p>
                    </div>
                  </div>
                  <p>
                    <el-tag v-for="(val, index) of formatterTag(item)" :key="val.text + index" :type="val.tagType"
                      :effect="val.effect || 'light'" style="margin-right:5px;margin-bottom:5px">
                      {{ val.text }}
                    </el-tag>
                  </p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-empty v-if="!pageLoading" :image="require('@/assets/image/warning.png')"
              description="在母线槽分段管理里面上传对应的图片,更好查看节点位置"></el-empty>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24" v-else>
        <el-row>
          <el-col :span="12" class="d_flex mb-10">
            <el-switch v-model="isLock" active-text="解锁节点" inactive-text="锁定节点"></el-switch>
            <el-input v-model="nodeAspect.size" style="width:150px" class="mr-10 ml-10">
              <template #append>px</template>
            </el-input>
            <el-button type="primary" @click="handleReset">重置节点大小</el-button>
          </el-col>
          <el-col :span="24" class="buswayMap">
            <img :src="IMG_File + buswaryInfo.filePath" alt="母线槽" class="w-100 buswayImg" draggable="false"
              @mousemove="handleMousemoveImg" ref="buswayImg">
            <el-tooltip placement="top" v-for="item of nodeList" :key="item.nodeId" :visible-arrow="false">
              <template #content>
                <div>
                  <p class="nodeInfo">{{ item.nodeRealtimeTemp ? item.nodeRealtimeTemp : `${item.nodeName} - 最新温度:暂无数据`
}}
                  </p>
                  <p>最新采集时间:{{ item.acquisitionTime || '暂无数据'
}}</p>
                </div>
              </template>
              <!-- class="nodeItem iconfont icon-dangqianweizhi" -->
              <!-- <span
                class="nodeItem iconfont icon-dangqianweizhi"
                :style="{fontSize:nodeSize+'px', left:item.x+'%',top:item.y+'%',color:item.color }"
                :class="item.ishover ? 'z-1000' : ''"
                @mousedown="handleNodedrag($event,item)"
                @mouseenter="handleMouseenterNode(item)"
                :data-warning="item.warningName"
                @click="handleClickNode(item)"
              > -->

              <img class="nodeItem" :src="item.color === '#008000' ? greenIconurl : redIconurl" alt=""
                :style="{ fontSize: nodeSize + 'px', left: item.x + '%', top: item.y + '%', width: nodeSize + 'px' }"
                :class="item.ishover ? 'z-1000' : ''" @mousedown="handleNodedrag($event, item)"
                @mouseenter="handleMouseenterNode(item)" onmouseup :data-warning="item.warningName"
                @click="handleClickNode(item)">
              <!-- <img class="nodeItem" v-show="item.color !== '#008000'" src="@/assets/image/home/red.png" alt=""
                :style="{ fontSize: nodeSize + 'px', left: item.x + '%', top: item.y + '%', width: nodeSize + 'px' }"
                :class="item.ishover ? 'z-1000' : ''" @mousedown="handleNodedrag($event, item)"
                @mouseenter="handleMouseenterNode(item)" :data-warning="item.warningName"
                @click="handleClickNode(item)"> -->
              <!-- :data-name="item.nodeRealtimeTemp ? item.nodeRealtimeTemp : item.nodeName" -->
              <!-- </span> -->
            </el-tooltip>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <!-- 节点温度模态框 -->
    <el-dialog title="节点详情" v-model="dialogVisible" width="90%" top="3vh">
      <el-row style="width:100%;height:800px;overflow:auto">
        <el-col class="echarts">
          <!-- 节点名称 -->
          <h3>{{ buswaryInfo.sectionBusWayName }} - {{ nodeName }}</h3>
          <p class="mt-10 mb-10">最新24h温度变化曲线</p>
          <initEcharts id="nodeEcharts" :options="options" :styles="styles" ref="echarts" @dataZoom="handleDataZoom" />
          <DataLoading class="dataLoading" v-show="loading" />
        </el-col>
        <el-col :span="24" class="mt-10">
          <h4 class="mb-10">最近报警记录</h4>
          <ele-table :tableData="tableData" :renderTable="renderTable" :isborder="true"></ele-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {
  IMG_File,
  IMG_URL,
  localRead,
  localWrite,
  RES_SUCCESS,
  sessionRead
} from "@/api/common/common";
import { resetXY } from "@/api/maintenance/node";
import { searchHistoryData } from "@/api/temp/historytemp";
import { filterTime } from "@/utils/filtration";
import { ElMessage } from "element-plus";
import initEcharts from "@/components/initEcharts/index.vue";
import EleTable from "@/components/eleTable/index.vue";
import DataLoading from "@/components/dataLoading/index.vue";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  nextTick,
  inject,
  watch
} from "vue";
// import dayjs from "dayjs";
import { useStore } from "vuex";
import { findList } from "@/api/home";

export default defineComponent({
  components: { initEcharts, EleTable, DataLoading },
  setup() {
    const { proxy }: any = getCurrentInstance();
    let dayjs: any = proxy.dayjs
    const STORE = useStore();
    let buswayImg: any = ref(null);
    let echartsTempData: any = [];
    let echartsMaxTempData: any = [];
    let echartsMinTempData: any = [];
    let echartsAvgTempData: any = [];
    const greenIconurl = require('@/assets/image/home/green.png')
    const redIconurl = require('@/assets/image/home/red.png')
    // echarts实例
    let echarts: any = ref(null);
    let triggerAlarm: any = inject("triggerAlarm");
    let setWarningList: any = inject("setWarningList");
    let setWaringStatus: any = inject("setWaringStatus");
    let setOnmessageNettyMessage: any = inject("setOnmessageNettyMessage");
    let componentName: any = inject("componentName");

    let isDown = ref(false)
    let warningList: any = ref([]);
    let DATA: any = reactive({
      time: "",
      pageLoading: false,
      nodeList: [],
      buswaryInfo: {},
      // 锁定节点
      isLock: false,
      // 是否拖动节点
      isNodeMove: false,
      // 节点外观
      nodeAspect: {
        // size: STORE.state.data.nodeSize,
        size: localRead("nodeSize") || 35
      },
      nodeSize: localRead("nodeSize") || 35,
      // 节点位置
      nodeLocation: {
        x: 10,
        y: 10
      },
      editNodeLocation: {
        id: "",
        x: 10,
        y: 10
      },
      // 获取最近24h节点温度数据参数
      nodeTempParmas: {
        nodeId: "",
        startTime: "",
        endTime: ""
      },
      // 节点模态框
      dialogVisible: false,
      // echarts配置
      loading: false,
      options: {
        animation: false,
        title: {
          text: "",
          left: "center"
        },
        xAxis: {
          type: "time",
          name: "采集时间",
          minorTick: {
            show: true
          },
          minorSplitLine: {
            show: true
          }
        },
        yAxis: {
          min: 0,
          max: 100,
          minInterval: 0.5,
          name: "节点温度(℃)",
          minorTick: {
            show: true
          },
          minorSplitLine: {
            show: true
          },
          axisLine: {
            //y轴
            show: true
          },
          axisTick: {
            //y轴刻度线
            show: true
          },
          show: true,
          scale: true,
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(2);
            }
          }
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          },
          right: "5%"
        },
        color: ["#bf444c", "#ff3300", "#0099cc", "33cc66"],
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["历史温度", "最大温度", "最小温度", "平均温度"],
          top: "4.5%",
          icon: "roundRect",
          itemHeight: 3 // 粗细
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "9%",
          containLabel: true,
          height: "83%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          formatter: function (params: any) {
            let list = [];
            let listItem = "";
            let colors = ["#bf444c", "#ff3300", "#0099cc", "#33cc66"];
            let seriesNames = ["历史温度", "最大温度", "最小温度", "平均温度"];
            let value: number;
            let paramsArr = []
            if (params.length > 1) {
              for (var i = 0; i < params.length; i++) {
                params[i].value[1] % 1 === 0
                  ? (value = params[i].value[1])
                  : (value = params[i].value[1].toFixed(1));
                let bool = paramsArr.some((item: any) => item === params[i].seriesName)
                if (!bool) {
                  paramsArr.push(params[i].seriesName)
                  list.push(
                    '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                    params[i].color +
                    ';margin-right: 5px;border-radius: 50%;}"></i><span style="width:70px; display:inline-block;">' +
                    params[i].seriesName +
                    "：</span>&nbsp&nbsp" +
                    value +
                    "℃"
                  );
                }
              }
            } else if (params.length === 1) {
              for (var i = 0; i < params[0].value.length; i++) {
                if (i !== 0) {
                  params[0].value[i] % 1 === 0
                    ? (value = params[0].value[i])
                    : (value = params[0].value[i].toFixed(1));
                  list.push(
                    '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                    colors[i - 1] +
                    ';margin-right: 5px;border-radius: 50%;}"></i><span style="width:70px; display:inline-block;">' +
                    seriesNames[i - 1] +
                    "：</span>&nbsp&nbsp" +
                    value +
                    "℃"
                  );
                }
              }
            }
            listItem = list.join("<br>");

            return (
              '<div class="showBox" style="text-align:left">' +
              listItem +
              "<br/>" +
              '<i style="display: inline-block;width: 10px;height: 10px;background: lightblue' +
              ';margin-right: 5px;border-radius: 50%;}"></i>' +
              "采集时间：&nbsp&nbsp" +
              params[0].value[0] +
              "</div>"
            );
          }
        },
        dataZoom: [
          //X轴滑动条
          {
            type: "slider", //滑动条
            show: true, //开启
            xAxisIndex: [0],
            filterMode: "none",
            left: "4.5%", //滑动条位置
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          }, //X轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            xAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          },
          //Y轴滑动条
          {
            type: "slider", //滑动条
            show: true, //开启
            yAxisIndex: [0],
            filterMode: "none",
            left: "0%", //滑动条位置
            top: "8.3%",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          },
          //y轴内置滑动
          {
            type: "inside", //内置滑动，随鼠标滚轮展示
            yAxisIndex: [0],
            filterMode: "none",
            start: 0, //初始化时，滑动条宽度开始标度
            end: 100 //初始化时，滑动条宽度结束标度
          }
        ],
        series: [
          {
            name: "历史温度",
            data: echartsTempData.value,
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#bf444c",
              borderColor: "#bf444c" //拐点边框颜色
            },
            lineStyle: {
              color: "#bf444c" //改变折线颜色
            }
          },
          {
            name: "最大温度",
            data: echartsMaxTempData.value,
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'average', //降采样策略
            itemStyle: {
              color: "#ff3300",
              borderColor: "#ff3300" //拐点边框颜色
            },
            lineStyle: {
              color: "#ff3300" //改变折线颜色
            }
          },
          {
            name: "最小温度",
            data: echartsMinTempData.value,
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#0099cc",
              borderColor: "#0099cc" //拐点边框颜色
            },
            lineStyle: {
              color: "#0099cc" //改变折线颜色
            }
          },
          {
            name: "平均温度",
            data: echartsAvgTempData.value,
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#33cc66",
              borderColor: "#33cc66" //拐点边框颜色
            },
            lineStyle: {
              color: "#33cc66" //改变折线颜色
            }
          }
        ]
      },
      styles: {
        width: "100%",
        marginTop: "10px"
      },
      starty: "",
      startx: "",
      endy: "",
      endx: "",
      // 报警表格
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          }
        },
        {
          label: "报警温度(℃)",
          type: "text",
          prop: "temp"
        },
        {
          label: "报警类型",
          type: "tag",
          prop: "warningTypeName",
          moreTag: true,
          formatter: (row: any) => {
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
            if (row.warningTypeName) {
              let tagList: Array<string> = row.warningTypeName.split(",");
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
          }
        },
        {
          label: "时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return filterTime(row.createTime, "/");
          }
        }
      ],
      socket: null,
      websocketNetty: null,
      isZoom: false,
      timer: null,
      nodetimer: null,
      nodeName: ""
    });
    let METHODS: any = reactive({
      // 获取节点数据
      handleGetNodeData: async () => {
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

                      if (
                        val.busWayId === DATA.buswaryInfo.busWayId &&
                        val.sectionBusWayId === DATA.buswaryInfo.sectionBusWayId
                      ) {
                        // 遍历 节点
                        val.homePageNodeDtoList.forEach((v: any) => {
                          DATA.buswaryInfo.homePageNodeDtoList.forEach(
                            (h: any) => {
                              if (v.nodeId === h.nodeId) {
                                v.nodeTemp = h.nodeTemp;
                                // 改变节点颜色
                                if (v.warningType) {
                                  v.warningName = h.nodeTemp
                                    ? `${h.nodeName} : ${h.nodeTemp?.toFixed(
                                      1
                                    )}℃`
                                    : h.nodeName;
                                  v.color = "#ff0000";
                                } else {
                                  v.color = "#008000";
                                }
                                // 保存 节点温度
                                v.nodeRealtimeTemp = h.nodeTemp
                                  ? `${h.nodeName
                                  } - 最新温度:${h.nodeTemp.toFixed(1)}℃`
                                  : null;

                                // 显示列表节点 实时温度
                                v.temp = h.nodeTemp
                                  ? h.nodeTemp?.toFixed(1) + "℃"
                                  : null;

                                // 保存 最新采集时间
                                v.acquisitionTime = h.acquisitionTime;
                                // h.x = v.x;
                                // h.y = v.y;
                              }
                            }
                          );
                        });
                        DATA.nodeList = JSON.parse(
                          JSON.stringify(val.homePageNodeDtoList)
                        )
                      }

                      // 获取报警列表
                      if (val.typeName) {
                        if (val.homePageNodeDtoList.length > 0) {
                          // 循环 节点数据
                          val.homePageNodeDtoList.forEach((k: any) => {
                            if (k.warningType) {
                              k.color = "#ff0000";
                              k.warningName = k.nodeTemp
                                ? `${k.nodeName} : ${k.nodeTemp?.toFixed(1)}℃`
                                : k.nodeName;
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
                              require("../../../assets/image/noFile.png"),
                            nodeList: val.homePageNodeDtoList,
                            createTime: val.createTime
                          });
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        }

        // 更改报警状态
        let isWarning = warningTypeList.some((item) => {
          return typeof item === "string";
        });
        setWaringStatus(isWarning);
        setWarningList(warningList.value);
        // triggerAlarm();
      },
      handleMousemoveImg: () => {
        let document: any = window.document;
        window.getSelection
          ? window.getSelection()?.removeAllRanges()
          : document.selection.empty();
      },
      // 节点拖拽
      handleNodedrag: (e: any, item: any) => {
        let document: any = window.document;
        let ele = e.target;
        let disX = e.clientX - e.target.offsetLeft;
        let disY = e.clientY - e.target.offsetTop;
        DATA.nodeLocation.x = item.x;
        DATA.nodeLocation.y = item.y;
        isDown.value = true;
        document.onmousemove = (e: any) => {
          if (isDown.value === false || DATA.isLock === false) {
            return;
          }

          DATA.isNodeMove = true;
          // 获取节点位置
          let left = e.clientX - disX;
          let top = e.clientY - disY;
          ele.style.left = left + "px";
          ele.style.top = top + "px";
          // 获取图片宽、高
          let ImgWidth = buswayImg.value.clientWidth;
          let ImgHight = buswayImg.value.clientHeight;
          DATA.editNodeLocation.x = +((left / ImgWidth) * 100).toFixed(2);
          DATA.editNodeLocation.y = +((top / ImgHight) * 100).toFixed(2);
          DATA.editNodeLocation.id = item.nodeId;
          if (left < 0) {
            ele.style.left = 0;
            DATA.editNodeLocation.x = 0;
          }
          if (left > ImgWidth) {
            ele.style.left = ImgWidth + "px";
            DATA.editNodeLocation.x = 100;
          }
          if (top < 0) {
            ele.style.top = 0;
            DATA.editNodeLocation.y = 0;
          }
          if (top > ImgHight) {
            ele.style.top = ImgHight + "px";
            DATA.editNodeLocation.y = 100;
          }


          if (!DATA.time) {
            DATA.time = new Date().getTime()
          } else {
            let nowTime = new Date().getTime()
            if (nowTime - DATA.time > 200) {
              DATA.time = ""
              mouseupFn(e)
            }
          }
        };
        document.onmouseup = mouseupFn
        async function mouseupFn(e: any) {
          isDown.value = false;
          document.onmousemove = null;
          document.onmouseup = null;
          document.onclick = null;
          if (DATA.isLock) {
            let left = e.clientX - disX;
            let top = e.clientY - disY;
            // 获取图片宽、高
            let ImgWidth = buswayImg.value.clientWidth;
            let ImgHight = buswayImg.value.clientHeight;
            // item.x = +((left / ImgWidth) * 100).toFixed(2);
            item.x = DATA.editNodeLocation.x;
            // item.y = +((top / ImgHight) * 100).toFixed(2);
            item.y = DATA.editNodeLocation.y;
          }
          if (DATA.isLock !== false && DATA.isNodeMove) {
            // proxy
            //   .$confirm("是否将节点拖拽此位置", "提示", {
            //     confirmButtonText: "确定",
            //     cancelButtonText: "取消",
            //     type: "warning"
            //   })
            //   .then(async () => {
            let { data } = await resetXY(DATA.editNodeLocation);
            if (data.code === RES_SUCCESS) {
              DATA.isNodeMove = false;
              ElMessage({
                message: "节点拖拽成功",
                type: "success"
              });
              METHODS.handleGetNodeData();
            }
            // })
            // .catch(() => {
            //   DATA.isNodeMove = false;
            //   item.x = +DATA.nodeLocation.x;
            //   item.y = +DATA.nodeLocation.y;
            //   ele.style.left = DATA.nodeLocation.x + "%";
            //   ele.style.top = DATA.nodeLocation.y + "%";
            // });
          }
        }

      },
      handleMouseenterNode: (item: any) => {
        DATA.nodeList.forEach((val: any) => {
          if (val.nodeId == item.nodeId) {
            val.ishover = true;
          } else {
            val.ishover = false;
          }
        });
      },
      // 点击节点
      handleClickNode: async (item: any) => {
        if (!DATA.isNodeMove) {
          DATA.nodeTempParmas.nodeId = item.nodeId;
          DATA.dialogVisible = true;
          DATA.startx = 0;
          DATA.endx = 100;
          DATA.starty = 0;
          DATA.endy = 100;
          DATA.options.dataZoom[0].start = DATA.startx;
          DATA.options.dataZoom[0].end = DATA.endx;
          DATA.options.dataZoom[1].start = DATA.startx;
          DATA.options.dataZoom[1].end = DATA.endx;
          DATA.options.dataZoom[2].start = DATA.starty;
          DATA.options.dataZoom[2].end = DATA.endy;
          DATA.options.dataZoom[3].start = DATA.starty;
          DATA.options.dataZoom[3].end = DATA.endy;
          DATA.nodeName = item.nodeName;
          // DATA.options.title.text = `${item.busWayName}-${item.name}最新24h温度变化曲线`;
          nextTick(() => {
            METHODS.handleGetEchartsData();
          });
          // DATA.loading = false;
        }
      },
      // 获取图表数据
      handleGetEchartsData: async () => {
        echartsTempData.value = [];
        echartsMaxTempData.value = [];
        echartsMinTempData.value = [];
        echartsAvgTempData.value = [];
        DATA.nodeTempParmas.startTime = filterTime(
          new Date().getTime() - 24 * 60 * 60 * 1000,
          "/"
        );
        // echarts.value.chartfinished();
        DATA.loading = true;
        DATA.nodeTempParmas.endTime = filterTime(new Date(), "/");
        let { data } = await searchHistoryData(DATA.nodeTempParmas);
        if (data.code === RES_SUCCESS) {
          try {
            if (data.data != null) {
              // 生成表格数据
              DATA.tableData = data.data.nodeWarnings;
              if (
                data.data.nodeDates != null &&
                data.data.nodeDates.length !== 0
              ) {
                // data.data.nodeDates = [{...data.data.nodeDates[0]},{collectionTemp:25.1,collectionDate: "2022/12/28 10:40:43"},{collectionTemp:26.1,collectionDate: "2022/12/28 10:30:43"}]
                let { maxTemp, minTemp, avgTemp } = data.data.nodeDto;
                // let maxTemp= 26.5
                // let minTemp= 24.5
                // let avgTemp= 25.5
                data.data.nodeDates.forEach((item: any) => {
                  echartsTempData.value.push([
                    filterTime(item.collectionDate, "/"),
                    item.collectionTemp,
                    maxTemp,
                    minTemp,
                    avgTemp
                  ]);
                });
                echartsMaxTempData.value.push([
                  filterTime(data.data.nodeDates[0].collectionDate, "/"),
                  maxTemp
                ]);
                echartsMaxTempData.value.push([
                  filterTime(
                    data.data.nodeDates[data.data.nodeDates.length - 1]
                      .collectionDate,
                    "/"
                  ),
                  maxTemp
                ]);
                echartsMinTempData.value.push([
                  filterTime(data.data.nodeDates[0].collectionDate, "/"),
                  minTemp
                ]);
                echartsMinTempData.value.push([
                  filterTime(
                    data.data.nodeDates[data.data.nodeDates.length - 1]
                      .collectionDate,
                    "/"
                  ),
                  minTemp
                ]);
                echartsAvgTempData.value.push([
                  filterTime(data.data.nodeDates[0].collectionDate, "/"),
                  avgTemp
                ]);
                echartsAvgTempData.value.push([
                  filterTime(
                    data.data.nodeDates[data.data.nodeDates.length - 1]
                      .collectionDate,
                    "/"
                  ),
                  avgTemp
                ]);
                if (minTemp !== maxTemp) {
                  DATA.options.yAxis.min = +(
                    (minTemp + maxTemp - (maxTemp - minTemp) * 2) /
                    2
                  ).toFixed(1);
                  DATA.options.yAxis.max = +(
                    (minTemp + maxTemp + (maxTemp - minTemp) * 2) /
                    2
                  ).toFixed(1);
                } else {
                  DATA.options.yAxis.min = +((minTemp + maxTemp) / 4).toFixed(
                    1
                  );
                  DATA.options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
                }
                DATA.options.series[0].data = echartsTempData.value;
                DATA.options.series[1].data = echartsMaxTempData.value;
                DATA.options.series[2].data = echartsMinTempData.value;
                DATA.options.series[3].data = echartsAvgTempData.value;
                // echarts.value.charthideloading();
                DATA.loading = false;
              } else {
                // echarts.value.charthideloading();
                DATA.loading = false;
                ElMessage({
                  message: "该节点在24h内没有温度数据",
                  type: "warning"
                });
              }
            } else {
              // echarts.value.charthideloading();
              DATA.loading = false;
              ElMessage({
                message: "该节点在24h内没有温度数据",
                type: "warning"
              });
            }
          } catch (error) {
            DATA.loading = false;
          }
        } else {
          DATA.loading = false;
        }
      },
      // 图表缩放
      handleDataZoom: (event: any) => {
        DATA.isZoom = true;
        if (event.batch != undefined) {
          if (event.batch.length === 1) {
            if (event.batch[0].dataZoomId.indexOf("1") === -1) {
              DATA.starty = event.batch[0].start;
              DATA.endy = event.batch[0].end;
            } else {
              DATA.startx = event.batch[0].start;
              DATA.endx = event.batch[0].end;
            }
          } else {
            DATA.startx = event.batch[0].start;
            DATA.endx = event.batch[0].end;
            DATA.starty = event.batch[1].start;
            DATA.endy = event.batch[1].end;
          }
        } else {
          if (event.dataZoomId.indexOf("2") === -1) {
            DATA.startx = event.start;
            DATA.endx = event.end;
          } else {
            DATA.starty = event.start;
            DATA.endy = event.end;
          }
        }
      },
      // 重置节点大小
      handleReset: () => {
        // STORE.commit('setNodeSize', Number(DATA.nodeAspect.size));
        let size = DATA.nodeAspect.size || 35;
        DATA.nodeSize = size;
        localWrite("nodeSize", DATA.nodeAspect.size);
      },
      formatterTag: (row: any) => {
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
      },
      goMain: () => {
        componentName.value = "section-busWay";
      },
      handleBack: () => {
        componentName.value = "section-busWay";
      },
      updateEchartsData: (realTimeData: any) => {
        realTimeData.forEach((item: any) => {
          if (DATA.nodeTempParmas.nodeId === item.nodeId) {
            // 历史温度 数据 排序 0 当前时间 length-1 最早时间
            DATA.options.series[0].data.sort((a: string, b: string) => {
              return new Date(b[0]).getTime() - new Date(a[0]).getTime();
            });
            // 判断当前时间 与 最早的时间数据是否 大于24小时
            if (
              new Date(DATA.options.series[0].data[0][0]).getTime() -
              new Date(
                DATA.options.series[0].data[
                DATA.options.series[0].data.length - 1
                ][0]
              ).getTime() >
              24 * 3600 * 1000
            ) {
              // 是 ？ 这在头部添加当前点数据  根据后端 排序
              DATA.options.series[0].data.unshift([
                filterTime(new Date()),
                item.temp,
                DATA.options.series[1].data[1][1],
                DATA.options.series[2].data[1][1],
                DATA.options.series[3].data[1][1]
              ]);
              // 同时清除 尾部数据
              DATA.options.series[0].data.pop();
              // 同步 最大温度 使折线图 对应历史数据曲线
              DATA.options.series[1].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              DATA.options.series[1].data[1][0] = filterTime(
                DATA.options.series[0].data[
                DATA.options.series[0].data.length - 1
                ][0]
              );
              // 同步 最小温度 使折线图 对应历史数据曲线
              DATA.options.series[2].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              DATA.options.series[2].data[1][0] = filterTime(
                DATA.options.series[0].data[
                DATA.options.series[0].data.length - 1
                ][0]
              );
              // 同步 平均温度 使折线图 对应历史数据曲线
              DATA.options.series[3].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              DATA.options.series[3].data[1][0] = filterTime(
                DATA.options.series[0].data[
                DATA.options.series[0].data.length - 1
                ][0]
              );
              if (item.temp > DATA.options.series[1].data[0][1]) {
                //更新最大温度
                DATA.options.series[1].data[0][1] = item.temp;
                DATA.options.series[1].data[1][1] = item.temp;
              }
              if (item.temp < DATA.options.series[2].data[0][1]) {
                //更新最小温度
                DATA.options.series[2].data[0][1] = item.temp;
                DATA.options.series[2].data[1][1] = item.temp;
              }
              // 重新计算平均值
              let sumTemp = DATA.options.series[0].data.reduce(
                (prev: any, cur: any) => {
                  return (prev += cur[1]);
                },
                0
              );
              let avgTemp = sumTemp / DATA.options.series[0].data.length;
              // 更新平均温度
              DATA.options.series[3].data[0][1] = avgTemp;
              DATA.options.series[3].data[1][1] = avgTemp;
            } else {
              DATA.options.series[0].data.unshift([
                filterTime(new Date()),
                item.temp,
                DATA.options.series[1].data[1][1],
                DATA.options.series[2].data[1][1],
                DATA.options.series[3].data[1][1]
              ]);
              DATA.options.series[1].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              DATA.options.series[2].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              DATA.options.series[3].data[0][0] = filterTime(
                DATA.options.series[0].data[0][0]
              );
              if (item.temp > DATA.options.series[1].data[0][1]) {
                //更新最大温度
                DATA.options.series[1].data[0][1] = item.temp;
                DATA.options.series[1].data[1][1] = item.temp;
              }
              if (item.temp < DATA.options.series[2].data[0][1]) {
                //更新最小温度
                DATA.options.series[2].data[0][1] = item.temp;
                DATA.options.series[2].data[1][1] = item.temp;
              }
              // 重新计算平均值
              let sumTemp = DATA.options.series[0].data.reduce(
                (prev: any, cur: any) => {
                  return (prev += cur[1]);
                },
                0
              );
              let avgTemp = sumTemp / DATA.options.series[0].data.length;
              // 更新平均温度
              DATA.options.series[3].data[0][1] = avgTemp;
              DATA.options.series[3].data[1][1] = avgTemp;
            }
            let minTemp = +DATA.options.series[2].data[0][1].toFixed(1);
            let maxTemp = +DATA.options.series[1].data[0][1].toFixed(1);
            if (minTemp !== maxTemp) {
              DATA.options.yAxis.min = +(
                (minTemp + maxTemp - (maxTemp - minTemp) * 2) /
                2
              ).toFixed(1);
              DATA.options.yAxis.max = +(
                (minTemp + maxTemp + (maxTemp - minTemp) * 2) /
                2
              ).toFixed(1);
            } else {
              DATA.options.yAxis.min = +((minTemp + maxTemp) / 4).toFixed(1);
              DATA.options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
            }
            // echarts.value.charthideloading();
            setTimeout(() => {
              DATA.loading = false;
            }, 500);
          }
        });
        console.log("DATA.options", DATA.options);
      }

    });
    // websocket
    let SOCKET = reactive({
      // 首页 socket
      initHomeSocket: () => {
        if ("WebSocket" in window) {
          DATA.socket = STORE.state.data.homeSocket;
        } else {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
          return;
        }
        DATA.socket.onmessage = SOCKET.scoketMessage;
      },
      // 首页数据
      scoketMessage: (result: any) => {
        if (result.data.slice(0, 4) === "dash") {
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );
          let warningTypeList: Array<string> = [];
          let markings: any = JSON.parse(
            JSON.stringify(STORE.state.data.warkingList)
          );
          warningList.value = [];

          realTimeData.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                if (key.id === DATA.buswaryInfo.busWayId) {
                  // 循环遍历 分段母线槽 获取全部分段母线槽
                  if (key.warningSectionBusWayDtos.length > 0) {
                    key.warningSectionBusWayDtos.forEach((val: any) => {
                      let tempList: any = [];
                      // 节点数据
                      val.homePageNodeDtoList.forEach((v: any) => {
                        // 遍历 现有节点
                        DATA.nodeList.forEach((h: any) => {
                          if (v.nodeId === h.nodeId) {
                            // 最新采集时间
                            h.acquisitionTime = v.nodeTemp
                              ? new Date().toLocaleString()
                              : h.acquisitionTime
                                ? h.acquisitionTime
                                : null;
                            // 保留之前温度数据
                            v.nodeTemp = v.nodeTemp ?? h.nodeTemp;
                            // 显示图片节点 实时温度
                            h.nodeRealtimeTemp = v.nodeTemp
                              ? `${v.nodeName} - 最新温度:${v.nodeTemp?.toFixed(
                                1
                              )}℃`
                              : null;
                            // 控制 刷新回显
                            h.nodeTemp = v.nodeTemp;
                            // 显示列表节点 实时温度
                            h.temp = v.nodeTemp
                              ? v.nodeTemp?.toFixed(1) + "℃"
                              : null;
                            if (v.warningType) {
                              h.typeName = v.warningType;
                              h.color = "#ff0000";
                              h.warningName = v.nodeTemp
                                ? `${v.nodeName} : ${v.nodeTemp?.toFixed(1)}℃`
                                : v.nodeName;
                            } else {
                              h.typeName = null;
                              h.color = "#008000";
                            }
                          }
                        });
                        tempList.push(v.nodeTemp);
                      });

                      // 保留 标识点平均温度
                      if (
                        tempList.length === 0 ||
                        tempList.includes(null) ||
                        tempList.includes(undefined)
                      ) {
                        val.avgTemp = null;
                        val.acquisitionTime = null;
                      } else {
                        let sumTemp = tempList.reduce((a: any, b: any) => {
                          return a + b;
                        }, 0);
                        val.avgTemp = (sumTemp / tempList.length).toFixed(1);
                        val.acquisitionTime = new Date().toLocaleString();
                      }

                      // 保存实时分段数据
                      if (
                        val.sectionBusWayId === DATA.buswaryInfo.sectionBusWayId
                      ) {
                        STORE.commit("setBuswaryInfo", {
                          ...val,
                          homePageNodeDtoList: DATA.nodeList
                        });
                      }
                    });
                  }
                }

                // 循环遍历 分段母线槽 获取全部分段母线槽
                if (key.warningSectionBusWayDtos.length > 0) {
                  key.warningSectionBusWayDtos.forEach((val: any) => {
                    warningTypeList.push(val.typeName);

                    // 遍历 现有分段母线槽
                    markings.forEach((h: any) => {
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
                      }
                    });

                    // 改变标识点颜色
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
                              require("../../../assets/image/noFile.png"),
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
          STORE.commit("setWarkingList", markings);
        }
      },
      // 实时温度 socket
      initRealtimeSocket: () => {
        if (!("WebSocket" in window)) {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
          return;
        }
        // let socketapi =
        //   'ws://' +
        //   location.host +
        //   '/netty2WebSocket/' +
        //   STORE.state.user.userId;
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        // DATA.websocketNetty = new WebSocket(socketapi);
        DATA.websocketNetty = STORE.state.data.realtimeSocket;
        // 收到消息的回调
        DATA.websocketNetty.onmessage = SOCKET.setOnmessageMessage;
      },
      // 实时数据
      setOnmessageMessage: (result: any) => {
        if (result.data.slice(0, 4) === "temp") {
          setOnmessageNettyMessage(result);
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );
          if (
            DATA.dialogVisible &&
            DATA.buswaryInfo.busWayId === realTimeData.busWayId
          ) {
            DATA.loading = true;
            // 判断是否存在补偿温度
            if (realTimeData.compensationNodes.length > 0) {
              METHODS.updateEchartsData(realTimeData.compensationNodes);
            } else if (realTimeData.nodeTemps.length > 0) {
              METHODS.updateEchartsData(realTimeData.nodeTemps);
            }
            if (DATA.isZoom) {
              DATA.isZoom = false;
              DATA.options.dataZoom[0].start = DATA.startx;
              DATA.options.dataZoom[0].end = DATA.endx;
              DATA.options.dataZoom[1].start = DATA.startx;
              DATA.options.dataZoom[1].end = DATA.endx;
              DATA.options.dataZoom[2].start = DATA.starty;
              DATA.options.dataZoom[2].end = DATA.endy;
              DATA.options.dataZoom[3].start = DATA.starty;
              DATA.options.dataZoom[3].end = DATA.endy;
            }
          }
        }
      }
    });
    DATA.buswaryInfo = JSON.parse(JSON.stringify(STORE.state.data.buswaryInfo));


    // watch(
    //   () => STORE.state.globalData.companyInfo.companyId,
    //   async () => {
    //     await METHODS.handleGetCompanyDetails();
    //     if (STORE.state.user.personnel.unitType === 1) {
    //       DATA.isAuthorize = true;
    //     } else {
    //       DATA.isAuthorize = DATA.companyInfo
    //         ? DATA.companyInfo.isAuthorize
    //         : false;
    //     }
    //   }
    // );
    onMounted(async () => {
      SOCKET.initHomeSocket();
      SOCKET.initRealtimeSocket();
      DATA.pageLoading = true;
      await METHODS.handleGetNodeData();
      DATA.pageLoading = false;
    });
    onUnmounted(() => {
      // DATA.socket && DATA.socket.close();
      // DATA.websocketNetty && DATA.websocketNetty.close();
      // DATA.socket = null;
      // DATA.websocketNetty = null;
      DATA.timer && clearTimeout(DATA.timer);
      DATA.nodetimer && clearInterval(DATA.nodetimer);
    });

    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
      IMG_URL,
      IMG_File,
      buswayImg,
      echarts,
      localRead,
      sessionRead,
      greenIconurl,
      redIconurl,
      dayjs
    };
  }
});
</script>
<style scoped lang="scss">
@mixin node {
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

  &:hover:after {
    display: inline-block;
    content: attr(data-name);
    font-size: 12px;
    font-weight: bold;
    position: absolute;
    top: -40px;
    left: 50%;
    min-width: 110px;
    // white-space: normal;
    // white-space: break-spaces;
    // white-space: break-spaces !important;
    text-align: center;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 4px;
    white-space: nowrap;
    transform: translateX(-50%);
  }
}

.node {
  margin-top: 30px;

  .node-item {
    margin-bottom: 10px;
    padding: 0 10px;
    cursor: pointer;

    /deep/ .el-image__inner {
      -webkit-user-drag: none;
      -moz-user-drag: none;
    }
  }

  .warning {
    /deep/ .el-card__body {
      border: 2px solid #ff0000;
    }
  }
}

.buswayMap {
  position: relative;

  .buswayImg {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
  }

  .nodeItem {
    // @include node;
    position: absolute;
    transform: translate(-50%, -100%);
    transform-origin: center;
    cursor: pointer;

    &::after {
      display: inline-block;
      content: attr(data-warning);
      font-size: 12px;
      font-weight: bold;
      position: absolute;
      top: -20px;
      left: 50%;
      min-width: 110px;
      // white-space: break-spaces;
      // white-space: break-spaces !important;
      text-align: center;
      color: #ff0000;
      // background-color: rgba(0, 0, 0, 0.8);
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
  }

  .z-1000 {
    z-index: 1000;
  }
}

.nav-back {
  cursor: pointer;

  &:hover {
    color: #409eff;
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

// 文本设置
.text-setting {
  font-size: 14px;
  white-space: nowrap;
  height: 20px;
  line-height: 20px;
}

/deep/ .el-empty__image {
  width: 60px;
}

/deep/ .el-loading-spinner {
  top: 200px;
}

.nodeInfo {
  margin-bottom: 5px;
}
</style>