<template>
  <el-row>
    <el-col
      :span="24"
      class="d_flex"
    >
      <!-- 头部搜索 -->
      <el-row
        type="flex"
        justify="end"
        style="width:100%;align-items: center;flex-wrap: nowrap;"
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
          placeholder="请选择母线槽"
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
          @change="handleChangeDate"
        >
        </el-date-picker>
        <el-select
          v-model="searchBuswayParams.id"
          clearable
          multiple
          :multiple-limit="5"
          collapse-tags
          placeholder="请选择时间"
          style="width:250px"
          @change="handleChangeTimes"
          value-key="id"
        >
          <el-option
            v-for="val in timeList"
            :key="val.id"
            :label="val.createTime"
            :value="val"
          >
          </el-option>
        </el-select>
        <!-- <el-button
          type="primary"
          @click="handleSearch"
        ><i class="el-icon-search"></i></el-button> -->
      </el-row>
    </el-col>
    <el-col
      :span="24"
      v-loading="loading"
    >
      <initEcharts
        :id="'echarts-busWay'"
        :options="options"
        :styles="styles"
        @dataZoom="handleDataZoom"
        ref="echarts"
      />
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from "vue";
import initEcharts from "@/components/initEcharts/index.vue";
import { filterTime } from "@/utils/filtration";
import {
  findDataByBusway,
  searchHistoryBuswayData
} from "@/api/temp/historytemp";
import { RES_SUCCESS } from "@/api/common/common";
import { ElMessage } from "element-plus";
import { findListBusbar } from "@/api/maintenance/busbar";
import { useStore } from "vuex";
import { verifyPlus } from "@/api/common/verify";

