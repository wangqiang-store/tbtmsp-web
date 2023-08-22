<template>
  <el-row>
    <el-col :span="24">
      <el-tabs
        stretch
        v-model="activeName"
        @tab-click="handleClick"
      >
        <el-tab-pane
          label="母线槽"
          name="busway"
        >
          <el-row>
            <!-- 头部搜索 -->
            <el-col :span="24">
              <el-row
                type="flex"
                justify="end"
                style="align-items: center;flex-wrap: nowrap;"
              >
                <span class="mr-10">温度显示范围倍率</span>
                <el-input
                  clearable
                  placeholder="请输入倍率"
                  v-model="buswayRate"
                  class="mr-10"
                  style="width:200px"
                ></el-input>
                <span class="mr-10">温度点间距范围</span>
                <el-input
                  clearable
                  placeholder="请输入温度点间距范围"
                  v-model="fordDistance"
                  class="mr-10"
                  style="width:200px"
                ></el-input>
                <el-select
                  v-model="buswaySearchParams.electricRoomId"
                  clearable
                  filterable
                  placeholder="请选择电房"
                  style="margin-right:10px"
                  @change="handleChangeBuswayElectricRoom"
                >
                  <el-option
                    v-for="val in electricRoomList"
                    :key="val.id"
                    :label="val.name"
                    :value="val.id"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-model="buswaySearchParams.busWayId"
                  clearable
                  filterable
                  placeholder="请选择母线槽"
                  style="margin-right:10px"
                  @change="handleChnageBusway"
                >
                  <el-option
                    v-for="val in busways"
                    :key="val.id"
                    :label="val.name"
                    :value="val.id"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-model="buswaySearchParams.subsectionBusWayId"
                  clearable
                  filterable
                  placeholder="请选择母线槽分段"
                  style="margin-right:10px"
                >
                  <el-option
                    v-for="val in subsectionBusWays"
                    :key="val.id"
                    :label="val.sectionName"
                    :value="val.id"
                  >
                  </el-option>
                </el-select>
                <el-button
                  type="primary"
                  @click="handleBuswaySearch"
                  style="margin-right:10px"
                ><i class="el-icon-search"></i></el-button>
                <offsetTemp
                  :busWayId="buswaySearchParams.busWayId"
                  :startDis="buswayStartDis"
                  :endDis="buswayEndDis"
                />
              </el-row>
            </el-col>
            <el-col :span="24">
              <el-row>
                <el-col
                  :span="24"
                  class="echarts"
                >
                  <initEcharts
                    id="buswayEcharts"
                    :options="buswayOptions"
                    :styles="styles"
                    @dataZoom="handleBuswayDataZoom"
                    ref="echarts"
                  />
                  <DataLoading
                    class="dataLoading"
                    v-show="buswayLoading"
                  />
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane
          label="节点"
          name="node"
        >
          <el-row>
            <!-- 头部搜索 -->
            <el-col :span="24">
              <el-row
                type="flex"
                justify="end"
                style="align-items: center;flex-wrap: nowrap;"
              >
                <span class="mr-10">温度显示范围倍率</span>
                <el-input
                  clearable
                  placeholder="请输入倍率"
                  v-model="rate"
                  class="mr-10"
                  style="width:200px"
                ></el-input>
                <el-select
                  v-model="searchParams.electricRoomId"
                  clearable
                  filterable
                  placeholder="请选择电房"
                  style="margin-right:10px"
                  @change="handleChangeElectricRoom"
                >
                  <el-option
                    v-for="val in electricRoomList"
                    :key="val.id"
                    :label="val.name"
                    :value="val.id"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-model="searchParams.busWayId"
                  clearable
                  filterable
                  placeholder="请选择母线槽"
                  style="margin-right:10px"
                  @change="handleChangeNodeBusway"
                >
                  <el-option
                    v-for="val in buswayList"
                    :key="val.id"
                    :label="val.name"
                    :value="val.id"
                  >
                  </el-option>
                </el-select>
                <el-button
                  type="primary"
                  @click="handleSearch"
                  style="margin-right:10px"
                ><i class="el-icon-search"></i></el-button>
                <offsetTemp
                  :busWayId="searchParams.busWayId"
                  :startDis="nodeStartDis"
                  :endDis="nodeEndDis"
                />
              </el-row>
            </el-col>
            <el-col :span="24">
              <el-row>
                <el-col
                  :span="24"
                  class="echarts"
                >
                  <initEcharts
                    id="nodeEcharts"
                    :options="options"
                    :styles="styles"
                    @dataZoom="handleDataZoom"
                    ref="echarts"
                  />

                  <DataLoading
                    class="dataLoading"
                    v-show="loading"
                  />
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  onMounted,
  onUnmounted,
  nextTick
} from "vue";
import initEcharts from "@/components/initEcharts/index.vue";
import DataLoading from "@/components/dataLoading/index.vue";
import offsetTemp from "./component/compensationTemp.vue";
import { useStore } from "vuex";
import { RES_SUCCESS } from "@/api/common/common";
import { findListBusbar } from "@/api/maintenance/busbar";
import { ElMessage } from "element-plus";
import { searchTemperature } from "@/api/temp/temperature";
import { verifyPlus } from "@/api/common/verify";
import { findSectionBusWay } from "@/api/maintenance/buswaySubsection";
import { findSectionNodes } from "@/api/maintenance/node";
export default defineComponent({
  components: { initEcharts, DataLoading, offsetTemp },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let STORE = useStore();
    // 母线槽 图表数据
    let buswayEchartsData: any = ref([]);
    // 母线槽 补偿图表数据
    let buswayCompensationEchartsData: any = ref([]);
    // 节点 图表数据
    let echartsData: any = ref([]);
    // 节点 补偿图表数据
    let echartsCompensationData: any = ref([]);
    // 图表实例
    let echarts: any = ref(null);
    let DATA: any = reactive({
      /**
       * 母线槽
       */
      buswaySearchParams: {
        electricRoomId: "",
        busWayId: "",
        subsectionBusWayId: null
      },
      buswayRate: 2,
      fordDistance: 2,
      busways: [],
      subsectionBusWays: [], //分段母线槽数据
      sectionNodeList: [], //分段节点
      busWaysId: null,
      /**
       * 节点
       */
      searchParams: {
        electricRoomId: "",
        busWayId: ""
      },
      rate: 2,
      activeName: "busway",
      electricRoomList: [],
      buswayList: [],
      // 节点 echarts配置
      options: {
        animation: false,
        title: {
          text: "节点实时温度折线图",
          left: "center"
        },
        xAxis: {
          name: "节点名称(光纤距离)",
          type: "category",
          minorTick: {
            show: true
          },
          axisLine: {
            //x轴
            show: true,
            onZero: false
          },
          minorSplitLine: {
            show: true
          }
        },
        yAxis: {
          name: "实时温度(℃)",
          type: "value",
          scale: true,
          min: 0,
          max: 100,
          minInterval: 0.5,
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(2);
            }
          },
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
          show: true
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          },
          right: "5%"
        },
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["实时温度", "实时补偿温度"],
          top: "4%"
        },
        grid: {
          left: "2%",
          right: "9%",
          bottom: "8%",
          containLabel: true,
          height: "85%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          formatter: function (params: any) {
            // let temp =
            //   params[0].value[1] % 1 === 0
            //     ? params[0].value[1]
            //     : params[0].value[1].toFixed(1);
            // let distance =
            //   params[0].value[2] % 1 === 0
            //     ? params[0].value[2]
            //     : params[0].value[2].toFixed(1);

            // 多节点显示
            let data: object[] = [],
              temp = "",
              distance = "";
            params.forEach((item: any) => {
              data.push({
                color: item.color,
                temp:
                  item.value[1] % 1 === 0
                    ? item.value[1] + "℃"
                    : item.value[1].toFixed(1) + "℃",
                distance:
                  item.value[2] % 1 === 0
                    ? item.value[2] + "m"
                    : item.value[2].toFixed(1) + "m"
              });
            });

            data.forEach((item: any, index: number) => {
              if (index !== data.length - 1) {
                temp += `<span style='color:${item.color}'>${item.temp},</span>`;
                distance += `<span style='color:${item.color}'>${item.distance},</span>`;
              } else {
                temp += `<span style='color:${item.color}'>${item.temp}</span>`;
                distance += `<span style='color:${item.color}'>${item.distance}</span>`;
              }
            });

            var htmlStr = "";
            htmlStr += "<div>";
            //为了保证和原来的效果一样，这里自己实现了一个点的效果
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr +=
              "节点名称" +
              `: ${params[0].value[0].slice(
                0,
                params[0].value[0].lastIndexOf("(")
              )}<br/>`;
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "温度" + `: ${temp}<br/>`;
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "光纤距离" + `: ${distance}<br/>`;
            htmlStr += "</div>";
            return htmlStr;
          },
          borderWidth: 1
        },
        dataZoom: [
          //X轴滑动条
          {
            type: "slider", //滑动条
            show: true, //开启
            xAxisIndex: [0],
            filterMode: "none",
            left: "3.5%", //滑动条位置
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
            top: "7%",
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
            name: "实时温度",
            data: echartsData.value,
            type: "line",
            // stack: '总量',
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#bf444c",
              borderColor: "#bf444c" //拐点边框颜色
            },
            lineStyle: {
              color: "#bf444c" //改变折线颜色
            },
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" }
              ],
              label: {
                formatter: function (param: any) {
                  return param.data.value % 1 === 0
                    ? param.data.value
                    : param.data.value.toFixed(1);
                }
              }
            }
          },
          {
            name: "实时补偿温度",
            data: echartsCompensationData.value,
            type: "line",
            // stack: '总量',
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#e5c07b",
              borderColor: "#e5c07b" //拐点边框颜色
            },
            lineStyle: {
              color: "#e5c07b" //改变折线颜色
            },
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" }
              ],
              label: {
                formatter: function (param: any) {
                  return param.data.value % 1 === 0
                    ? param.data.value
                    : param.data.value.toFixed(1);
                }
              }
            }
          }
        ]
      },
      // 母线槽 echarts 配置
      buswayOptions: {
        animation: false,
        title: {
          text: "母线槽实时温度折线图",
          left: "center"
        },
        xAxis: {
          name: "光纤距离(m)",
          type: "value",
          min: 0,
          max: 100,
          minorTick: {
            show: true
          },
          minorSplitLine: {
            show: true
          },
          axisLine: {
            //x轴
            show: true,
            onZero: false
          },
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : Number(value).toFixed(2);
            }
          }
        },
        yAxis: {
          name: "实时温度(℃)",
          type: "value",
          scale: true,
          min: 0,
          max: 100,
          minInterval: 0.5,
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(2);
            }
          },
          minorTick: {
            show: true
          },
          minorSplitLine: {
            show: true
          },
          axisLine: {
            //y轴
            show: true,
            onZero: false
          },
          axisTick: {
            //y轴刻度线
            show: true
          },
          show: true
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          },
          right: "5%"
        },
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["实时温度", "实时补偿温度"],
          top: "4%"
        },
        grid: {
          left: "2%",
          right: "5.2%",
          bottom: "8%",
          containLabel: true,
          height: "85%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          formatter: function (params: any) {
            // let distance = params[0].value[0];
            // let temp = params[0].value[1];

            // 多节点显示
            let data: object[] = [],
              temp = "",
              distance = "";
            params.forEach((item: any) => {
              data.push({
                color: item.color,
                temp:
                  item.value[1] % 1 === 0
                    ? item.value[1] + "℃"
                    : item.value[1].toFixed(1) + "℃",
                distance:
                  item.value[0] % 1 === 0
                    ? item.value[0] + "m"
                    : item.value[0].toFixed(1) + "m"
              });
            });

            data.forEach((item: any, index: number) => {
              if (index !== data.length - 1) {
                temp += `<span style='color:${item.color}'>${item.temp},</span>`;
                distance += `<span style='color:${item.color}'>${item.distance},</span>`;
              } else {
                temp += `<span style='color:${item.color}'>${item.temp}</span>`;
                distance += `<span style='color:${item.color}'>${item.distance}</span>`;
              }
            });

            var htmlStr = "";
            htmlStr += "<div>";
            //为了保证和原来的效果一样，这里自己实现了一个点的效果
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "温度" + `: ${temp}<br/>`;
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "光纤距离" + `: ${distance}<br/>`;
            htmlStr += "</div>";
            return htmlStr;
          },
          borderWidth: 1
        },
        dataZoom: [
          //X轴滑动条
          {
            type: "slider", //滑动条
            show: true, //开启
            xAxisIndex: [0],
            filterMode: "none",
            left: "3.5%", //滑动条位置
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
            top: "7%",
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
            name: "实时温度",
            data: buswayEchartsData.value,
            type: "line",
            // stack: '总量',
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#bf444c",
              borderColor: "#bf444c" //拐点边框颜色
            },
            lineStyle: {
              color: "#bf444c" //改变折线颜色
            },
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" }
              ],
              label: {
                formatter: function (param: any) {
                  return param.data.value % 1 === 0
                    ? param.data.value
                    : param.data.value.toFixed(1);
                }
              }
            }
          },
          {
            name: "实时补偿温度",
            data: buswayCompensationEchartsData.value,
            type: "line",
            // stack: '总量',
            symbol: "circle",
            symbolSize: 5,
            // sampling: 'lttb', //降采样策略
            itemStyle: {
              color: "#e5c07b",
              borderColor: "#e5c07b" //拐点边框颜色
            },
            lineStyle: {
              color: "#e5c07b" //改变折线颜色
            },
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" }
              ],
              label: {
                formatter: function (param: any) {
                  return param.data.value % 1 === 0
                    ? param.data.value
                    : param.data.value.toFixed(1);
                }
              }
            }
          }
        ]
      },
      styles: {
        width: "100%",
        marginTop: "10px"
      },
      websocketNetty: null,
      busWayId: null,
      subsectionBusWayId: null,
      // 图表缩放比例
      startx: "",
      endx: "",
      starty: "",
      endy: "",
      isDataZoom: false, //节点缩放
      // 母线槽缩放比例
      busWayStartx: "",
      busWayEndx: "",
      busWayStarty: "",
      busWayEndy: "",
      isbusWayDataZoom: false, //母线槽缩放缩放
      loading: false,
      buswayLoading: false,
      // 母线槽距离段
      buswayStartDis: null,
      buswayEndDis: null,
      nodeStartDis: null,
      nodeEndDis: null
    });
    let METHODS: any = reactive({
      /**
       * 母线槽
       */
      handleChangeBuswayElectricRoom: async () => {
        DATA.busways = [];
        DATA.buswaySearchParams.busWayId = null;
        DATA.subsectionBusWays = [];
        DATA.buswaySearchParams.subsectionBusWayId = null;
        DATA.buswaySearchParams.electricRoomId &&
          (DATA.busways = await METHODS.handlFindBusWayData(
            DATA.buswaySearchParams.electricRoomId
          ));
      },
      handleChnageBusway: async () => {
        // 获取选择母线槽距离段
        DATA.busways.forEach((item: any) => {
          if (item.id === DATA.buswaySearchParams.busWayId) {
            DATA.buswayStartDis = item.startDis;
            DATA.buswayEndDis = item.endDis;
          }
        });

        DATA.subsectionBusWays = [];
        DATA.buswaySearchParams.subsectionBusWayId = null;
        DATA.buswaySearchParams.busWayId &&
          (DATA.subsectionBusWays = await METHODS.handleFindSectionBusWay(
            DATA.buswaySearchParams.busWayId
          ));
      },
      handleBuswaySearch: async () => {
        if (!DATA.buswayRate) {
          ElMessage({
            message: "请输入温度倍率",
            type: "warning"
          });
          return;
        } else if (!verifyPlus.test(DATA.buswayRate)) {
          ElMessage({
            message: "温度倍率数据格式为正数",
            type: "warning"
          });
          return;
        }
        if (!DATA.fordDistance) {
          ElMessage({
            message: "请输入光纤距离倍率",
            type: "warning"
          });
          return;
        } else if (!verifyPlus.test(DATA.fordDistance)) {
          ElMessage({
            message: "光纤距离倍率数据格式为正数",
            type: "warning"
          });
          return;
        }
        if (!DATA.buswaySearchParams.electricRoomId) {
          ElMessage({
            message: "请选择电房",
            type: "warning"
          });
          return;
        }
        if (!DATA.buswaySearchParams.busWayId) {
          ElMessage({
            message: "请选择母线槽",
            type: "warning"
          });
          return;
        }
        // 保存 母线槽ID
        DATA.busWaysId = DATA.buswaySearchParams.busWayId;
        // 保存 分段母线槽ID
        DATA.subsectionBusWayId = DATA.buswaySearchParams.subsectionBusWayId;
        DATA.buswayLoading = true;
        // 重置缩放比例
        DATA.busWayStartx = 0;
        DATA.busWayEndx = 100;
        DATA.busWayStarty = 0;
        DATA.busWayEndy = 100;
        DATA.buswayOptions.dataZoom[0].start = DATA.busWayStartx;
        DATA.buswayOptions.dataZoom[0].end = DATA.busWayEndx;
        DATA.buswayOptions.dataZoom[1].start = DATA.busWayStartx;
        DATA.buswayOptions.dataZoom[1].end = DATA.busWayEndx;
        DATA.buswayOptions.dataZoom[2].start = DATA.busWayStarty;
        DATA.buswayOptions.dataZoom[2].end = DATA.busWayEndy;
        DATA.buswayOptions.dataZoom[3].start = DATA.busWayStarty;
        DATA.buswayOptions.dataZoom[3].end = DATA.busWayEndy;
        // 清空折线图数据
        // DATA.buswayOptions.series[0].data = [];

        // 获取分段 母线槽 节点
        if (DATA.buswaySearchParams.subsectionBusWayId) {
          let { data } = await findSectionNodes({
            SectionBusWayId: DATA.buswaySearchParams.subsectionBusWayId
          });
          if (data.code === RES_SUCCESS) {
            if (data.data.length === 0) {
              ElMessage({
                message: "该分段母线槽下暂无节点",
                type: "warning"
              });
            }
            DATA.sectionNodeList = data.data;
          }
        } else {
          DATA.sectionNodeList = [];
        }
      },
      // 级联获取分段母线槽
      handleFindSectionBusWay: async (busWayId: number) => {
        let { data } = await findSectionBusWay({ busWayId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      /**
       * 节点
       */
      handleSearch: async () => {
        if (!DATA.rate) {
          ElMessage({
            message: "请输入倍率",
            type: "warning"
          });
          return;
        } else if (!verifyPlus.test(DATA.rate)) {
          ElMessage({
            message: "倍率数据格式为正数",
            type: "warning"
          });
          return;
        }
        if (!DATA.searchParams.electricRoomId) {
          ElMessage({
            message: "请选择电房",
            type: "warning"
          });
          return;
        }
        if (!DATA.searchParams.busWayId) {
          ElMessage({
            message: "请选择母线槽",
            type: "warning"
          });
          return;
        }
        echartsCompensationData.value = [];
        echartsData.value = [];
        // echarts.value.chartfinished();
        DATA.loading = true;
        // 保存 节点母线槽ID
        DATA.busWayId = DATA.searchParams.busWayId;
        let { data } = await searchTemperature({
          busWayId: DATA.searchParams.busWayId
        });
        if (data.code === RES_SUCCESS) {
          if (data.data != null) {
            data.data.forEach((item: any) => {
              echartsCompensationData.value.push([
                `${item.nodeName}(${item.distance}m)`,
                item.temp,
                item.distance
              ]);
            });
            let { min: nodeMin, max: nodeMax } = METHODS.handleCompute(
              data.data,
              "temp",
              "rate"
            );
            DATA.options.yAxis.min = nodeMin;
            DATA.options.yAxis.max = nodeMax;
            // DATA.options.series[0].data = echartsData.value;
            // echarts.value.charthideloading();
          } else {
            ElMessage({
              message: "该母线槽没有节点实时温度数据",
              type: "warning"
            });
          }
        }
        DATA.loading = false;
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
        DATA.options.series[1].data = echartsCompensationData.value;
        DATA.options.series[0].data = echartsData.value;
      },

      // 切换电房
      handleChangeElectricRoom: async () => {
        DATA.buswayList = [];
        DATA.searchParams.busWayId = null;
        DATA.searchParams.electricRoomId &&
          (DATA.buswayList = await METHODS.handlFindBusWayData(
            DATA.searchParams.electricRoomId
          ));
      },
      // 级联获取母线槽数据
      handlFindBusWayData: async (electricRoomId: number) => {
        let { data } = await findListBusbar({ electricRoomId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      handleChangeNodeBusway: () => {
        // 获取选择母线槽距离段
        DATA.buswayList.forEach((item: any) => {
          if (item.id === DATA.searchParams.busWayId) {
            DATA.nodeStartDis = item.startDis;
            DATA.nodeEndDis = item.endDis;
          }
        });
      },
      // 图表缩放 保存缩放比例
      handleDataZoom: (event: any) => {
        DATA.isDataZoom = true;
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
      handleBuswayDataZoom: (event: any) => {
        DATA.isbusWayDataZoom = true;
        if (event.batch != undefined) {
          if (event.batch.length === 1) {
            if (event.batch[0].dataZoomId.indexOf("1") === -1) {
              DATA.busWayStarty = event.batch[0].start;
              DATA.busWayEndy = event.batch[0].end;
            } else {
              DATA.busWayStartx = event.batch[0].start;
              DATA.busWayEndx = event.batch[0].end;
            }
          } else {
            DATA.busWayStartx = event.batch[0].start;
            DATA.busWayEndx = event.batch[0].end;
            DATA.busWayStarty = event.batch[1].start;
            DATA.busWayEndy = event.batch[1].end;
          }
        } else {
          if (event.dataZoomId.indexOf("2") === -1) {
            DATA.busWayStartx = event.start;
            DATA.busWayEndx = event.end;
          } else {
            DATA.busWayStarty = event.start;
            DATA.busWayEndy = event.end;
          }
        }
      },
      // 切换tabs
      handleClick: (tab: any, event: Event) => {},
      // 计算 曲线最大最小值
      handleCompute: (data: Array<any>, key: string, rateKey: string) => {
        let min, max, startTemp, endTemp;
        // 排序
        let sortData = JSON.parse(JSON.stringify(data)).sort(
          (a: any, b: any) => {
            return a[key] - b[key];
          }
        );
        startTemp = sortData[0].temp;
        endTemp = sortData[sortData.length - 1].temp;
        if (startTemp !== endTemp) {
          min = +(
            (startTemp + endTemp - (endTemp - startTemp) * DATA[rateKey] || 2) /
            2
          ).toFixed(1);
          max = +(
            (startTemp + endTemp + (endTemp - startTemp) * DATA[rateKey] || 2) /
            2
          ).toFixed(1);
        } else {
          min = +(
            (startTemp + endTemp - (endTemp - startTemp) * DATA[rateKey] || 2) /
            4
          ).toFixed(1);
          max = +(startTemp + endTemp).toFixed(1);
        }
        return { min, max };
      }
    });
    // websocket
    let SOCKET: any = reactive({
      async initWebSocket() {
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;

        // let socketapi =
        //   'ws://' +
        //   location.host +
        //   '/netty2WebSocket/' +
        //   STORE.state.user.userId;
        if (!("WebSocket" in window)) {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
          return;
        }
        // DATA.websocketNetty = new WebSocket(socketapi);
        DATA.websocketNetty = STORE.state.data.realtimeSocket;
        // 连接错误回调
        DATA.websocketNetty.onerror = SOCKET.setErrorMessage;
        // 收到消息的回调
        DATA.websocketNetty.onmessage = SOCKET.setOnmessageMessage;
      },
      setOnmessageMessage: (result: any) => {
        if (result.data.slice(0, 4) === "temp") {
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );

          // 母线槽实时数据逻辑
          if (realTimeData.busWayId === DATA.busWaysId) {
            DATA.buswayLoading = true;
            buswayCompensationEchartsData.value = [];
            buswayEchartsData.value = [];
            if (DATA.isbusWayDataZoom) {
              DATA.buswayOptions.dataZoom[0].start = DATA.busWayStartx;
              DATA.buswayOptions.dataZoom[0].end = DATA.busWayEndx;
              DATA.buswayOptions.dataZoom[1].start = DATA.busWayStartx;
              DATA.buswayOptions.dataZoom[1].end = DATA.busWayEndx;
              DATA.buswayOptions.dataZoom[2].start = DATA.busWayStarty;
              DATA.buswayOptions.dataZoom[2].end = DATA.busWayEndy;
              DATA.buswayOptions.dataZoom[3].start = DATA.busWayStarty;
              DATA.buswayOptions.dataZoom[3].end = DATA.busWayEndy;
            }
            // 母线槽补偿实时数据
            if (
              realTimeData.compensationTemps !== null &&
              realTimeData.compensationTemps.length > 0
            ) {
              realTimeData.compensationTemps.sort((a: any, b: any) => {
                return a["distance"] - b["distance"];
              });
              realTimeData.compensationTemps.forEach((item: any) => {
                if (!DATA.subsectionBusWayId) {
                  buswayCompensationEchartsData.value.push([
                    item.distance,
                    item.temp
                  ]);
                } else if (DATA.sectionNodeList.length === 0) {
                  buswayCompensationEchartsData.value = [];
                } else if (DATA.sectionNodeList.length === 1) {
                  if (DATA.sectionNodeList[0].id === item.id) {
                    buswayCompensationEchartsData.value.push([
                      item.distance,
                      item.temp
                    ]);
                  }
                } else {
                  if (
                    Number(item.distance) >=
                      Number(DATA.sectionNodeList[0].fiberDistance) &&
                    Number(item.distance) <=
                      Number(
                        DATA.sectionNodeList[DATA.sectionNodeList.length - 1]
                          .fiberDistance
                      )
                  ) {
                    buswayCompensationEchartsData.value.push([
                      item.distance,
                      item.temp
                    ]);
                  }
                }
              });
            }

            // 母线槽实时数据
            if (
              realTimeData.distanceAndTemps !== null &&
              realTimeData.distanceAndTemps.length > 0
            ) {
              realTimeData.distanceAndTemps.sort((a: any, b: any) => {
                return a["distance"] - b["distance"];
              });
              realTimeData.distanceAndTemps.forEach((item: any) => {
                if (!DATA.subsectionBusWayId) {
                  buswayEchartsData.value.push([item.distance, item.temp]);
                } else if (DATA.sectionNodeList.length === 0) {
                  buswayEchartsData.value = [];
                } else if (DATA.sectionNodeList.length === 1) {
                  if (DATA.sectionNodeList[0].id === item.id) {
                    buswayEchartsData.value.push([item.distance, item.temp]);
                  }
                } else {
                  if (
                    Number(item.distance) >=
                      Number(DATA.sectionNodeList[0].fiberDistance) &&
                    Number(item.distance) <=
                      Number(
                        DATA.sectionNodeList[DATA.sectionNodeList.length - 1]
                          .fiberDistance
                      )
                  ) {
                    buswayEchartsData.value.push([item.distance, item.temp]);
                  }
                }
              });
              let { min: nodeMin, max: nodeMax } = METHODS.handleCompute(
                [
                  ...realTimeData.distanceAndTemps,
                  ...(realTimeData.compensationTemps || [])
                ],
                "temp",
                "buswayRate"
              );
              DATA.buswayOptions.yAxis.min = nodeMin;
              DATA.buswayOptions.yAxis.max = nodeMax;
              // 设置 光纤距离倍率
              let startDistance, endDistance;
              startDistance = buswayEchartsData.value[0][0];
              endDistance =
                buswayEchartsData.value[buswayEchartsData.value.length - 1][0];

              DATA.buswayOptions.xAxis.min = +(
                (startDistance +
                  endDistance -
                  (endDistance - startDistance) * DATA.fordDistance || 2) / 2
              ).toFixed(1);
              DATA.buswayOptions.xAxis.max = +(
                (startDistance +
                  endDistance +
                  (endDistance - startDistance) * DATA.fordDistance || 2) / 2
              ).toFixed(1);
            }

            nextTick(() => {
              DATA.buswayOptions.series[0].data = buswayEchartsData.value;
              DATA.buswayOptions.series[1].data =
                buswayCompensationEchartsData.value;
              setTimeout(() => {
                DATA.buswayLoading = false;
              }, 800);
            });
          }

          // 节点 实时数据逻辑
          if (realTimeData.busWayId === DATA.busWayId) {
            echartsCompensationData.value = [];
            echartsData.value = [];
            if (DATA.isDataZoom) {
              DATA.options.dataZoom[0].start = DATA.startx;
              DATA.options.dataZoom[0].end = DATA.endx;
              DATA.options.dataZoom[1].start = DATA.startx;
              DATA.options.dataZoom[1].end = DATA.endx;
              DATA.options.dataZoom[2].start = DATA.starty;
              DATA.options.dataZoom[2].end = DATA.endy;
              DATA.options.dataZoom[3].start = DATA.starty;
              DATA.options.dataZoom[3].end = DATA.endy;
            }

            // 节点补偿实时数据
            if (
              realTimeData.compensationNodes !== null &&
              realTimeData.compensationNodes.length > 0
            ) {
              realTimeData.compensationNodes.forEach((item: any) => {
                echartsCompensationData.value.push([
                  `${item.nodeName}(${item.distance}m)`,
                  item.temp,
                  item.distance
                ]);
              });
            }
            // 节点实时数据
            if (
              realTimeData.nodeTemps !== null &&
              realTimeData.nodeTemps.length > 0
            ) {
              realTimeData.nodeTemps.forEach((item: any) => {
                echartsData.value.push([
                  `${item.nodeName}(${item.distance}m)`,
                  item.temp,
                  item.distance
                ]);
              });
              let { min: nodeMin, max: nodeMax } = METHODS.handleCompute(
                [
                  ...realTimeData.nodeTemps,
                  ...(realTimeData.compensationNodes || [])
                ],
                "temp",
                "rate"
              );
              DATA.options.yAxis.min = nodeMin;
              DATA.options.yAxis.max = nodeMax;
            }

            nextTick(() => {
              // echarts.value.chartfinished();
              DATA.loading = true;
              DATA.options.series[0].data = echartsData.value;
              DATA.options.series[1].data = echartsCompensationData.value;
              setTimeout(() => {
                // echarts.value.charthideloading();
                DATA.loading = false;
              }, 800);
            });
          }
        }
      },
      setErrorMessage: (err: any) => {
        console.log(err);
      }
    });
    onMounted(() => {
      DATA.electricRoomList = STORE.state.data.electricRoomList;
      SOCKET.initWebSocket();
    });
    onUnmounted(() => {
      // DATA.websocketNetty && DATA.websocketNetty.close();
      // DATA.websocketNetty = null;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      echarts
    };
  }
});
</script>
<style lang="scss" scoped>
// /deep/ .el-loading-spinner {
//   top: 25%;
// }

.echarts {
  position: relative;
  .dataLoading {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
/deep/ .el-tabs__nav-scroll {
  width: 50% !important;
  margin: 0 auto !important;
}
/deep/ .el-tabs__nav-next,
/deep/ .el-tabs__nav-prev {
  font-size: 0;
}
/deep/ .el-tabs__nav-wrap::after {
  width: 48%;
  transform: translateX(54%);
}
/deep/ .el-tabs__item {
  font-size: 16px;
}

/deep/ .el-tabs__active-bar {
  width: 50% !important;
}
</style>