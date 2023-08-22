<template>
  <el-tabs
    stretch
    v-model="activeName"
    @tab-click="handleClick"
  >
    <el-tab-pane
      label="母线槽"
      name="busway"
    >
      <historyBusway
        :tandemData="tandemData"
        class="mt-10"
      />
    </el-tab-pane>
    <el-tab-pane
      label="节点"
      name="node"
    >
      <el-row>
        <el-col
          :span="24"
          class="d_flex mt-10"
        >
          <el-row
            type="flex"
            justify="end"
            style="width:100%;align-items: center;flex-wrap: nowrap;"
            class="mb-10"
          >
            <span
              class="mr-10"
              style="font-size:14px"
            >温度显示范围倍率</span>
            <el-input
              clearable
              placeholder="请输入倍率"
              v-model="rate"
              class="mr-10"
              style="width:200px"
            ></el-input>
            <el-cascader
              v-model="value"
              :options="cascaderOptions"
              :props="props"
              @change="handleChange"
              clearable
              class="mr-10"
            ></el-cascader>
            <el-date-picker
              v-model="dateList"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="mr-10"
              :default-value="defaultTime"
              :disabledDate="disabledDate"
            >
            </el-date-picker>
            <el-button
              type="primary"
              @click="handleSearch"
            ><i class="el-icon-search"></i></el-button>
          </el-row>
        </el-col>
        <el-col
          :span="24"
          v-loading="loading"
        >
          <initEcharts
            :id="'echarts'"
            :options="options"
            :styles="styles"
            @dataZoom="handleDataZoom"
            ref="nodeEcharts"
          />
        </el-col>
        <el-col :span="24">
          <el-row style="width:100%">
            <el-col class="d_flex d_flex_sb mt-10 mb-10">
              <h3>历史数据</h3>
              <el-button
                type="primary"
                @click="handleExcel"
                :loading="excelLoading"
              >Excel导出</el-button>
            </el-col>
          </el-row>
          <el-row style="width:100%">
            <el-col
              :span="24"
              class="mb-10"
            >
              <ele-table
                :tableData="historyTableData"
                :renderTable="historyRenderTable"
                :isborder="true"
              ></ele-table>
            </el-col>
            <el-col :span="24">
              <ele-table
                :tableData="gatherTableData"
                :renderTable="gatherRenderTable"
                :isborder="true"
              ></ele-table>
              <ele-pagination
                :total="total"
                @handleCurrentChange="handleCurrentChange"
                @handleSizeChange="handleSizeChange"
              ></ele-pagination>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template> 
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref
} from "vue";
import initEcharts from "@/components/initEcharts/index.vue";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import historyBusway from "@/components/historyBusway/index.vue";
import {
  exportNodeExcel,
  searchHistoryData,
  searchNode
} from "@/api/temp/historytemp";
import { RES_SUCCESS } from "@/api/common/common";
import { filterTime } from "@/utils/filtration";
import { ElMessage } from "element-plus";
import { verifyPlus } from "@/api/common/verify";
export default defineComponent({
  components: { initEcharts, EleTable, ElePagination, historyBusway },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 图表数据
    let echartsTempData: any,
      echartsMaxTempData: any,
      echartsMinTempData: any,
      echartsAvgTempData: any;
    echartsTempData = ref([]);
    echartsMaxTempData = ref([]);
    echartsMinTempData = ref([]);
    echartsAvgTempData = ref([]);
    let nodeEcharts: any = ref(null);
    let DATA: any = reactive({
      rate: 2,
      activeName: "busway",
      searchParams: {
        startTime: "",
        endTime: "",
        nodeId: ""
      },
      dateList: [],
      value: [],
      props: { expandTrigger: "hover" },
      cascaderOptions: [],
      tandemData: [],
      defaultTime: "",
      // echarts配置
      loading: false,
      options: {
        animation: false,
        title: {
          text: "历史温度折线图",
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
          right: "5%",
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
            // sampling: 'lttb', //降采样策略
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
      // 历史数据
      historyTableData: [],
      historyRenderTable: [
        {
          label: "节点名称",
          type: "text",
          prop: "nodeName"
        },
        {
          label: "分段母线槽",
          type: "text",
          prop: "sectionBusWayName"
        },
        {
          label: "母线槽",
          type: "text",
          prop: "busWayName"
        },
        {
          label: "电房",
          type: "text",
          prop: "electricRoomName"
        },
        // {
        //   label: '主机',
        //   type: 'text',
        //   prop: 'hostName',
        // },
        // {
        //   label: '通道',
        //   type: 'text',
        //   prop: 'channelName',
        // },
        {
          label: "时间段",
          type: "moreText",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "/")} - ${filterTime(
              row.endTime,
              "/"
            )}`;
          }
        },
        {
          label: "最大温度",
          type: "text",
          prop: "maxTemp"
        },
        {
          label: "最小温度",
          type: "text",
          prop: "minTemp"
        },
        {
          label: "平均温度",
          type: "text",
          prop: "avgTemp"
        },
        {
          label: "备注",
          type: "text",
          prop: "electricRoomRemark"
        }
      ],
      // 采集数据
      gatherTableData: [],
      gatherRenderTable: [
        {
          label: "采集时间",
          type: "text",
          prop: "collectionDate",
          formatter: (row: any) => {
            return filterTime(row.collectionDate, "/");
          }
        },
        {
          label: "采集温度(℃)",
          type: "text",
          prop: "collectionTemp",
          formatter: (row: any) => {
            return row.collectionTemp.toFixed(1);
          }
        }
      ],
      total: 0,
      pangingParams: {
        limit: 10,
        page: 1
      },
      // 保存缩放位置
      startx: "",
      starty: "",
      endx: "",
      endy: "",
      excelLoading: false,
      nodeList: [],
      busWayList: [],
      busWayId: null
    });
    let METHODS: any = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
      },
      // 获取 联级数据
      handleTandemData: async () => {
        let { data } = await searchNode();
        if (data.code === RES_SUCCESS) {
          DATA.tandemData = data.data;
          DATA.cascaderOptions = METHODS.handleFilterData(data.data, []);
        }
      },
      // 搜索历史温度
      handleSearch: async () => {
        if (DATA.dateList === null || DATA.dateList.length === 0) {
          ElMessage({
            message: "请选择时间段",
            type: "warning"
          });
          return;
        }
        if (!DATA.searchParams.nodeId) {
          ElMessage({
            message: "请选择节点",
            type: "warning"
          });
          return;
        }
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
        if (DATA.dateList != null && DATA.dateList.length > 0) {
          DATA.searchParams.startTime = filterTime(DATA.dateList[0], "/");
          DATA.searchParams.endTime = filterTime(DATA.dateList[1], "/");
        }
        if (DATA.dateList === null) {
          DATA.searchParams.startTime = null;
          DATA.searchParams.endTime = null;
        }
        DATA.historyTableData = [];
        echartsTempData.value = [];
        echartsMaxTempData.value = [];
        echartsMinTempData.value = [];
        echartsAvgTempData.value = [];
        try {
          // DATA.loading = true;
          nodeEcharts.value.chartfinished();
          var { data } = await searchHistoryData(DATA.searchParams);
          if (data.code === RES_SUCCESS) {
            // DATA.loading = false;
            if (
              data.data != null &&
              data.data.nodeDates != null &&
              data.data.nodeDates.length > 0
            ) {
              DATA.totalGatherTableData = data.data.nodeDates;
              DATA.total = data.data.nodeDates.length;
              DATA.gatherTableData = data.data.nodeDates.slice(
                (DATA.pangingParams.page - 1) * DATA.pangingParams.limit,
                DATA.pangingParams.page * DATA.pangingParams.limit
              );
              DATA.historyTableData.push(data.data.nodeDto);
              // 生成图表数据
              let { maxTemp, minTemp, avgTemp } = data.data.nodeDto;
              if (minTemp !== maxTemp) {
                DATA.options.yAxis.min = +(
                  (minTemp + maxTemp - (maxTemp - minTemp) * DATA.rate) /
                  2
                ).toFixed(1);
                DATA.options.yAxis.max = +(
                  (minTemp + maxTemp + (maxTemp - minTemp) * DATA.rate) /
                  2
                ).toFixed(1);
              } else {
                DATA.options.yAxis.min = +((minTemp + maxTemp) / 4).toFixed(1);
                DATA.options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
              }
              // 按照时间排序 0 结束时间  length-1 开始时间
              data.data.nodeDates.sort((a: any, b: any) => {
                return (
                  new Date(b.collectionDate).getTime() -
                  new Date(a.collectionDate).getTime()
                );
              });
              // 生成历史温度数据
              data.data.nodeDates.forEach((item: any) => {
                echartsTempData.value.push([
                  filterTime(item.collectionDate, "/"),
                  item.collectionTemp,
                  maxTemp,
                  minTemp,
                  avgTemp
                ]);
              });
              // 生成最大温度数据
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
              // 生成最小温度数据
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
              // 生成平均温度数据
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
            } else {
              ElMessage({
                message: "该节点在此时间段内没有历史温度数据",
                type: "warning"
              });
            }
          }
          nodeEcharts.value.charthideloading();
          DATA.options.series[0].data = echartsTempData.value;
          DATA.options.series[1].data = echartsMaxTempData.value;
          DATA.options.series[2].data = echartsMinTempData.value;
          DATA.options.series[3].data = echartsAvgTempData.value;
        } catch (error) {
          // DATA.loading = false;
          nodeEcharts.value.charthideloading();
        }
      },
      // 图表缩放
      handleDataZoom: (event: any) => {
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
      handleChange: (value: Array<number>) => {
        if (value !== null) {
          DATA.searchParams.nodeId = value[3];
          DATA.busWayId = value[1];
        } else {
          DATA.searchParams.nodeId = null;
          DATA.busWayId = null;
        }
      },
      // 切换分页当前页数
      handleCurrentChange: (val: number) => {
        DATA.pangingParams.page = val;
        DATA.gatherTableData = DATA.totalGatherTableData.slice(
          (val - 1) * DATA.pangingParams.limit,
          val * DATA.pangingParams.limit
        );
      },
      // 切换分页显示个数
      handleSizeChange: (val: number) => {
        DATA.pangingParams.limit = val;
        DATA.gatherTableData = DATA.totalGatherTableData.slice(
          (DATA.pangingParams.page - 1) * val,
          DATA.pangingParams.page * val
        );
      },
      // 过滤联级数据
      handleFilterData: (
        data: Array<any>,
        cascaderList: Array<any>,
        isBusway = false,
        issectionBusWay: false
      ) => {
        data.forEach((item) => {
          let cascaderObj;
          if (!isBusway) {
            cascaderObj = {
              value: item.id,
              label: item.name,
              children: []
            };
            DATA.busWayList.push({ name: item.name, id: item.id });
          } else if (issectionBusWay) {
            cascaderObj = {
              value: item.id,
              label: item.sectionName,
              children: []
            };
          } else {
            cascaderObj = {
              value: item.id,
              label: item.name
            };
            DATA.nodeList.push({ name: item.name, id: item.id });
          }

          if (item.busWayList != undefined && item.busWayList.length > 0) {
            METHODS.handleFilterData(item.busWayList, cascaderObj.children);
          }

          if (
            item.sectionBusWayList != undefined &&
            item.sectionBusWayList.length > 0
          ) {
            METHODS.handleFilterData(
              item.sectionBusWayList,
              cascaderObj.children,
              true,
              true
            );
          }
          if (item.nodeList != undefined && item.nodeList.length > 0) {
            METHODS.handleFilterData(item.nodeList, cascaderObj.children, true);
          }
          cascaderList.push(cascaderObj);
        });
        return cascaderList;
      },
      // 拼接节点名称
      handleSplicingNodename: (
        nodeList: Array<{ id: number; name: string }>,
        busWayList: Array<{ id: number; name: string }>
      ): string => {
        let node, busWay;
        nodeList.forEach((item) => {
          item.id === DATA.searchParams.nodeId && (node = item.name);
        });
        busWayList.forEach((item) => {
          item.id === DATA.busWayId && (busWay = item.name);
        });
        return `${busWay}-${node}`;
      },
      // 导出Excel
      handleExcel: async () => {
        if (!DATA.searchParams.nodeId) {
          ElMessage({
            message: "请选择节点",
            type: "warning"
          });
          return;
        }
        if (DATA.dateList === null || DATA.dateList.length === 0) {
          ElMessage({
            message: "请选择时间段",
            type: "warning"
          });
          return;
        }
        proxy
          .$confirm("你是否确认导出节点历史温度数据, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(async () => {
            if (DATA.dateList != null && DATA.dateList.length > 0) {
              DATA.searchParams.startTime = filterTime(DATA.dateList[0], "/");
              DATA.searchParams.endTime = filterTime(DATA.dateList[1], "/");
            }
            if (DATA.dateList === null) {
              DATA.searchParams.startTime = null;
              DATA.searchParams.endTime = null;
            }
            DATA.excelLoading = true;
            let res = await exportNodeExcel(DATA.searchParams);
            DATA.excelLoading = false;
            if (res.data.size === 0) {
              ElMessage({
                message: "该节点在此时间段内没有历史温度数据",
                type: "warning"
              });
              return;
            }
            // 2.获取请求返回的response对象中的blob 设置文件类型
            let blob = new Blob([res.data], {
              type: "application/vnd.ms-excel"
            });
            // 3.创建一个临时的url指向blob对象
            let url = window.URL.createObjectURL(blob);
            // 4.创建url之后可以模拟对此文件对象的一系列操作，例如：预览、下载
            let a = document.createElement("a");
            a.href = url;
            let fileName = METHODS.handleSplicingNodename(
              DATA.nodeList,
              DATA.busWayList
            );
            a.download = `${fileName}历史温度数据表_${filterTime(
              new Date(),
              "-",
              false
            )}`;
            // decodeURI(res.headers['content-disposition'].split('=')[1]);
            a.click();
            // 5.释放这个临时的对象url
            window.URL.revokeObjectURL(url);
          })
          .catch(() => {});
      },
      // 切换tabs
      handleClick: (tab: any, event: Event) => {
        // console.log(tab, event);
      }
    });
    METHODS.handleTandemData();
    // 设置默认时间 是当前月在右边显示
    DATA.defaultTime = new Date();
    DATA.defaultTime.setMonth(new Date().getMonth() - 1);
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      nodeEcharts
    };
  }
});
</script>
<style lang="scss" scoped>
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