<template>
  <el-container class="container_item">
    <el-header class="header">
      <el-row type="flex" justify="space-between" style="width:100%">
        <el-col :span="12" :xs="24" class="d_flex head_left">
          <img src="@/assets/busbar_log.png" width="100" alt="电力母线智能测控预警系统" title="电力母线智能测控预警系统">
          <h4 class="header_title">电力母线智能测控预警系统</h4>
        </el-col>
        <el-col :span="12" :xs="24" class="d_flex d_flex_end">
          <!-- 报警铃声 -->
          <div class="el-dropdown-link" :class="action ? 'textColor' : ''" style="display: flex;align-items:center;">
            <!-- 弹框倒计时 -->
            <span title="弹框倒计时" v-if="isShowCountDown" class="count_down">
              <span style="color:#990000">报警弹框免打扰时间 {{ popoutCountDown }}</span>
            </span>
            <img width="40" height="40" style="font-size:24px;margin-right:10px;"
              :src="isWaringStatus ? require('@/assets/image/home/warning.svg') : require('@/assets/image/home/noWarning.svg')"
              :class="isWaringStatus ? 'flickers' : ''" :title="isWaringStatus ? '报警中' : '未报警'"
              :style="{ filter: isWaringStatus ? 'drop-shadow(0px 0px 6px #f56c6c)' : 'drop-shadow(0px 0px 6px #66b1ff)' }">
            <i style="font-size:20px;margin-right:10px;cursor: pointer;color:#1a1f33"
              :class="isMute ? 'el-icon-close-notification' : 'el-icon-message-solid'" :title="isMute ? '关闭警音' : '开启警音'"
              @click="handleEnable"></i>
            <p class="userName">
              <el-dropdown @visible-change="dropdownChange">
                <!-- <i
                  style="color:#000;cursor: pointer;font-size:20px"
                  class="el-icon-arrow-down el-icon--right"
                > </i> -->
                <img src="@/assets/svg/用户2.svg" style="width:24px;margin-right:7px">
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item icon="el-icon-edit" v-show="!STORE.state.data.BindingState">
                      <span style="display:inline-block;" @click="TheSecondBinding">
                        二次验证
                      </span>
                    </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-edit" v-show="STORE.state.data.BindingState">
                      <span style="display:inline-block;" @click="unbind">取消二次绑定</span>
                    </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-edit-outline" @click="handleUpdatePwd">
                      修改密码
                    </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-tickets" @click="goHelp">
                      帮助
                    </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-s-opportunity" @click="handleRegard">
                      关于
                    </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-switch-button" @click="handleLogout">
                      安全退出
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <span title="当前用户">{{ STORE.getters.name }}({{ STORE.getters.username }})</span>
            </p>
          </div>
          <!-- <el-badge
              :value="currentNotifyList.length"
              class="item"
              type="danger"
              v-if="currentNotifyList.length!==0"
            >
              <i
                class="iconfont icon-tongzhi"
                style="margin-left:5px;font-size:24px"
                @click="handleNotify"
              ></i>
            </el-badge>
            <i
              class="iconfont icon-tongzhi item"
              style="margin-left:5px;font-size:24px"
              @click="handleNotify"
              v-else
            ></i> -->
        </el-col>
      </el-row>
    </el-header>
    <el-container class="container_main">
      <el-aside>
        <eleMenu :isCollapse="isCollapse" :routers="routers" />
        <div class="collapse">
          <i v-show="!isCollapse" class="el-icon-arrow-left icon" @click="isCollapse = !isCollapse"></i>
          <i v-show="isCollapse" class="el-icon-arrow-right icon" @click="isCollapse = !isCollapse"></i>
        </div>
      </el-aside>
      <el-main :style="{ padding: routePath === '/main' ? 0 : '20px' }">
        <!-- 嵌套页面 -->
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      <!-- 消息通知 -->
      <el-drawer v-model="drawer" direction="rtl" size="15%" :with-header="false" custom-class="customDrawer">
        <template v-if="STORE.state.data.notifyList.length > 0">
          <template v-for="item of STORE.state.data.notifyList" :key="item.id">
            <el-card class="shortNote" @click="handleClickNotify()"
              v-if="item.updateUserId === STORE.state.user.userId">
              <h4>
                <span>您在</span>
                <span style="color:#ff0000">{{ filterTime(item.updateTime) }}</span>
                <span>编辑的报警短信模板审核不通过，请查看详情</span>
              </h4>
            </el-card>
          </template>
        </template>
      </el-drawer>
      <audio :src="require('../../assets/audio/tempWarning.mp3')" loop ref="tempWarningAudio"></audio>
    </el-container>
  </el-container>
  <!-- 修改密码 -->
  <el-dialog title="修改密码" v-model="dialogFormVisible">
    <ele-form :ruleForm="updatePwdForm" :renderFormArr="renderFormArr" :refForm="'updatePwdForm'" :labelWidth="120"
      :formData="updatePwdForm" :rules="updatePwdRules" ref="updatePwdForms"></ele-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmUpdatePwd">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 二次绑定 -->
  <el-dialog v-model="TheSecondBindingDialogVisible" @close="closeTheSecondBindingDialog">
    <el-steps :active="active + 1" finish-status="success">
      <el-step title="步骤 1" description="扫描二维码获取动态密码"></el-step>
      <el-step title="步骤 2" description="请输入动态密码"></el-step>
    </el-steps>
    <div class="TheSecondBindingBox">
      <div id="qrcode" v-show="active == 0" ref="qrCodeUrl"></div>
      <div v-show="active == 0">
        <p>请使用以下工具扫描二维码</p>
        <p>Google身份验证器</p>
        <p>Authy</p>
        <p>FreeOTP</p>
        <p>二次验证小程序</p>
        <p>其他基于TOTP算法的APP</p>
        <p>然后输入手机上显示的6位动态验证码</p>
      </div>
    </div>
    <div v-show="active == 1">
      <el-input placeholder="请输入动态密码" v-model="dynamicPassword"></el-input>
    </div>
    <div style="text-align: right">
      <el-button style="margin-top: 12px;" @click="next(-1)" v-show="active != 0">上一步</el-button>
      <el-button style="margin-top: 12px;" @click="next(1)" v-show="active != 1">下一步</el-button>
      <el-button style="margin-top: 12px;" @click="next(1)" v-show="active == 1" type="primary">提交</el-button>
    </div>
  </el-dialog>
  <!-- 解除绑定 -->
  <el-dialog v-model="unboundDialogVisible">
    <div class="TheSecondBindingBox">
      <div>
        <h4 class="mb-10">关闭二次验证后将无法保护你的账号安全！</h4>
      </div>
      <el-input placeholder="请输入动态密码" v-model="unboundDynamicPassword" v-focus></el-input>
    </div>
    <div style="text-align:right">
      <el-button style="margin-top: 12px;" @click="unboundDialogVisible = false">取消</el-button>
      <el-button style="margin-top: 12px;" @click="confirmUnbound" type="primary">确定</el-button>
    </div>
  </el-dialog>

  <!-- 报警弹框 -->
  <el-dialog v-model="warningDialogVisible" width="90%" :close-on-click-modal="false" top="7vh"
    :before-close="handleCloseWaringDialog">
    <template #title>
      <span class="d_flex">
        <i style="color:#f56c6c;margin-right:5px;font-size:24px" class="el-icon-warning"></i>
        <span style="margin-right:5px">报警提醒</span>
      </span>
    </template>
    <div class="d_flex d_flex_c flex_warp">
      <div v-for="(item, index) of warningList" :key="item.sectionBusWayId" style="padding-bottom:10px"
        :style="[index % 2 !== 0 ? 'paddingRight: 0' : 'paddingRight: 10px', warningList.length === 1 ? 'width:90%' : 'width:49%']">
        <el-card @mousemove="handleMousemoveImg" class="warmingCard">
          <h4 style="margin-bottom:10px">{{ item.sectionBusWayName }}</h4>
          <div class="warning_box">
            <img class="warningSctionImg" :src="IMG_File + item.filePath">
            <el-tooltip placement="top" v-for="val of item.nodeList" :key="val.id" :visible-arrow="false">
              <template #content>
                <p style="margin-bottom:5px">节点名称:{{ val.nodeName }}</p>
                <p style="margin-bottom:5px">最新温度:{{ val.realtimeTemp ? val.realtimeTemp : "暂无数据" }}</p>
                <p>最新采集时间:{{ val.realtimeTemp ?val.acquisitionTime?val.acquisitionTime:"暂无数据": "暂无数据" }}</p>
              </template>
              <!-- <span
                class="sectionItem iconfont icon-dangqianweizhi"
                :style="{fontSize:'35px', left:val.x+'%',top:val.y+'%',color:val.color }"
                :data-warning="val.warningName"
                @click="handleClickSectionNode(val,item)"
              >
              </span> -->
              <img class="sectionItem" v-if="item.color === '#008000'" src="@/assets/image/home/green.png" alt=""
                :style="{ fontSize: '35px', left: val.x + '%', top: val.y + '%', color: val.color }"
                :data-warning="val.warningName" @click="handleClickSectionNode(val, item)">
              <img class="sectionItem" v-else src="@/assets/image/home/red.png" alt=""
                :style="{ fontSize: '35px', left: val.x + '%', top: val.y + '%', color: val.color }"
                :data-warning="val.warningName" @click="handleClickSectionNode(val, item)">
            </el-tooltip>
          </div>
        </el-card>
      </div>
    </div>
    <!-- 查看报警详情 -->
    <div class="warningInfo">
      <span @click="GoWarning">查看报警详情 >></span>
    </div>
  </el-dialog>

  <!-- 设置报警提示间隔 -->
  <el-dialog v-model="quietHoursDialogVisible" width="30%" top="7vh" custom-class="quietHour">
    <template #title>
      <span><i style="color:#e6a23c;margin-right:5px" class="el-icon-warning"></i>报警提示设置</span>
    </template>
    <p style="margin-bottom:8px">不再提示此报警弹窗?</p>
    <p style="margin-bottom:8px">可以设置免打扰时间(分钟):</p>
    <el-input-number v-model="quietHours" controls-position="right" />
    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="handleCencelQuietHours">取 消</el-button>
        <el-button type="primary" @click="handleQuietHoursConfirm" size="small">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 节点温度模态框 -->
  <el-dialog title="节点详情" v-model="dialogVisible" width="90%" top="7vh">
    <el-row style="width:100%">
      <el-col class="echarts">
        <!-- 节点名称 -->
        <h3>{{ nodeName }}</h3>
        <p class="mt-10 mb-10">最新24h温度变化曲线</p>
        <initEcharts id="warningNodeEcharts" :options="options" :styles="styles" ref="echarts"
          @dataZoom="handleDataZoom" />
        <DataLoading class="dataLoading" v-show="loading" />
      </el-col>
    </el-row>
    <el-row style="width:100%">
      <el-col :span="24" class="mt-10">
        <h4 class="mb-10">最近报警记录</h4>
        <ele-table :tableData="nodeWarnings" :renderTable="renderTable" :isborder="true"></ele-table>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  watch,
  toRefs,
  provide,
  ref
} from "vue";
import {
  bindingSecret,
  createSecretUri,
  refreshToken,
  removeSecret
} from "@/api/token/index";
// import dayjs from "dayjs";
import { useStore } from "vuex";
import eleMenu from "./eleMenu/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import { isUpdatePwd, updatePwd } from "@/api/system/sysUser/index";
import initEcharts from "@/components/initEcharts/index.vue";
import EleTable from "@/components/eleTable/index.vue";
import DataLoading from "@/components/dataLoading/index.vue";
import md5 from "js-md5";
import QRCode from "qrcodejs2";
import { useRoute, useRouter } from "vue-router";
import {
  IMG_File,
  localRead,
  localWrite,
  RES_SUCCESS
} from "@/api/common/common";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus/lib";
import { getEnableRole } from "@/api/system/sysRole";
import { findHostList } from "@/api/router/host";
import { findElectricRoom } from "@/api/maintenance/electricRoom";
import { filterTime } from "@/utils/filtration";
import { verifyPwd } from "@/api/common/verify";
import { handleGetUnitName } from "@/api/common/common";
import { getToken, setToken } from "@/utils/auth";
import { searchHistoryData } from "@/api/temp/historytemp";
import { findList } from "@/api/home";
import axios from "axios";

