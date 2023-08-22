<template>
  <div
    :id="id"
    :style="styles"
  ></div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  watch,
  onUnmounted,
  nextTick
} from "vue";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: ""
    },
    styles: {
      type: Object,
      default: {
        width: "100%",
        height: "100%"
      }
    },
    options: {
      type: Object,
      default: {}
    },
    innerWidth: {
      type: Number,
      default: 0.96
    },
    innerHeight: {
      type: Number,
      default: 0.8
    }
  },
  emits: ["dataZoom"],
  setup(props, { emit }: any) {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let myEcharts: any;
    let myResize: any;
    let DATA: any = reactive({
      timer: null
    });
    let METHODS: any = reactive({
      initEcharts: () => {
        let ele: any = document.getElementById(props.id);
        let main: any = document.querySelector(".el-main");
        //设置div容器高宽
        Object.defineProperty(ele, "clientWidth", {
          get: function () {
            return main.clientWidth * props.innerWidth;
          }
        });
        Object.defineProperty(ele, "clientHeight", {
          get: function () {
            return main.clientHeight * props.innerHeight;
          }
        });
        // 基于准备好的dom，初始化echarts实例
        nextTick(() => {
          myEcharts = proxy.echarts.init(ele);
          METHODS.drawEcharts(props.options);
        });
        myResize = (e: any) => {
          myEcharts && myEcharts.resize();
        };
        window.addEventListener("resize", myResize);
      },
      drawEcharts: (options: any) => {
        // 绘制图表
        myEcharts && myEcharts.setOption(options, true);
      },
      // 监听图表dataZoom事件
      watchDataZoom: () => {
        nextTick(() => {
          myEcharts &&
            myEcharts.on("dataZoom", function (event: any) {
              emit("dataZoom", event);
            });
        });
      },
      chartloading() {
        myEcharts &&
          myEcharts.showLoading({
            text: "数据正在加载...",
            textStyle: { fontSize: 30, color: "#444" },
            effectOption: { backgroundColor: "rgba(0, 0, 0, 0)" }
          });
      },
      charthideloading() {
        myEcharts && myEcharts.hideLoading();
      },
      // 绘画loading
      chartfinished(delay: number = 1000) {
        clearTimeout(DATA.timer);
        METHODS.chartloading();
        DATA.timer = setTimeout(() => {
          myEcharts.finished = METHODS.charthideloading();
        }, delay);
      },
      // 清除图表
      clearEcharts: () => {
        myEcharts && myEcharts.clear();
      }
    });
    watch(
      () => props.options,
      () => {
        METHODS.drawEcharts(props.options, true);
      },
      {
        deep: true
      }
    );
    onMounted(async () => {
      await METHODS.initEcharts();
      await METHODS.watchDataZoom();
    });
    onUnmounted(() => {
      myEcharts && myEcharts.dispose();
      window.removeEventListener("resize", myResize);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS)
    };
  }
});
</script>
<style lang="scss" scoped>
</style>