export default defineComponent({
  props: {
    tandemData: {
      type: Array,
      default: []
    }
  },
  components: {
    initEcharts
  },
  setup(props) {
    const STORE = useStore();
    // 图表数据
    let echartsTempData: any = ref([]);
    let echarts: any = ref(null);
    let oldTimeIds: any = ref([]); //旧 时间列表id
    let DATA: any = reactive({
      searchBuswayParams: {
        startTime: "",
        endTime: "",
        busWayId: "",
        electricRoomId: "",
        id: []
      },
      value: [],
      props: { expandTrigger: "hover" },
      cascaderOptions: [],
      rate: 2,
      dateList: [],
      defaultTime: "",
      // echarts配置
      loading: false,
      options: {
        animation: true,
        title: {
          text: "历史温度折线图",
          left: "center"
        },
        xAxis: {
          type: "category",
          name: "节点名称(光纤距离)",
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
          name: "温度(℃)",
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
        // color: ["#bf444c"],
        legend: {
          selectedMode: true, //取消图例上的点击事件
          data: ["历史温度"],
          top: "4.5%",
          icon: "roundRect",
          itemHeight: 3 // 粗细
        },
        grid: {
          left: "3%",
          right: "9%",
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
            // 多节点显示
            let data: object[] = [],
              nodeName = "",
              temp = "",
              distance = "";
            params.forEach((item: any) => {
              data.push({
                color: item.color,
                nodeName: item.value[0].slice(
                  0,
                  item.value[0].lastIndexOf("(")
                ),
                temp:
                  item.value[1] % 1 === 0
                    ? item.value[1] + "℃"
                    : +item.value[1].toFixed(1) + "℃",
                distance:
                  item.value[2] % 1 === 0
                    ? item.value[2] + "m"
                    : +item.value[2].toFixed(1) + "m"
              });
            });

            data.forEach((item: any, index: number) => {
              if (index !== data.length - 1) {
                nodeName += `<span style='color:${item.color}'>${item.nodeName},</span>`;
                temp += `<span style='color:${item.color}'>${item.temp},</span>`;
                distance += `<span style='color:${item.color}'>${item.distance},</span>`;
              } else {
                nodeName += `<span style='color:${item.color}'>${item.nodeName}</span>`;
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

            // 节点名称数据展示
            htmlStr += "节点名称" + `: ${nodeName}<br/>`;
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
            // data: echartsTempData.value,
            type: "line",
            symbol: "circle",
            symbolSize: 5
            // sampling: "lttb", //降采样策略
            // itemStyle: {
            //   color: "#bf444c",
            //   borderColor: "#bf444c" //拐点边框颜色
            // },
            // lineStyle: {
            //   color: "#bf444c" //改变折线颜色
            // }
          }
        ]
      },
      styles: {
        width: "100%",
        marginTop: "10px"
      },
      // 保存缩放位置
      startx: "",
      starty: "",
      endx: "",
      endy: "",
      // 母线槽
      filtrateBuswayList: [],
      // 电房
      electricRoomList: [],
      // 时间
      timeList: []
    });
    let METHODS: any = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
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
      handleSearch: async (timeId: number) => {
        // if (DATA.dateList == null || DATA.dateList.length === 0) {
        //   ElMessage({
        //     message: "请选择时间段",
        //     type: "warning"
        //   });
        //   return;
        // }
        // if (!DATA.searchBuswayParams.busWayId) {
        //   ElMessage({
        //     message: "请选择母线槽",
        //     type: "warning"
        //   });
        //   return;
        // }
        // if (!DATA.searchBuswayParams.id) {
        //   ElMessage({
        //     message: "请选择时间",
        //     type: "warning"
        //   });
        //   return;
        // }
        // if (!DATA.rate) {
        //   ElMessage({
        //     message: "请输入倍率",
        //     type: "warning"
        //   });
        //   return;
        // } else if (!verifyPlus.test(DATA.rate)) {
        //   ElMessage({
        //     message: "倍率数据格式为正数",
        //     type: "warning"
        //   });
        //   return;
        // }
        // echartsTempData.value = [];
        // echarts.value.chartfinished();
        let { data } = await findDataByBusway({ id: timeId });
        if (data.code === RES_SUCCESS) {
          return data.data;
          // if (data.data != null && data.data.length > 0) {
          //   data.data.forEach((item: any) => {
          //     echartsTempData.value.push([
          //       item.nodeName,
          //       item.temp,
          //       item.distance
          //     ]);
          //   });
          //   let sortData = data.data.sort((a: any, b: any) => {
          //     return a["temp"] - b["temp"];
          //   });
          //   DATA.options.yAxis.min = +(
          //     (sortData[0].temp +
          //       sortData[sortData.length - 1].temp -
          //       (sortData[sortData.length - 1].temp - sortData[0].temp) *
          //         DATA.rate) /
          //     2
          //   ).toFixed(1);
          //   DATA.options.yAxis.max = +(
          //     (sortData[0].temp +
          //       sortData[sortData.length - 1].temp +
          //       (sortData[sortData.length - 1].temp - sortData[0].temp) *
          //         DATA.rate) /
          //     2
          //   ).toFixed(1);
          // }
          // DATA.options.series[0].data = echartsTempData.value;
          // echarts.value.charthideloading();
        } else {
          return null;
        }
      },
      // 级联获取母线槽数据
      handlFindBusWayData: async (electricRoomId: number) => {
        let { data } = await findListBusbar({ electricRoomId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 获取时间列表
      handleGetTimeList: async () => {
        if (DATA.dateList != null && DATA.dateList.length > 0) {
          DATA.searchBuswayParams.startTime = filterTime(DATA.dateList[0], "/");
          DATA.searchBuswayParams.endTime = filterTime(DATA.dateList[1], "/");
        }
        if (DATA.dateList === null) {
          DATA.searchBuswayParams.startTime = null;
          DATA.searchBuswayParams.endTime = null;
        }
        let { startTime, endTime, busWayId } = DATA.searchBuswayParams;
        if (busWayId) {
          if (DATA.dateList != null && DATA.dateList.length > 0) {
            let { data } = await searchHistoryBuswayData({
              startTime,
              endTime,
              busWayId
            });
            if (data.code === RES_SUCCESS) {
              if (data.data.length > 0) {
                data.data.forEach((item: any) => {
                  item.createTime = filterTime(item.createTime, "/");
                });
              } else {
                ElMessage({
                  message: "此时间段内没有该条母线槽历史温度数据",
                  type: "warning"
                });
              }
              DATA.timeList = data.data;
            }
          }
          //  else {
          //   ElMessage({
          //     message: "请选择时间段",
          //     type: "warning"
          //   });
          // }
        }
      },
      handleChange: async (value: Array<number>) => {
        // 清空当前时间
        DATA.timeList = [];
        DATA.searchBuswayParams.id = [];
        // 初始画布
        DATA.options.series = [
          {
            name: "历史温度",
            type: "line",
            symbol: "circle",
            symbolSize: 5
          }
        ];
        // 清空画布数据
        echartsTempData.value = [];
        // 清空旧的时间
        oldTimeIds.value = [];
        if (value !== null) {
          DATA.searchBuswayParams.busWayId = value[1];
        } else {
          DATA.searchBuswayParams.busWayId = null;
        }
        await METHODS.handleGetTimeList();
      },
      handleChangeDate: async () => {
        DATA.timeList = [];
        oldTimeIds.value = [];
        DATA.searchBuswayParams.id = [];
        DATA.options.series = [
          {
            name: "历史温度",
            type: "line",
            symbol: "circle",
            symbolSize: 5
          }
        ];
        echartsTempData.value = [];
        await METHODS.handleGetTimeList();
      },
      handleChangeTimes: async () => {
        if (!DATA.rate) {
          ElMessage({
            message: "请输入倍率",
            type: "warning"
          });
          DATA.searchBuswayParams.id = [];
          return;
        } else if (!verifyPlus.test(DATA.rate)) {
          ElMessage({
            message: "倍率数据格式为正数",
            type: "warning"
          });
          DATA.searchBuswayParams.id = [];
          return;
        }
        let timeId: any = null;
        let tempData: Array<any> = [];
        let minTemps: Array<number> = [],
          maxTemps: Array<number> = [],
          minTemp: number,
          maxTemp: number;
        let colors = ["#bf444c", "#73c0de", "#fac858", "#91cc75", "#5470c6"];
        echarts.value.chartfinished();
        // 根据 列表长度 区别 是新增 还是取消 操作
        if (oldTimeIds.value.length > DATA.searchBuswayParams.id.length) {
          [{ id: timeId }] = oldTimeIds.value.filter((item: any) => {
            return !DATA.searchBuswayParams.id.some((val: any) => {
              return val.id === item.id;
            });
          });
          echartsTempData.value = echartsTempData.value.filter((item: any) => {
            return item.timeId !== timeId;
          });
        } else {
          let { id: timeId, createTime: time } =
            DATA.searchBuswayParams.id[DATA.searchBuswayParams.id.length - 1];
          let data = await METHODS.handleSearch(timeId);
          if (data === null || data.length === 0) {
            // 复制 旧的 时间列表 用于区别 当前点击id
            oldTimeIds.value = DATA.searchBuswayParams.id.slice(0);
            return;
          }
          data.forEach((item: any) => {
            tempData.push([
              `${item.nodeName}(${item.distance}m)`,
              item.temp,
              item.distance
            ]);
          });
          echartsTempData.value.push({
            timeId,
            time,
            tempData
          });
        }

        DATA.options.series = [];
        DATA.options.legend.data = [];
        JSON.parse(JSON.stringify(echartsTempData.value)).forEach(
          (item: any, index: number) => {
            let sortData = item.tempData.sort((a: any, b: any) => {
              return a[1] - b[1];
            });

            minTemps.push(sortData[0][1]);
            maxTemps.push(sortData[sortData.length - 1][1]);
          }
        );

        echartsTempData.value.forEach((item: any, index: number) => {
          DATA.options.legend.data[index] = `${item.time}-历史温度`;
          // 获取折线图数据
          DATA.options.series[index] = {
            name: `${item.time}-历史温度`,
            data: item.tempData,
            type: "line",
            symbol: "circle",
            symbolSize: 5,
            itemStyle: {
              color: colors[index],
              borderColor: colors[index] //拐点边框颜色
            },
            lineStyle: {
              color: colors[index] //改变折线颜色
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
          };
        });

        // 判断是否为空 设置默认值
        if (DATA.searchBuswayParams.id.length === 0) {
          DATA.options.series = [
            {
              name: "历史温度",
              type: "line",
              symbol: "circle",
              symbolSize: 5
            }
          ];
          // 清空画布数据
          echartsTempData.value = [];
          // 清空旧的时间
          oldTimeIds.value = [];
        }

        // 温度排序 获取最小最大温度
        minTemps.sort((a, b) => {
          return a - b;
        });
        maxTemps.sort((a, b) => {
          return a - b;
        });

        minTemp = minTemps[0];
        maxTemp = maxTemps[maxTemps.length - 1];

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
          DATA.options.yAxis.min = +(
            (minTemp + maxTemp - (maxTemp - minTemp) * DATA.rate || 2) / 4
          ).toFixed(1);
          DATA.options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
        }

        // 复制 旧的 时间列表 用于区别 当前点击id
        oldTimeIds.value = DATA.searchBuswayParams.id.slice(0);
        echarts.value.charthideloading();
      },
      // 过滤联级数据
      handleFilterData: (
        data: Array<any>,
        cascaderList: Array<any>,
        isBusway = false
      ) => {
        data.forEach((item) => {
          let cascaderObj;
          if (!isBusway) {
            cascaderObj = {
              value: item.id,
              label: item.name,
              children: []
            };
          } else {
            cascaderObj = {
              value: item.id,
              label: item.name
            };
          }

          if (item.busWayList != undefined && item.busWayList.length > 0) {
            METHODS.handleFilterData(
              item.busWayList,
              cascaderObj.children,
              true
            );
          }
          cascaderList.push(cascaderObj);
        });
        return cascaderList;
      }
    });
    // 设置默认时间 是当前月在右边显示
    DATA.defaultTime = new Date();
    DATA.defaultTime.setMonth(new Date().getMonth() - 1);
    watch(
      () => props.tandemData,
      () => {
        props.tandemData &&
          (DATA.cascaderOptions = METHODS.handleFilterData(
            props.tandemData,
            []
          ));
      }
    );
    onMounted(() => {
      DATA.electricRoomList = STORE.state.data.electricRoomList;
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
.el-select__tags {
  display: flex;
  flex-wrap: nowrap;
}
.el-select-dropdown__item {
  text-align: center;
}
</style>