export default defineComponent({
  components: {
    eleMenu,
    EleForm,
    initEcharts,
    EleTable,
    DataLoading
  },
  setup() {
    // 获取当前实例对象
    const { proxy }: any = getCurrentInstance();
    let dayjs: any = proxy.dayjs
    // 获取store
    const STORE: any = useStore();
    // 获取路由实例
    const ROUTER: any = useRouter();
    const ROUTE: any = useRoute();
    let configInfo = ref<any>({});
    // 获取音频DOM实例
    const tempWarningAudio = ref();
    // 自定义验证规则
    var validatePass = (rule: any, value: any, callback: any) => {
      if (value.length < 8) {
        callback(new Error("密码长度至少8位"));
      } else {
        if (verifyPwd.test(value)) {
          callback();
        } else {
          callback(new Error("密码至少包含数字、字母、特殊字符两种"));
        }
      }
    };
    let validatePass2 = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== DATA.updatePwdForm.newPwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    // 响应基础数据
    let DATA: any = reactive({
      isCollapse: false,
      routers: [],
      action: false,
      activeName: "first",
      // 控制修改密码模态框显示隐藏
      dialogFormVisible: false,
      // 修改密码对象
      updatePwdForm: {
        newPwd: "",
        oldPwd: "",
        confirmPwd: ""
      },
      // 渲染表单配置
      renderFormArr: [
        {
          label: "旧密码",
          prop: "oldPwd",
          type: "input",
          placeholder: "请输入旧密码",
          inputType: "password"
        },
        {
          label: "新密码",
          prop: "newPwd",
          type: "input",
          placeholder: "请输入新密码",
          inputType: "password"
        },
        {
          label: "确认密码",
          prop: "confirmPwd",
          type: "input",
          placeholder: "再输入一次密码",
          inputType: "password"
        }
      ],
      // 表单验证
      updatePwdRules: {
        oldPwd: [
          { required: true, message: "旧密码不能为空", trigger: "blur" }
        ],
        newPwd: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { validator: validatePass, trigger: "change" }
        ],
        confirmPwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" }
        ]
      },
      // loading: false,
      TheSecondBindingDialogVisible: false,
      unboundDialogVisible: false,
      active: 0,
      dynamicPassword: "", //动态密码
      unboundDynamicPassword: "", //解除绑定动态密码
      secret: "",
      drawer: false,
      // websocket
      websocketNotify: null,
      // 通知列表
      notifyList: [],
      // 单位列表
      // unitList: [],
      // 当前用户通知列表
      currentNotifyList: [],
      validTime: null
    });
    // 方法
    let METHODS: any = reactive({
      dropdownChange: (res: boolean) => {
        DATA.action = res;
      },
      handleClick: (tab: any, event: any) => { },
      // 修改密码
      handleUpdatePwd: (): void => {
        DATA.dialogFormVisible = true;
        nextTick(() => {
          DATA.updatePwdForm = {
            newPwd: "",
            oldPwd: "",
            confirmPwd: ""
          };
          proxy.$refs["updatePwdForms"].clearForm();
        });
      },
      // 确认修改密码
      confirmUpdatePwd: () => {
        proxy.$refs["updatePwdForms"]
          .submitForm()
          .then((res: any) => {
            if (res) {
              DATA.updatePwdForm.oldPwd = md5(DATA.updatePwdForm.oldPwd);
              DATA.updatePwdForm.newPwd = md5(DATA.updatePwdForm.newPwd);
              updatePwd(
                DATA.updatePwdForm.newPwd,
                DATA.updatePwdForm.oldPwd
              ).then((res) => {
                if (res.data.code === RES_SUCCESS) {
                  ElMessage.success("修改成功");
                  DATA.dialogFormVisible = false;
                } else {
                  ElMessage.warning(res.data.msg);
                }
              });
            }
          })
          .catch((err: any) => { });
      },
      // 退出登录
      handleLogout: (): void => {
        proxy
          .$confirm("是否退出登录", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            STORE.dispatch("FedLogOut").then(() => {
              ROUTER.push({ path: "/login" });
              STORE.state.data.tokenTimer &&
                clearInterval(STORE.state.data.tokenTimer);
              STORE.commit("setTokenTimer", null);
            });
            proxy.$message({
              type: "success",
              message: "退出成功!"
            });
          })
          .catch((err: any) => { });
      },
      // 关闭二次绑定模态窗
      closeTheSecondBindingDialog() {
        DATA.active = 0;
        let ele: any = document.getElementById("qrcode");
        ele.innerHTML = "";
      },
      // 二次绑定
      TheSecondBinding() {
        DATA.dynamicPassword = "";
        DATA.TheSecondBindingDialogVisible = true;
        createSecretUri().then((res: any) => {
          // console.log(res);
          DATA.link = res.data.data;
          DATA.secret = res.data.data.split("=")[1];
          nextTick(() => {
            METHODS.qrcode();
          });
        });
      },
      // 取消绑定
      unbind() {
        DATA.unboundDynamicPassword = "";
        DATA.unboundDialogVisible = true;
      },
      next(n: any) {
        DATA.active += n;
        if (DATA.active >= 2) {
          if (DATA.dynamicPassword == "") {
            DATA.active = 1;
            proxy.$message({
              type: "info",
              message: "请输入动态密码"
            });
            return;
          }
          bindingSecret({
            code: DATA.dynamicPassword,
            secret: DATA.secret
          }).then((res: any) => {
            if (res.data.code == 200) {
              proxy.$message({
                type: "success",
                message: "绑定成功"
              });
              STORE.commit("setBindingState", res.data.data);
              DATA.TheSecondBindingDialogVisible = false;
            } else {
              DATA.active = 1;
              // proxy.$message.error(res.data.msg);
            }
          });
        }
      },
      confirmUnbound() {
        if (DATA.unboundDynamicPassword == "") {
          proxy.$message({
            type: "info",
            message: "请输入动态密码"
          });
          return;
        }
        removeSecret({ code: DATA.unboundDynamicPassword }).then((res: any) => {
          if (res.data.code == 200) {
            proxy.$message({
              type: "success",
              message: "解绑成功"
            });
            STORE.commit("setBindingState", res.data.data);
          }
          DATA.unboundDialogVisible = false;
        });
      },
      // 生成二维码
      qrcode() {
        let qrcode = new QRCode(proxy.$refs.qrCodeUrl, {
          width: 200,
          height: 200, // 高度
          text: DATA.link, // 二维码内容
          colorDark: "#000000",
          colorLight: "#ffffff"
          // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
          // background: '#f0f',   // 背景色
          // foreground: '#ff0'    // 前景色
        });
      },
      // 帮助页
      goHelp: () => {
        // ROUTER.push({ name: 'help' });
        // var a = document.createElement("a");
        // a.href = "/img/userManual.pdf";
        // a.target = "_blank";
        // a.click();
        let url = `models/help/帮助手册.pdf`;
        window.open(url, "_blank");
      },
      // 关于
      handleRegard: () => {
        ElNotification({
          title: "关于",
          dangerouslyUseHTMLString: true,
          message: `<strong>client <i>${configInfo.value.APP_VERSION}</i>  server <i>${configInfo.value.APP_SERVER_VERSION}</i></strong>`
        });
      },
      // 获取所有可用角色
      getAllEnableRole: async () => {
        let { data }: any = await getEnableRole();
        if (data.code === RES_SUCCESS) {
          STORE.commit("setRoleList", data.data);
        }
      },
      // 获取主机列表
      handleGetHostList: async () => {
        let { data } = await findHostList();
        if (data.code === RES_SUCCESS) {
          STORE.commit("setHostList", data.data);
        }
      },
      // 获取电房列表
      handleGetElectricRoom: async () => {
        let { data } = await findElectricRoom();
        if (data.code === RES_SUCCESS) {
          STORE.commit("setElectricRoomList", data.data);
        }
      },
      // 消息
      handleNotify: () => {
        DATA.drawer = true;
      },
      handleClickNotify: () => {
        ROUTER.push("/dream/dreamSend");
        DATA.drawer = false;
      },
      handleISUpdatePwd: async () => {
        let { data } = await isUpdatePwd(STORE.state.user.userId);
        if (data.code === RES_SUCCESS) {
          if (data.data)
            proxy.$notify({
              title: "提示",
              message: h(
                "i",
                { style: "color: #e5c07b" },
                "您已经六个月没有修改密码"
              ),
              duration: 10000,
              position: "bottom-right",
              type: "warning"
            });
        }
      },
      // 获取当前用户通知列表
      handleCurrentUserList: () => {
        if (STORE.state.data.notifyList.length > 0) {
          STORE.state.data.notifyList.forEach((item: any) => {
            if (item.updateUserId === STORE.state.user.userId) {
              DATA.currentNotifyList.push(item);
            }
          });
        }
      },
      // 播放音频
      playTempWarningAudio: () => {
        tempWarningAudio.value.paused && tempWarningAudio.value.play(); // 这个就是播放
      },
      pauseTempWarningAudio: () => {
        !tempWarningAudio.value.paused && tempWarningAudio.value.pause(); // 这个就是暂停
      }
    });
    /**************************  报警模块 ***********************************/
    let warningList: any = ref([]); //报警数据
    let echartsTempData: any = ref([]); //历史温度数据
    let echartsMaxTempData: any = ref([]); //最大温度数据
    let echartsMinTempData: any = ref([]); //最小温度数据
    let echartsAvgTempData: any = ref([]); //平均温度数据
    let startx: any, endx: any, starty: any, endy: any;
    let nodeWarnings = ref([]); //节点报警表格
    let warningDialogVisible = ref(false); //报警模态框
    let dialogVisible = ref(false); //节点折线图
    let loading = ref(false);
    let quietHoursDialogVisible = ref(false);
    let quietHours = ref(10);
    let interceptTime = ref<string | number>(""); //报警弹窗拦截有效时间
    let popoutCountDown = ref<string>(); //倒计时
    let isShowCountDown = ref(false); //控制显示倒计时
    let warningBuswayId = ref(null);
    let isMute = ref(false); //启用音频
    let isWaringStatus = ref(false); //判断是否报警
    let routePath = ref<string>(ROUTE.path);
    let nodeTempParmas: any = reactive({
      nodeId: "",
      startTime: "",
      endTime: ""
    });
    let options: any = reactive({
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
          let value;
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
    });
    let renderTable = ref([
      {
        label: "序号",
        type: "text",
        formatter: (row: any, column: any, cellValue: any, index: any) => {
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
    ]);
    let isZoom = ref(false);
    let styles = ref({
      width: "100%",
      marginTop: "10px"
    });
    let nodeName = ref("");
    let websocketNetty: any = ref(null);
    let socket: any = ref(null);
    // 全局（除首页）获取报警状态
    let getHomeData = async () => {
      // 判断是否报警
      let warningTypeList: Array<string> = [];
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
      triggerAlarm();
    };

    // 获取图表数据
    let handleGetEchartsData = async () => {
      echartsTempData.value = [];
      echartsMaxTempData.value = [];
      echartsMinTempData.value = [];
      echartsAvgTempData.value = [];
      nodeTempParmas.startTime = filterTime(
        new Date().getTime() - 24 * 60 * 60 * 1000,
        "/"
      );
      loading.value = true;
      nodeTempParmas.endTime = filterTime(new Date(), "/");
      let { data } = await searchHistoryData(nodeTempParmas);
      if (data.code === RES_SUCCESS) {
        try {
          if (data.data != null) {
            // 生成表格数据
            nodeWarnings.value = data.data.nodeWarnings;
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
                options.yAxis.min = +(
                  (minTemp + maxTemp - (maxTemp - minTemp) * 2) /
                  2
                ).toFixed(1);
                options.yAxis.max = +(
                  (minTemp + maxTemp + (maxTemp - minTemp) * 2) /
                  2
                ).toFixed(1);
              } else {
                options.yAxis.min = +((minTemp + maxTemp) / 4).toFixed(1);
                options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
              }
              options.series[0].data = echartsTempData.value;
              options.series[1].data = echartsMaxTempData.value;
              options.series[2].data = echartsMinTempData.value;
              options.series[3].data = echartsAvgTempData.value;
              // echarts.value.charthideloading();
              loading.value = false;
            } else {
              // echarts.value.charthideloading();
              loading.value = false;
              ElMessage({
                message: "该节点在24h内没有温度数据",
                type: "warning"
              });
            }
          } else {
            // echarts.value.charthideloading();
            loading.value = false;
            ElMessage({
              message: "该节点在24h内没有温度数据",
              type: "warning"
            });
          }
        } catch (error) {
          loading.value = false;
        }
      } else {
        loading.value = false;
      }
    };
    // 点击报警节点
    let handleClickSectionNode = (val: any, item: any) => {
      nodeTempParmas.nodeId = val.nodeId;
      nodeName.value = val.nodeName;
      warningBuswayId.value = item.busWayId;
      dialogVisible.value = true;
      startx = 0;
      endx = 100;
      starty = 0;
      endy = 100;
      options.dataZoom[0].start = startx;
      options.dataZoom[0].end = endx;
      options.dataZoom[1].start = startx;
      options.dataZoom[1].end = endx;
      options.dataZoom[2].start = starty;
      options.dataZoom[2].end = endy;
      options.dataZoom[3].start = starty;
      options.dataZoom[3].end = endy;
      // options.title.text = `${item.busWayName}-${item.nodeName}最新24h温度变化曲线`;
      nextTick(() => {
        handleGetEchartsData();
      });
      loading.value = false;
    };
    let handleDataZoom = (event: any) => {
      isZoom.value = true;
      if (event.batch != undefined) {
        if (event.batch.length === 1) {
          if (event.batch[0].dataZoomId.indexOf("1") === -1) {
            starty = event.batch[0].start;
            endy = event.batch[0].end;
          } else {
            startx = event.batch[0].start;
            endx = event.batch[0].end;
          }
        } else {
          startx = event.batch[0].start;
          endx = event.batch[0].end;
          starty = event.batch[1].start;
          endy = event.batch[1].end;
        }
      } else {
        if (event.dataZoomId.indexOf("2") === -1) {
          startx = event.start;
          endx = event.end;
        } else {
          starty = event.start;
          endy = event.end;
        }
      }
    };
    // 关闭报警框
    let handleCloseWaringDialog = () => {
      quietHoursDialogVisible.value = true;
      quietHours.value = 10;
    };
    // 确定设置报警间隔时间
    let handleQuietHoursConfirm = () => {
      warningDialogVisible.value = false;
      quietHoursDialogVisible.value = false;
      interceptTime.value = new Date().getTime() + quietHours.value * 60 * 1000;
      localWrite("warningInterceptTime", interceptTime.value);
      formatPopoutCountDown();
    };
    // 格式化 倒计时
    let formatPopoutCountDown = () => {
      if (
        !localRead("warningInterceptTime") ||
        localRead("warningInterceptTime") < new Date().getTime()
      ) {
        isShowCountDown.value = false;
        // warningDialogVisible.value = true;
        return;
      }
      let shi, fen, miao, differTime;
      isShowCountDown.value = true;
      differTime = localRead("warningInterceptTime") - new Date().getTime();
      shi = Math.floor(differTime / (60 * 1000 * 60));
      fen = Math.floor(differTime / (60 * 1000)) % 60;
      miao = Math.floor(differTime / 1000) % 60;
      setTimeout(() => {
        formatPopoutCountDown();
      }, 1000);
      popoutCountDown.value = `${shi < 10 ? "0" + shi : shi}:${fen < 10 ? "0" + fen : fen
        }:${miao < 10 ? "0" + miao : miao}`;
    };
    let handleCencelQuietHours = () => {
      warningDialogVisible.value = false;
      quietHoursDialogVisible.value = false;
    };
    // 跳转报警详情页
    let GoWarning = () => {
      ROUTER.push({ path: "/alarm/warning" });
      warningDialogVisible.value = false;
    };
    // 禁止拖拽图片
    let handleMousemoveImg = () => {
      let document: any = window.document;
      window.getSelection
        ? window.getSelection()?.removeAllRanges()
        : document.selection.empty();
    };
    // 触发报警
    let triggerAlarm = () => {
      if (
        (!localRead("warningInterceptTime") ||
          new Date().getTime() > +localRead("warningInterceptTime")) &&
        !warningDialogVisible.value &&
        ["/main", "/busway"].includes(routePath.value)
      ) {
        if (warningList.value.length > 0) {
          warningDialogVisible.value = true;
        }
      }
      if (!isMute.value && isWaringStatus.value) {
        METHODS.playTempWarningAudio();
      }
    };
    let handleEnable = () => {
      isMute.value = !isMute.value;
      if (!isMute.value) {
        if (isWaringStatus.value) {
          METHODS.playTempWarningAudio();
        }
      } else {
        METHODS.pauseTempWarningAudio();
      }
    };
    let setWarningList = (data: any, time: string | undefined = undefined) => {
      let warningLists = JSON.parse(JSON.stringify(data));
      // 时间排序
      warningLists.sort((a: any, b: any) => {
        return (
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        );
      });
      // 过滤报警点
      warningLists.forEach((item: any) => {
        let nodeList: Array<any> = [];
        nodeList = item.nodeList.filter((val: any) => {
          return typeof val.warningType === "string";
        });
        item.nodeList = nodeList;
      });
      // 保留 报警点数据
      warningLists.forEach((v: any) => {
        warningList.value.forEach((w: any) => {
          if (v.sectionBusWayId === w.sectionBusWayId) {
            w.nodeList.forEach((j: any) => {
              v.nodeList.forEach((k: any) => {
                if (j.nodeId === k.nodeId) {
                  k.nodeTemp = k.nodeTemp ?? j.nodeTemp;
                  k.realtimeTemp = k.nodeTemp
                    ? `${k.nodeTemp?.toFixed(1)}℃`
                    : null;

                  // 数据时间
                  k.acquisitionTime = time ?? j.acquisitionTime;

                  if (j.warningType) {
                    k.warningName = k.nodeTemp
                      ? `${k.nodeName} : ${k.nodeTemp?.toFixed(1)}℃`
                      : k.nodeName;
                  }
                }
              });
            });
          }
        });
      });
      // 保留温度数据
      warningList.value = warningLists;
      if (warningList.value.length === 0) {
        warningDialogVisible.value = false;
      }
    };
    // 修改报警状态
    let setWaringStatus = (status: boolean) => {
      if (!status) {
        warningList.value = [];
        METHODS.pauseTempWarningAudio();
      }
      isWaringStatus.value = status;
    };

    /***************************  scoket模块*****************/
    let updateEchartsData = (realTimeData: any) => {
      //实时修改折线图数据
      realTimeData.forEach((item: any) => {
        if (nodeTempParmas.nodeId === item.nodeId) {
          // 历史温度 数据 排序 0 当前时间 length-1 最早时间
          options.series[0].data.sort((a: any, b: any) => {
            return new Date(b[0]).getTime() - new Date(a[0]).getTime();
          });
          // 判断当前时间 与 最早的时间数据是否 大于24小时
          if (
            new Date(options.series[0].data[0][0]).getTime() -
            new Date(
              options.series[0].data[options.series[0].data.length - 1][0]
            ).getTime() >
            24 * 3600 * 1000
          ) {
            // 是 ？ 这在头部添加当前点数据  根据后端 排序
            options.series[0].data.unshift([
              filterTime(new Date()),
              item.temp,
              options.series[1].data[1][1],
              options.series[2].data[1][1],
              options.series[3].data[1][1]
            ]);
            // 同时清除 尾部数据
            options.series[0].data.pop();
            // 同步 最大温度 使折线图 对应历史数据曲线
            options.series[1].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            options.series[1].data[1][0] = filterTime(
              options.series[0].data[options.series[0].data.length - 1][0]
            );
            // 同步 最小温度 使折线图 对应历史数据曲线
            options.series[2].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            options.series[2].data[1][0] = filterTime(
              options.series[0].data[options.series[0].data.length - 1][0]
            );
            // 同步 平均温度 使折线图 对应历史数据曲线
            options.series[3].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            options.series[3].data[1][0] = filterTime(
              options.series[0].data[options.series[0].data.length - 1][0]
            );
            if (item.temp > options.series[1].data[0][1]) {
              //更新最大温度
              options.series[1].data[0][1] = item.temp;
              options.series[1].data[1][1] = item.temp;
            }
            if (item.temp < options.series[2].data[0][1]) {
              //更新最小温度
              options.series[2].data[0][1] = item.temp;
              options.series[2].data[1][1] = item.temp;
            }

            // 重新计算平均值
            let sumTemp = options.series[0].data.reduce(
              (prev: any, cur: any) => {
                return (prev += cur[1]);
              },
              0
            );
            let avgTemp = sumTemp / options.series[0].data.length;
            // 更新平均温度
            options.series[3].data[0][1] = avgTemp;
            options.series[3].data[1][1] = avgTemp;
          } else {
            options.series[0].data.unshift([
              filterTime(new Date()),
              item.temp,
              options.series[1].data[1][1],
              options.series[2].data[1][1],
              options.series[3].data[1][1]
            ]);
            options.series[1].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            options.series[2].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            options.series[3].data[0][0] = filterTime(
              options.series[0].data[0][0]
            );
            if (item.temp > options.series[1].data[0][1]) {
              //更新最大温度
              options.series[1].data[0][1] = item.temp;
              options.series[1].data[1][1] = item.temp;
            }
            if (item.temp < options.series[2].data[0][1]) {
              //更新最小温度
              options.series[2].data[0][1] = item.temp;
              options.series[2].data[1][1] = item.temp;
            }
            // 重新计算平均值
            let sumTemp = options.series[0].data.reduce(
              (prev: any, cur: any) => {
                return (prev += cur[1]);
              },
              0
            );
            let avgTemp = sumTemp / options.series[0].data.length;
            // 更新平均温度
            options.series[3].data[0][1] = avgTemp;
            options.series[3].data[1][1] = avgTemp;
          }
          let minTemp = +options.series[2].data[0][1].toFixed(1);
          let maxTemp = +options.series[1].data[0][1].toFixed(1);
          if (minTemp !== maxTemp) {
            options.yAxis.min = +(
              (minTemp + maxTemp - (maxTemp - minTemp) * 2) /
              2
            ).toFixed(1);
            options.yAxis.max = +(
              (minTemp + maxTemp + (maxTemp - minTemp) * 2) /
              2
            ).toFixed(1);
          } else {
            options.yAxis.min = +((minTemp + maxTemp) / 4).toFixed(1);
            options.yAxis.max = +(minTemp + maxTemp).toFixed(1);
          }
          // echarts.value.charthideloading();
          setTimeout(() => {
            loading.value = false;
          }, 500);
        }
      });
    };
    // websocket
    let SOCKET: any = reactive({
      // 短信失败通知
      async initWebSocket() {
        // let socketapi =
        //   'wss://' +
        //   location.host +
        //   '/socket/websocket/' +
        //   this.$store.state.user.userId;
        let socketapi =
          "ws://" + location.host + "/websocket/" + STORE.state.user.userId;
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        if ("WebSocket" in window) {
          DATA.websocketNotify = new WebSocket(socketapi);
        } else {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
        }
        DATA.websocketNotify.onerror = SOCKET.setErrorMessage;
        // 连接成功
        DATA.websocketNotify.onopen = SOCKET.setOnopenMessage;
        // 收到消息的回调
        DATA.websocketNotify.onmessage = SOCKET.setOnmessageMessage;
        // 连接关闭的回调
        DATA.websocketNotify.onclose = SOCKET.setOncloseMessage;
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        // window.onbeforeunload = this.onbeforeunload
      },
      setOnopenMessage: () => {
        // console.log('websocket连接');
      },
      setOnmessageMessage: (result: any) => {
        let resultData = JSON.parse(result.data);
        DATA.notifyList.push(resultData);
        STORE.commit("setNotifyList", DATA.notifyList);
      },
      setErrorMessage: (err: any) => {
        console.log(err);
      },
      setOncloseMessage: () => { },
      // 首页 scoket
      initSocket: () => {
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        if ("WebSocket" in window) {
          let socketapi =
            "ws://" +
            location.host +
            "/homeWebSocket/" +
            STORE.state.user.userId;
          socket.value = new WebSocket(socketapi);
          STORE.commit("setHomeSocket", socket.value);
        } else {
          ElMessage({
            message: "当前浏览器不支持WebSocket",
            type: "warning"
          });
          return;
        }
        // 收到消息回调
        socket.value.onmessage = SOCKET.scoketMessage;
        // 连接错误回调
        socket.value.onerror = SOCKET.setErrorMessage;
        // 连接成功
        socket.value.onopen = SOCKET.setOnopenMessage;
        // 连接关闭的回调
        socket.value.onclose = SOCKET.setOncloseMessage;
      },
      scoketMessage: (result: any) => {
        if (result.data.slice(0, 4) === "dash") {
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );
          // 判断是否报警
          let warningTypeList: Array<string> = [];
          warningList.value = [];
          let markings: any = JSON.parse(
            JSON.stringify(STORE.state.data.warkingList)
          );
          realTimeData.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
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

                    // 保存 之前温度数据
                    STORE.state.data.warkingList.forEach((h: any) => {
                      h.homePageNodeDtoList.forEach((j: any) => {
                        val.homePageNodeDtoList.forEach((v: any) => {
                          if (j.nodeId === v.nodeId) {
                            v.nodeTemp = v.nodeTemp ?? j.nodeTemp;
                          }
                        });
                      });
                    });
                    // 获取实时报警列表
                    if (val.typeName) {
                      // 实时显示报警节点温度
                      val.homePageNodeDtoList.forEach((v: any) => {
                        // 遍历报警 列表
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
                                require("../../assets/image/noFile.png"),
                              nodeList: val.homePageNodeDtoList,
                              createTime: val.createTime
                            });
                          }
                        }
                        // 实时 更改状态
                        warningList.value.forEach((k: any) => {
                          if (k.nodeList.length > 0) {
                            // 遍历报警节点
                            k.nodeList.forEach((j: any) => {
                              if (v.nodeId === j.nodeId) {
                                // 显示图片节点 实时温度
                                j.realtimeTemp = v.nodeTemp
                                  ? v.nodeTemp?.toFixed(1) + "℃"
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
                                  j.warningName = "";
                                }
                              }
                            });
                          }
                        });
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
        let socketapi =
          "ws://" +
          location.host +
          "/netty2WebSocket/" +
          STORE.state.user.userId;
        // let socketapi = `ws://192.168.0.43:7105/websocket/${STORE.state.user.userId}`;
        websocketNetty.value = new WebSocket(socketapi);
        STORE.commit("setRealtimeSocket", websocketNetty.value);
        // 收到消息的回调
        websocketNetty.value.onmessage = SOCKET.setOnmessageNettyMessage;
      },
      // 实时数据
      setOnmessageNettyMessage: (result: any) => {
        if (result.data.slice(0, 4) === "temp") {
          let realTimeData = JSON.parse(
            result.data.slice(4, result.data.length)
          );
          if (
            dialogVisible.value &&
            warningBuswayId.value === realTimeData.busWayId
          ) {
            loading.value = true;
            // 判断是否有补偿温度
            if (realTimeData.compensationNodes.length > 0) {
              updateEchartsData(realTimeData.compensationNodes);
            } else if (realTimeData.nodeTemps.length > 0) {
              updateEchartsData(realTimeData.nodeTemps);
            }
            if (isZoom.value) {
              isZoom.value = false;
              options.dataZoom[0].start = startx;
              options.dataZoom[0].end = endx;
              options.dataZoom[1].start = startx;
              options.dataZoom[1].end = endx;
              options.dataZoom[2].start = starty;
              options.dataZoom[2].end = endy;
              options.dataZoom[3].start = starty;
              options.dataZoom[3].end = endy;
            }
          }
        }
      }
    });
    // 监听token过期时间  执行刷新token
    watch(
      () => DATA.validTime,
      (newValue) => {
        if (new Date().getTime() < newValue) {
          let tokenTimer = setTimeout(async () => {
            let res = await refreshToken({
              jws: getToken()
            });
            if (res.data.code === RES_SUCCESS) {
              setToken(res.data.data.jws);
              localWrite("ExpirationTime", res.data.data.expirationTime);
              STORE.commit("SET_TOKEN", res.data.data.jws);
              DATA.validTime = localStorage.getItem("ExpirationTime");
            }
          }, newValue - new Date().getTime());
          STORE.commit("setTokenTimer", tokenTimer);
        } else {
          ROUTER.push("/login");
        }
      }
    );
    // 监听路由
    watch(
      () => ROUTE.path,
      (newValue) => {
        routePath.value = newValue;
      }
    );
    SOCKET.initSocket();
    SOCKET.initRealtimeSocket();
    provide("changeAlarmState", METHODS.changeAlarmState);
    provide("playTempWarningAudio", METHODS.playTempWarningAudio);
    provide("pauseTempWarningAudio", METHODS.pauseTempWarningAudio);
    provide("setWarningList", setWarningList);
    provide("triggerAlarm", triggerAlarm);
    provide("setWaringStatus", setWaringStatus);
    provide("setOnmessageNettyMessage", SOCKET.setOnmessageNettyMessage);

    onMounted(async () => {
      // await SOCKET.initWebSocket();
      // await METHODS.handleCurrentUserList();
      DATA.validTime = localRead("ExpirationTime");
      await METHODS.getAllEnableRole();
      await METHODS.handleGetHostList();
      await METHODS.handleGetElectricRoom();
      await METHODS.handleISUpdatePwd();
      configInfo.value = STORE.state.configInfo;
      handleGetUnitName();
      !["/main", "/busway"].includes(routePath.value) && getHomeData();
      formatPopoutCountDown();
      DATA.routers = STORE.state.user.routers;
      window.onresize = (e: any) => {
        e.target.innerWidth < 960
          ? (DATA.isCollapse = true)
          : (DATA.isCollapse = false);
      };
    });
    onUnmounted(() => {
      // DATA.websocketNotify && DATA.websocketNotify.close();
      socket.value && socket.value.close();
      websocketNetty.value && websocketNetty.value.close();
      socket.value = null;
      websocketNetty.value = null;
      STORE.commit("setRealtimeSocket", null);
      STORE.commit("setHomeSocket", null);
    });
    return {
      ...toRefs(METHODS),
      ...toRefs(DATA),
      ...toRefs(SOCKET),
      tempWarningAudio,
      filterTime,
      STORE,
      warningList,
      options,
      GoWarning,
      handleClickSectionNode,
      handleGetEchartsData,
      warningDialogVisible,
      nodeWarnings,
      dialogVisible,
      renderTable,
      styles,
      handleDataZoom,
      nodeName,
      handleCloseWaringDialog,
      handleQuietHoursConfirm,
      quietHoursDialogVisible,
      loading,
      quietHours,
      IMG_File,
      handleMousemoveImg,
      isMute,
      handleEnable,
      handleCencelQuietHours,
      routePath,
      isWaringStatus,
      popoutCountDown,
      isShowCountDown
    };
  }
});
</script>

