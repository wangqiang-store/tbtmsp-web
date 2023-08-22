<template>
  <el-row>
    <el-col :span="24">
      <!-- 母线槽详情 -->
      <big-container title="母线槽详情" class="p-20" v-if="!isWarning">
        <template #body>
          <!-- 母线槽实时温度曲线 -->
          <el-row class="mb-20" v-if="false">
            <el-col :span="24">
              <LittleContainer title="实时温度曲线" class="mb-20" />
              <!-- 头部搜索 -->
              <el-row type="flex" justify="end" style="align-items: center;">
                <span class="mr-10">温度显示范围倍率</span>
                <el-input clearable placeholder="请输入倍率" v-model="rate" class="mr-10" style="width:200px"></el-input>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <initEcharts id="realTimeTemp" :options="realTimeTempOption" :styles="styles" :innerWidth="0.95"
                    @dataZoom="handleDataZoom" ref="realTimeTemp" />
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <LittleContainer title="节点实时数据" class="mb-20" />
            </el-col>
            <el-col :span="24" class="buswayMap">
              <img :src="IMG_File + busWayInfo.filePath" alt="母线槽" class="w-100 buswayImg" draggable="false"
                ref="buswayImg">
              <!-- <span v-for="item of imgNodeList" :key="item.nodeId" class="nodeItem iconfont icon-dangqianweizhi"
                :style="{ fontSize: 35 + 'px', left: item.x + '%', top: item.y + '%', color: item.color }"
                :class="item.ishover ? 'z-1000' : ''" :data-name="item.nodeTemp ? item.nodeTemp : item.name"
                :data-warning="item.warningName" @click="handleClickNode(item)"
                @mouseenter="handleMouseenterNode(item)">
              </span> -->
              <img v-for="item of imgNodeList" :key="item.nodeId" class="nodeItem"
                :src="item.color === '#008000' ? greenIconurl : redIconurl" alt=""
                :style="{ fontSize: 35 + 'px', left: item.x + '%', top: item.y + '%' }" :class="item.ishover ? 'z-1000' : ''"
                :data-name="item.nodeTemp ? item.nodeTemp : item.name" :data-warning="item.warningName"
                @click="handleClickNode(item)" @mouseenter="handleMouseenterNode(item)">
            </el-col>
          </el-row>

          <!-- 电房详情 -->
          <div class="mb-20" v-if="false">
            <LittleContainer title="电房详情" class="mb-20" />
            <el-descriptions class="ml-20">
              <el-descriptions-item label="电房名称">
                <el-tag type="info">{{ busWayInfo.electricName ? busWayInfo.electricName : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="电房ID">
                <el-tag type="info">{{ busWayInfo.electricRoomId ? busWayInfo.electricRoomId : "暂无数据" }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 通道详情 -->
          <div class="mb-20" v-if="false">
            <LittleContainer title="通道详情" class="mb-20" />
            <el-descriptions class="ml-20 ">
              <el-descriptions-item label="通道名称">
                <el-tag type="info">{{ busWayInfo.channelName ? busWayInfo.channelName : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="通道ID">
                <el-tag type="info">{{ busWayInfo.channelId ? busWayInfo.channelId : "暂无数据" }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 母线槽详情 -->
          <div class="mb-20" v-if="false">
            <LittleContainer title="母线槽详情" class="mb-20" />
            <el-descriptions class="ml-20 ">
              <el-descriptions-item label="母线槽名称">
                <el-tag type="info">{{ busWayInfo.name ? busWayInfo.name : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="母线槽ID">
                <el-tag type="info">{{ busWayInfo.id ? busWayInfo.id : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始距离">
                <el-tag type="info">{{ busWayInfo.startDis ? busWayInfo.startDis : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="结束距离">
                <el-tag type="info">{{ busWayInfo.endDis ? busWayInfo.endDis : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="节点起始位置">
                <el-tag type="info">{{ busWayInfo.nodeStartDis ? busWayInfo.nodeStartDis : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="节点间距">
                <el-tag type="info">{{ busWayInfo.nodeSpacing ? busWayInfo.nodeSpacing : "暂无数据" }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="节点温度预警值">
                <el-tag type="info">{{ busWayInfo.temperatureWarning ? busWayInfo.temperatureWarning + '℃' :
    "暂无数据"
}}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="节点温度差预警值">
                <el-tag type="info">{{ busWayInfo.differenceWarning ? busWayInfo.differenceWarning + '℃' :
    "暂无数据"
}}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="节点升温速率预警值">
                <el-tag type="info">{{ busWayInfo.warmingRateWarning ? busWayInfo.warmingRateWarning + '℃' :
    "暂无数据"
}}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 节点详情 -->
          <div class="mb-20">
            <LittleContainer title="节点详情" class="mb-20" />
            <ele-table :isborder="true" :tableData="nodeList" :renderTable="renderNodeTable" :btnList="btnList"
              @handleBtnEvent="handleBtnEvent"></ele-table>
            <ele-pagination :total="nodeTotal" @handleSizeChange="handleSizeChangeNode"
              @handleCurrentChange="handleCurrentChangeNode" style="width:95%;margin:0 auto" />
            <!-- 节点历史温度模态框 -->
            <el-dialog title="历史温度" v-model="dialogVisible" width="90%" top="3vh">
              <el-row style="width:100%">
                <el-col class="echarts">
                  <div class="mb-10" style="text-align:right">
                    <el-date-picker v-model="dateList" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                      end-placeholder="结束日期" class="mr-10" @change="handleChangeDate" :disabledDate="disabledDate">
                    </el-date-picker>
                  </div>

                  <initEcharts id="nodeEcharts" :options="historyOptions" :styles="styles" ref="nodeEcharts" />
                </el-col>
              </el-row>
              <el-row style="width:100%">
                <el-col :span="24" class="mt-10">
                  <h4 class="mb-10">最近报警记录</h4>
                  <ele-table :tableData="warningTableData" :renderTable="warningRenderTable"
                    :isborder="true"></ele-table>
                </el-col>
              </el-row>
            </el-dialog>
          </div>
        </template>
      </big-container>

      <!-- 报警详情 -->
      <big-container title="报警详情" class="p-20" v-if="isWarning">
        <template #body>
          <!-- 报警时间段节点温度曲线 -->
          <div class="mb-20">
            <LittleContainer title="报警时间段节点温度曲线" class="mb-20" />
            <initEcharts id="warning" :options="warningOptions" :styles="styles" :innerWidth="0.95" ref="echarts" />
          </div>

          <!-- 电房详情 -->
          <div class="mb-20" v-if="false">
            <LittleContainer title="电房详情" class="mb-20" />
            <el-descriptions class="ml-20 ">
              <el-descriptions-item label="电房名称">
                <el-tag type="info">{{ warningInfo.electricRoomName ? warningInfo.electricRoomName : "暂无数据" }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 母线槽详情 -->
          <div class="mb-20" v-if="false">
            <LittleContainer title="母线槽详情" class="mb-20" />
            <el-descriptions class="ml-20 ">
              <el-descriptions-item label="母线槽名称">
                <el-tag type="info">{{ warningInfo.busWayName ? warningInfo.busWayName : "暂无数据" }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 报警详情 -->
          <div class="mb-20">
            <LittleContainer title="报警详情" class="mb-20" />
            <div>
              <!-- <h3 class="mb-10 ml-20">处理流程</h3>
              <ele-table
                :isborder="true"
                :tableData="processesTableData"
                :renderTable="renderProcessTable"
                style="width:95%;margin:0 auto 10px auto"
              ></ele-table> -->
              <h3 class="mb-10 ml-20">{{ warningInfo.warningTypeName ? `报警详情-${warningInfo.warningTypeName}` : '报警详情' }}
              </h3>
              <ele-table :isborder="true" :tableData="detailsTableData" :renderTable="renderDetailsTable"
                style="width:95%;margin:0 auto 10px auto"></ele-table>
              <ele-pagination :total="detailsTotal" @handleSizeChange="handleSizeChangeDetails"
                @handleCurrentChange="handleCurrentChangeDetails" style="width:95%;margin:0 auto" />
            </div>
          </div>
        </template>
      </big-container>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  nextTick
} from "vue";
import { getAccident, getBusWay, getHistory } from "@/api/openApi";
import BigContainer from "../component/bigContainer.vue";
import LittleContainer from "../component/littleContainer.vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import InitEcharts from "@/components/initEcharts/index.vue";
import md5 from "js-md5";
import { IMG_File, RES_SUCCESS } from "@/api/common/common";
import { filterTime } from "@/utils/filtration";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    BigContainer,
    LittleContainer,
    EleTable,
    ElePagination,
    InitEcharts
  },
  setup(props) {
    const STORE = useStore();
    // 报警温度图表数据
    let echartsData: any = ref([]);
    // 实时温度图表数据
    let realTimeData: any = ref([]);
    // 图表实例
    let realTimeTemp: any = ref(null);
    // 历史温度
    let echartsTempData = ref<Array<any>>([]);
    // 最大温度
    let echartsMaxTempData = ref<Array<any>>([]);
    // 最小温度
    let echartsMinTempData = ref<Array<any>>([]);
    // 平均温度
    let echartsAvgTempData = ref<Array<any>>([]);
    const greenIconurl = require('@/assets/image/home/green.png')
    const redIconurl = require('@/assets/image/home/red.png')
    // 历史温度实例
    let nodeEcharts: any = ref(null);
    let DATA: any = reactive({
      params: {
        appid: "yinyun", //约定的appid
        time: 1635731201461, //时间戳字段
        sign: "", //签名字段
        data: {
          /* 业务数据*/
          alarm_id: 190,
          device_serial: 1
        }
      },
      secret: "b3c4c61e26a9c79a74f45449bfa3cd14",
      body: null,
      busWayInfo: {}, //母线槽详情
      renderNodeTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "节点名称",
          type: "text",
          prop: "name"
        },
        {
          label: "光纤距离",
          type: "text",
          prop: "fiberDistance"
        },
        {
          label: "操作",
          type: "handle",
          width: 150
        }
      ],
      btnList: [
        {
          text: "历史温度",
          type: "primary",
          size: "small",
          handleType: "history"
        }
      ],
      nodeData: [],
      nodeList: [], //节点详情
      imgNodeList: [], //图片节点详情
      nodeTotal: 0,
      warningInfo: {}, //报警详情
      processesTableData: [], //处理流程
      renderProcessTable: [
        {
          label: "报警状态",
          type: "tag",
          formatter: (row: any) => {
            let tag = {
              text: row.handleName,
              tagType: ""
            };
            switch (row.handle) {
              case 1:
                tag.tagType = "warning";
                break;
              case 2:
                tag.tagType = "danger";
                break;
              case 3:
                tag.tagType = "primary";
                break;
              case 4:
                tag.tagType = "primary";
                break;
              case 5:
                tag.tagType = "success";
                break;
              case 6:
                tag.tagType = "info";
                break;
              default:
                break;
            }
            return tag;
          }
        },
        {
          label: "时间",
          type: "moreText",
          formatter: (row: any) => {
            return filterTime(row.createTime, "/");
          }
        }
      ],
      warningDataTemp: [], //报警温度数据
      detailsTableData: [],
      renderDetailsTable: [
        {
          label: "节点名称",
          type: "text",
          formatter: (row: any) => {
            return row.nodeName;
          }
        },
        // {
        //   label: '报警距离(光纤m)',
        //   type: 'text',
        //   prop: 'distance',
        // },
        {
          label: "温度(℃)",
          type: "text",
          prop: "temp"
        }
        // {
        //   label: '时间',
        //   type: 'text',
        //   prop: 'createTime',
        //   formatter: (row: any) => {
        //     return filterTime(row.createTime, '/');
        //   },
        // },
      ],
      /** 历史温度 */
      dialogVisible: false,
      historyOptions: {
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
              return value % 1 === 0 ? value : value.toFixed(1);
            }
          }
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {},
            dataZoom: {
              yAxisIndex: "none"
            }
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
            if (params.length > 1) {
              for (var i = 0; i < params.length; i++) {
                params[i].value[1] % 1 === 0
                  ? (value = params[i].value[1])
                  : (value = params[i].value[1].toFixed(1));
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
      dateList: [
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          0,
          0,
          0
        ),
        new Date()
      ],
      nodeId: null,
      warningTableData: [],
      warningRenderTable: [
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
          formatter: (row: any) => {
            let tag = {
              text: row.warningTypeName,
              tagType: "",
              effect: ""
            };
            switch (row.type) {
              case 1:
                tag.tagType = "danger";
                tag.effect = "dark";
                break;
              case 2:
                tag.tagType = "danger";
                tag.effect = "light";
                break;
              case 3:
                tag.tagType = "warning";
                tag.effect = "light";
                break;
              default:
                break;
            }
            return tag;
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
      /**
       * 报警详情分页
       */
      detailsPaging: {
        limit: 10,
        page: 1
      },
      detailsTotal: 0,
      // 报警 echarts配置
      warningOptions: {
        animation: false,
        title: {
          text: "报警时间段节点温度曲线",
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
          type: "value",
          min: 0,
          max: 100,
          name: "报警温度(℃)",
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
            saveAsImage: {},
            dataZoom: {
              yAxisIndex: "none"
            }
          },
          right: "5%"
        },
        color: ["#bf444c"],
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: ["报警温度"],
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
            let colors = ["#bf444c"];
            let seriesNames = ["报警温度"];
            let value: number;
            if (params.length > 1) {
              for (var i = 0; i < params.length; i++) {
                params[i].value[1] % 1 === 0
                  ? (value = params[i].value[1])
                  : (value = params[i].value[1].toFixed(1));
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
            left: "5%", //滑动条位置
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
            name: "报警温度",
            data: echartsData.value,
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
          }
        ]
      },
      // 实时温度 echarts配置
      realTimeTempOption: {
        animation: false,
        title: {
          text: "实时温度折线图",
          left: "center"
        },
        xAxis: {
          name: "节点名称",
          type: "category",
          minorTick: {
            show: true
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
          axisLabel: {
            formatter: function (value: any) {
              return value % 1 === 0 ? value : value.toFixed(1);
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
          data: ["实时温度"],
          top: "4%"
        },
        grid: {
          left: "2%",
          right: "4%",
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
            let temp =
              params[0].value[1] % 1 === 0
                ? params[0].value[1]
                : params[0].value[1].toFixed(1);
            let distance =
              params[0].value[2] % 1 === 0
                ? params[0].value[2]
                : params[0].value[2].toFixed(1);
            var htmlStr = "";
            htmlStr += "<div>";
            //为了保证和原来的效果一样，这里自己实现了一个点的效果
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "节点名称" + `: ${params[0].value[0]}<br/>`;
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "温度" + `: ${temp}℃<br/>`;
            htmlStr +=
              '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
              params[0].color +
              ';"></span>';
            htmlStr += "光纤距离" + `: ${distance}m<br/>`;
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
            data: realTimeData.value,
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
            }
          }
        ]
      },
      styles: {
        width: "100%",
        marginTop: "10px"
      },
      /** 判断查看是否报警 */
      isWarning: null,
      /** 图表缩放比例 */
      startx: "",
      endx: "",
      starty: "",
      endy: "",
      isDataZoom: false,
      /** 倍率 */
      rate: 2,
      websocket: null
    });
    let METHODS = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
      },
      // 获取报警数据
      handleGetAlarmData: async () => {
        let { data } = await getAccident({
          alarmId: DATA.params.data.alarm_id
        });
        if (data.code === RES_SUCCESS) {
          DATA.warningInfo = data.data;
          DATA.processesTableData = data.data.warningProcesses || [];
          DATA.warningDataTemp = data.data.warningDataTemp || [];
          DATA.nodeTemps = data.data.nodeTemps || [];
          if (data.data.warningDataTemp === null) {
            DATA.warningOptions.yAxis.min = 0;
            DATA.warningOptions.yAxis.max = 100;
          } else if (data.data.warningDataTemp.length > 0) {
            // 平滑曲线 显示
            let { min, max } = METHODS.handleComputeTemp(
              JSON.parse(JSON.stringify(data.data.warningDataTemp)),
              DATA.rate
            );
            DATA.warningOptions.yAxis.min = min;
            DATA.warningOptions.yAxis.max = max;
          }
          DATA.detailsTableData = data.data.nodeTemps?.slice(
            DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
            DATA.detailsPaging.limit * DATA.detailsPaging.page
          );
          DATA.detailsTotal = data.data.nodeTemps?.length;
          data.data.warningDataTemp?.forEach((item: any) => {
            echartsData.value.push([
              filterTime(item.createTime, "/"),
              item.temp
            ]);
          });
        }
      },
      // 母线槽详情 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "history":
            DATA.nodeId = row.id;
            DATA.dialogVisible = true;
            DATA.dateList = [
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate(),
                0,
                0,
                0
              ),
              new Date()
            ];
            METHODS.handleGetHistoryData(
              row.id,
              filterTime(DATA.dateList[0], "/"),
              filterTime(DATA.dateList[1], "/")
            );
            break;

          default:
            break;
        }
      },
      // 获取历史温度
      handleGetHistoryData: async (
        nodeId: number,
        startTime?: string,
        endTime?: string
      ) => {
        echartsTempData.value = [];
        echartsMaxTempData.value = [];
        echartsMinTempData.value = [];
        echartsAvgTempData.value = [];
        nextTick(() => {
          nodeEcharts.value.chartfinished();
        });
        let { data } = await getHistory({ nodeId, startTime, endTime });
        if (data.code === RES_SUCCESS) {
          try {
            if (data.data != null) {
              // 生成表格数据
              DATA.warningTableData = data.data.nodeWarnings;
              if (
                data.data.nodeDates != null &&
                data.data.nodeDates.length !== 0
              ) {
                let { maxTemp, minTemp, avgTemp } = data.data.nodeDto;
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
                  DATA.historyOptions.yAxis.min = +(
                    (minTemp + maxTemp - (maxTemp - minTemp) * 2) /
                    2
                  ).toFixed(1);
                  DATA.historyOptions.yAxis.max = +(
                    (minTemp + maxTemp + (maxTemp - minTemp) * 2) /
                    2
                  ).toFixed(1);
                } else {
                  DATA.historyOptions.yAxis.min = +(
                    (minTemp + maxTemp) /
                    4
                  ).toFixed(1);
                  DATA.historyOptions.yAxis.max = +(minTemp + maxTemp).toFixed(
                    1
                  );
                }
                nodeEcharts.value.charthideloading();
              } else {
                nodeEcharts.value.charthideloading();
                ElMessage({
                  message: "该节点在该时间段内没有温度数据",
                  type: "warning"
                });
              }
              DATA.historyOptions.series[0].data = echartsTempData.value;
              DATA.historyOptions.series[1].data = echartsMaxTempData.value;
              DATA.historyOptions.series[2].data = echartsMinTempData.value;
              DATA.historyOptions.series[3].data = echartsAvgTempData.value;
              DATA.historyOptions.title.text = `${data.data.nodeDto.busWayName}-${data.data.nodeDto.nodeName}历史温度变化曲线`;
            } else {
              nodeEcharts.value.charthideloading();
              ElMessage({
                message: "该节点在该时间段内没有温度数据",
                type: "warning"
              });
            }
          } catch (error) { }
        }
      },
      // 切换时间
      handleChangeDate: () => {
        if (DATA.dateList !== null) {
          METHODS.handleGetHistoryData(
            DATA.nodeId,
            filterTime(DATA.dateList[0], "/"),
            filterTime(DATA.dateList[1], "/")
          );
        }
      },
      // 获取母线槽数据
      handleGetBusWayData: async () => {
        let { data } = await getBusWay({
          busWayId: DATA.params.data.device_serial
        });
        if (data.code === RES_SUCCESS) {
          DATA.busWayInfo = data.data;
          DATA.nodeData = data.data?.nodeList || [];
          if (data.data?.nodeList.length > 0) {
            data.data?.nodeList.forEach((item: any) => {
              item.color = "#008000";
            });
          }
          DATA.nodeList = JSON.parse(JSON.stringify(data.data?.nodeList)).slice(
            DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
            DATA.detailsPaging.limit * DATA.detailsPaging.page
          );
          DATA.imgNodeList = data.data.nodeList;
          DATA.nodeTotal = data.data.nodeList?.length;
        }
      },
      // 点击图片节点
      handleClickNode: (item: any) => {
        DATA.dialogVisible = true;
        DATA.nodeId = item.id;
        DATA.dateList = [
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            0,
            0,
            0
          ),
          new Date()
        ];
        METHODS.handleGetHistoryData(
          item.id,
          filterTime(DATA.dateList[0], "/"),
          filterTime(DATA.dateList[1], "/")
        );
      },
      handleMouseenterNode: (item: any) => {
        DATA.imgNodeList.forEach((val: any) => {
          if (val.id == item.id) {
            val.ishover = true;
          } else {
            val.ishover = false;
          }
        });
      },
      // 切换报警详情表格显示个数
      handleSizeChangeDetails: (val: number) => {
        DATA.detailsPaging.limit = val;
        DATA.detailsTableData = DATA.nodeTemps?.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
      },
      // 切换报警详情表格当前页
      handleCurrentChangeDetails: (val: number) => {
        DATA.detailsPaging.page = val;
        DATA.detailsTableData = DATA.nodeTemps?.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
      },
      // 切换节点详情表格显示个数
      handleSizeChangeNode: (val: number) => {
        DATA.detailsPaging.limit = val;
        DATA.nodeList = DATA.nodeData?.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
      },
      // 切换节点详情表格当前页
      handleCurrentChangeNode: (val: number) => {
        DATA.detailsPaging.page = val;
        DATA.nodeList = DATA.nodeData?.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
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
      // 计算 最大温度 最小温度 相对平均值
      handleComputeTemp: (data: Array<any>, rate: number) => {
        let max, min;
        let sortData = data.sort((a: any, b: any) => {
          return a["temp"] - b["temp"];
        });
        if (sortData[0].temp !== sortData[sortData.length - 1].temp) {
          min = +(
            (sortData[0].temp +
              sortData[sortData.length - 1].temp -
              (sortData[sortData.length - 1].temp - sortData[0].temp) * rate ||
              2) / 2
          ).toFixed(2);
          max = +(
            (sortData[0].temp +
              sortData[sortData.length - 1].temp +
              (sortData[sortData.length - 1].temp - sortData[0].temp) * rate ||
              2) / 2
          ).toFixed(2);
        } else {
          min = +(
            (sortData[0].temp + sortData[sortData.length - 1].temp) /
            4
          ).toFixed(2);
          max = +(
            sortData[0].temp + sortData[sortData.length - 1].temp
          ).toFixed(2);
        }
        return { min, max };
      }
    });
    // websocket
    let SOCKET = reactive({
      async initWebSocket() {
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        let socketapi = "ws://" + location.host + "/socket";
        // let socketapi = 'ws://8.129.91.146:9523/socket';
        DATA.websocket = new WebSocket(socketapi);
        if (!("WebSocket" in window)) {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
        }
        DATA.websocket.onerror = SOCKET.setErrorMessage;
        // 连接成功
        DATA.websocket.onopen = SOCKET.setOnopenMessage;
        // 收到消息的回调
        DATA.websocket.onmessage = SOCKET.setOnmessageMessage;
        // 连接关闭的回调
        DATA.websocket.onclose = SOCKET.setOncloseMessage;
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        // window.onbeforeunload = this.onbeforeunload
      },
      setOnopenMessage: () => { },
      setOnmessageMessage: (result: any) => {
        let resultData = JSON.parse(result.data);
        if (resultData.busWayId === DATA.params.data.device_serial) {
          // 节点数据
          resultData.nodeTemps.forEach((v: any) => {
            DATA.imgNodeList.forEach((h: any) => {
              if (v.nodeId === h.id) {
                h.nodeTemp = `${v.nodeName} - 实时温度:${v.temp?.toFixed(1)}℃`;
                if (v.typeName !== undefined) {
                  h.typeName = v.typeName;
                  h.color = "#ff0000";
                  h.warningName = `${v.nodeName}-${v.temp?.toFixed(1)}℃`;
                } else {
                  h.typeName = null;
                  h.color = "#008000";
                }
              }
            });
          });

          // if (DATA.isDataZoom) {
          //   DATA.realTimeTempOption.dataZoom[0].start = DATA.startx;
          //   DATA.realTimeTempOption.dataZoom[0].end = DATA.endx;
          //   DATA.realTimeTempOption.dataZoom[1].start = DATA.startx;
          //   DATA.realTimeTempOption.dataZoom[1].end = DATA.endx;
          //   DATA.realTimeTempOption.dataZoom[2].start = DATA.starty;
          //   DATA.realTimeTempOption.dataZoom[2].end = DATA.endy;
          //   DATA.realTimeTempOption.dataZoom[3].start = DATA.starty;
          //   DATA.realTimeTempOption.dataZoom[3].end = DATA.endy;
          // }
          // realTimeData.value = [];
          // resultData.nodeTemps.forEach((item: any) => {
          //   realTimeData.value.push([item.nodeName, item.temp, item.distance]);
          // });
          // 平滑曲线 显示
          // let { min, max } = METHODS.handleComputeTemp(
          //   resultData.nodeTemps,
          //   DATA.rate
          // );
          // DATA.realTimeTempOption.yAxis.min = min;
          // DATA.realTimeTempOption.yAxis.max = max;

          // nextTick(() => {
          //   realTimeTemp.value.chartfinished();
          //   DATA.realTimeTempOption.series[0].data = realTimeData.value;
          //   setTimeout(() => {
          //     realTimeTemp.value.charthideloading();
          //   }, 700);
          // });
        }
      },
      setErrorMessage: (err: any) => {
        console.log(err);
      },
      setOncloseMessage: () => { }
    });
    onUnmounted(() => {
      DATA.websocket && DATA.websocket.close();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ...toRefs(SOCKET),
      realTimeTemp,
      nodeEcharts,
      greenIconurl,
      redIconurl,
      IMG_File
    };
  },
  beforeRouteEnter(to, from, next) {
    // ...
    let body: any = to.query.body;
    // 排序data
    let handleSortData = (data: any) => {
      let key = Object.keys(data);
      let value = Object.values(data);
      let str = "";
      key.forEach((item, index) => {
        if (index < key.length - 1) {
          str += `${item}=${value[index]}&`;
        } else {
          str += `${item}=${value[index]}`;
        }
      });
      return str;
    };

    // 生成签名
    let handleSignature = (dataStr: string, time: number, secret: string) => {
      return md5(`${dataStr}${time}${secret}`);
    };
    let dataStr = encodeURI(handleSortData(JSON.parse(decodeURI(body)).data));
    // console.log(JSON.parse(decodeURI(body)).data);
    // console.log('dataStr: ', dataStr);
    let timer = JSON.parse(decodeURI(body)).time;
    let secret = "b3c4c61e26a9c79a74f45449bfa3cd14";
    let sign = handleSignature(dataStr, timer, secret);
    // console.log('sign: ', sign);
    if (sign === JSON.parse(decodeURI(body)).sign) {
      next((vm: any) => {
        vm.params = JSON.parse(decodeURI(body));
        if (vm.params.data.alarm_id) {
          vm.isWarning = true;
          vm.handleGetAlarmData();
        } else {
          vm.isWarning = false;
          vm.handleGetBusWayData();
          vm.initWebSocket();
        }
      });
    } else {
      next({ name: "error" });
    }
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

.buswayMap {
  position: relative;

  .buswayImg {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
  }

  .nodeItem {
    @include node;
  }

  .z-1000 {
    z-index: 1000;
  }
}
</style>