<style scoped lang="scss">
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

.container_main {
  padding-top: 10px;
  overflow: auto;

  /* 定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 0;
  }
}

.el-header {
  background-color: #fff;
  color: #000;
  text-align: left;
  margin-bottom: 10px;
  box-shadow: 0 0 6px 0 rgba(180, 180, 180, 0.5);
}

.el-aside {
  width: auto !important;
  text-align: center;
  position: relative;
  box-shadow: 0 0 6px 0 rgba(180, 180, 180, 0.5);
  border-radius: 0 24px 0 0;
  opacity: 0.8;
}

.el-main {
  background-color: #fff;
  color: #333;
  position: relative;
  margin: 0 20px;
  box-shadow: 0 0 6px 0 rgba(180, 180, 180, 0.5);
  border-radius: 24px 24px 0 0;
}

.collapse {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  color: #adafa9;
  background-color: $themeColor;
  height: 50px;
  bottom: 0;
}

.icon {
  font-size: 24px;
  position: absolute;
  cursor: pointer;

  // top: 10px;
  // left: 10px;
}

body>.el-container {
  margin-bottom: 40px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header_title {
    font-size: 20px;
    letter-spacing: 0.2em;
    color: #21253a;
    text-shadow: #324474 1px 1px 3px;
    font-weight: normal;
  }
}

.container_item {
  height: 100vh;
}

.el-menu-vertical-demo {
  border-right: none;
  color: #ffd04b;
  text-align: left !important;
  overflow: scroll;
  max-height: 100vh;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}

.el-menu-vertical-demo::-webkit-scrollbar {
  width: 0 !important;
}

/deep/ .el-menu-item-group__title {
  padding: 0;
}

/deep/ .el-tabs__nav-wrap .el-tabs__nav-scroll .el-tabs__nav {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.textColor {
  color: #409eff;
  border: none;
  outline: none;
}

.userName {
  color: #000;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.el-collapse {
  border: none;
}

/deep/ .el-collapse-item__header {
  border: none;
}

.collapse_title {
  width: 100%;
}

// 二次验证
.TheSecondBindingBox {
  #qrcode {
    margin-bottom: 20px;
    display: inline-block;

    img {
      width: 132px;
      height: 132px;
      background-color: #fff; //设置白色背景色
      padding: 6px; // 利用padding的特性，挤出白边
      box-sizing: border-box;
    }
  }

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

// 消息通知
.shortNote {
  width: 90%;
  margin: 10px auto;
  word-break: break-all;
  cursor: pointer;
  text-indent: 16px;
}

.item {
  cursor: pointer;
}

/deep/ .el-drawer:focus {
  outline: none !important;
}

/deep/ .el-drawer {
  // position: absolute !important;
  overflow: scroll !important;
}

/deep/ .el-drawer.rtl {
  height: 100%;
  bottom: 0;
  top: 0;
}

/deep/ .el-drawer::-webkit-scrollbar {
  width: 0;
}

// 报警
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
      cursor: pointer;
      @include marker;

      &:hover:after {
        display: inline-block;
        content: "";
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}

.count_down {
  margin-right: 10px;
  font-weight: bold;
}

.echarts {
  position: relative;

  .dataLoading {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}

// 闪烁 动画
.flickers {
  animation: flickers 2s infinite;
}

@keyframes flickers {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.warningInfo {
  text-align: right;
  cursor: pointer;

  &:hover {
    color: #56b6c2;
  }
}
</style>