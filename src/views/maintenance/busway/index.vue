<template>
  <el-row>
    <el-col :span="24">
      <el-row
        type="flex"
        justify="end"
      >
        <el-col
          :span="10"
          class="d_flex d_flex_end"
        >
          <el-select
            v-model="pagingParams.electricRoomId"
            clearable
            placeholder="请选择电房"
            style="margin-right:10px"
            filterable
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
            v-model="pagingParams.busWayId"
            clearable
            placeholder="请选择母线槽"
            style="margin-right:10px"
            filterable
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
          ><i class="el-icon-search"></i></el-button>
          <el-button
            type="primary"
            @click="handleCreate"
          ><i class="el-icon-plus"></i>添加</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col
          :span="24"
          v-loading="loading"
          style="margin-top:10px"
        >
          <ele-table
            :tableData="tableData"
            :renderTable="renderTable"
            :btnList="btnList"
            :isborder="true"
            @handleBtnEvent="handleBtnEvent"
          ></ele-table>
        </el-col>
        <el-col :span="24">
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleCurrentChange="handleCurrentChange"
            @handleSizeChange="handleSizeChange"
          />
        </el-col>
      </el-row>
      <!-- 添加、编辑 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogFormVisible"
        :close-on-click-modal="false"
        width="40%"
      >
        <ele-form
          :renderFormArr="renderFormArr"
          :formData="formData"
          :rules="formRules"
          :labelWidth="100"
          :refForm="'refForm'"
          ref="refForm"
          :options="options"
          class="dialogForm"
          @handleChange="handleChange"
          v-loading="dialogFormLoading"
        >
        </ele-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 母线槽删除模态框 -->
      <el-dialog
        v-model="deleteDialogVisible"
        title="删除警告"
        width="30%"
      >
        <div v-loading="deleteLoading">
          <div style="display:flex;align-items:center">
            <i
              class="el-icon-warning-outline"
              style="font-size:30px;color:#e6a23c;margin-right:20px"
            ></i>
            <div>
              <h4 style="font-size:16px">删除此母线槽将会删除以下数据</h4>
              <p style="font-size:16px">下属母线槽分段<i style="color:red;font-size:16px">{{daleteData.sectionBusWayCount || 0}}</i>条</p>
              <p style="font-size:16px">下属节点<i style="color:red;font-size:16px">{{daleteData.nodeCount}}</i>个</p>
              <p style="font-size:16px">报警记录<i style="color:red;font-size:16px">{{daleteData.warningCount}}</i>条</p>
              <p style="font-size:16px">报警数据<i style="color:red;font-size:16px">{{daleteData.warningDataCount}}</i>条</p>
              <p style="font-size:16px">及其他相关数据是否确认删除</p>
            </div>
          </div>
          <div style="text-align:right">
            <el-button @click="deleteDialogVisible=false">取消</el-button>
            <el-button
              type="primary"
              @click="handleDeleteConfirm"
            >确定</el-button>
          </div>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  nextTick,
  ref
} from "vue";
import {
  busWayDis,
  createBusbar,
  deleteBusbar,
  findBusWayData,
  findListBusbar,
  pagingByBusbar,
  updateBusbar,
  nuptialQuery
} from "@/api/maintenance/busbar";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import EleUpload from "@/components/eleUpload/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { RES_SUCCESS } from "@/api/common/common";
import { verifyFigure } from "@/api/common/verify";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { findChannelList } from "@/api/router/channel";
export default defineComponent({
  components: { EleTable, EleForm, EleUpload, ElePagination },
  setup() {
    interface Params {
      electricRoomId?: number;
      name?: string;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取vuex实例
    const STORE = useStore();
    let busWayName = ref(""); //母线槽名称  过滤编辑名称相同
    // 母线槽重名查询
    let verifyNuptialQuery = async (
      rule: any,
      value: string,
      callback: any
    ) => {
      if (!DATA.dislogType && value === busWayName.value) {
        callback();
      } else {
        let { data } = await nuptialQuery({ name: value });
        if (data.code === RES_SUCCESS) {
          callback();
        } else {
          callback(new Error("母线槽名称已占用"));
        }
      }
    };
    // 验证开始距离
    let verifyStartDis = async (rule: any, value: string, callback: any) => {
      if (verifyFigure.test(value)) {
        if (DATA.formData.endDis === "" || DATA.formData.endDis === null) {
          callback();
        } else {
          if (+value >= +DATA.formData.endDis) {
            callback(new Error("开始距离不能大于或等于结束距离"));
          } else {
            if (DATA.formData.channelId) {
              if (!DATA.dialogType) {
                let { channelId, startDis, endDis } = DATA.formData;
                if (
                  channelId == DATA.editQueryCoincide.channelId &&
                  startDis == DATA.editQueryCoincide.startDis &&
                  endDis == DATA.editQueryCoincide.endDis
                ) {
                  if (!DATA.isValidEndDis) {
                    DATA.isValidStartDis = true;
                    proxy.$refs["refForm"].validateField("endDis");
                  }
                  DATA.isValidEndDis = false;
                  callback();
                  return;
                }
              }
              let { data } = await busWayDis({
                id: DATA.formData.id ? DATA.formData.id : null,
                channelId: +DATA.formData.channelId,
                startDis: +value,
                endDis: +DATA.formData.endDis
              });
              if (data.code === 500) {
                callback(new Error(data.msg));
              } else {
                if (!DATA.isValidEndDis) {
                  proxy.$refs["refForm"].validateField("endDis");
                  DATA.isValidStartDis = true;
                }
                DATA.isValidEndDis = false;
                callback();
              }
            } else {
              callback();
            }
          }
        }
      } else {
        callback(new Error("数据格式填正整数或精确1个小数点"));
      }
    };
    let verifyEndDis = async (rule: any, value: string, callback: any) => {
      if (verifyFigure.test(value)) {
        if (DATA.formData.startDis === "" || DATA.formData.startDis === null) {
          callback();
        } else {
          if (+value <= +DATA.formData.startDis) {
            callback(new Error("结束距离不能小于或等于开始距离"));
          } else {
            if (DATA.formData.channelId) {
              if (!DATA.dialogType) {
                let { channelId, startDis, endDis } = DATA.formData;
                if (
                  channelId == DATA.editQueryCoincide.channelId &&
                  startDis == DATA.editQueryCoincide.startDis &&
                  endDis == DATA.editQueryCoincide.endDis
                ) {
                  if (!DATA.isValidStartDis) {
                    proxy.$refs.refForm.validateField("startDis");
                    DATA.isValidEndDis = true;
                  }
                  DATA.isValidStartDis = false;
                  callback();
                  return;
                }
              }
              let { data } = await busWayDis({
                id: DATA.formData.id ? DATA.formData.id : null,
                channelId: +DATA.formData.channelId,
                startDis: +DATA.formData.startDis,
                endDis: +value
              });
              if (data.code === 500) {
                callback(new Error(data.msg));
              } else {
                if (!DATA.isValidStartDis) {
                  DATA.isValidEndDis = true;
                  proxy.$refs.refForm.validateField("startDis");
                }
                DATA.isValidStartDis = false;
                callback();
              }
            } else {
              callback();
            }
          }
        }
      } else {
        callback(new Error("数据格式填正整数或精确1个小数点"));
      }
    };
    let DATA: any = reactive({
      pagingParams: {
        electricRoomId: "",
        busWayId: "",
        limit: 10,
        page: 1
      },
      pagingParamsCopy: {
        electricRoomId: "",
        busWayId: "",
        limit: 10,
        page: 1
      },
      electricRoomList: [],
      buswayList: [],
      /** 表格 */
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "母线槽名称",
          type: "text",
          prop: "name"
        },
        {
          label: "电房",
          type: "text",
          prop: "electricName"
        },
        {
          label: "通道",
          type: "text",
          prop: "channelName"
        },
        {
          label: "长度",
          type: "text",
          prop: "distance"
        },
        {
          label: "操作",
          type: "handle",
          width: 300
        }
      ],
      btnList: [
        {
          text: "编辑",
          type: "primary",
          handleType: "edit"
        },
        {
          text: "删除",
          type: "danger",
          handleType: "delete"
        }
      ],
      total: 0,
      loading: false,
      /** 添加、编辑表单 */
      dialogTitle: "",
      dialogFormVisible: false,
      dialogFormLoading: false,
      renderFormArr: [
        {
          label: "母线槽名称",
          prop: "name",
          type: "input"
        },
        {
          label: "电房",
          prop: "electricRoomId",
          type: "select",
          title: "name",
          value: "id",
          clearable: true,
          filterable: true
        },
        {
          label: "主机",
          prop: "hostId",
          type: "select",
          title: "name",
          value: "id",
          clearable: true,
          filterable: true
        },
        {
          label: "通道",
          prop: "channelId",
          type: "select",
          title: "name",
          value: "id",
          clearable: true,
          filterable: true
        },
        {
          label: "开始距离",
          prop: "startDis",
          type: "input"
        },
        {
          label: "结束距离",
          prop: "endDis",
          type: "input"
        }
      ],
      formData: {
        channelId: "",
        distance: "",
        electricRoomId: "",
        startDis: "",
        endDis: "",
        name: "",
        hostId: ""
      },
      formRules: {
        name: [
          { required: true, message: "请输入母线槽名称", trigger: "blur" },
          { validator: verifyNuptialQuery, trigger: "blur" }
        ],
        electricRoomId: [
          { required: true, message: "请选择电房", trigger: "change" }
        ],
        hostId: [{ required: true, message: "请选择主机", trigger: "change" }],
        channelId: [
          { required: true, message: "请选择通道", trigger: "change" }
        ],
        startDis: [
          { required: true, message: "请输入开始距离", trigger: "blur" },
          { validator: verifyStartDis, trigger: "blur" }
        ],
        endDis: [
          { required: true, message: "请输入结束距离", trigger: "blur" },
          { validator: verifyEndDis, trigger: "blur" }
        ]
      },
      dislogType: false,
      options: {},
      // 检测编辑距离重合
      editQueryCoincide: {},
      /**删除 */
      deleteDialogVisible: false,
      deleteLoading: false,
      daleteData: {},
      isValidStartDis: false,
      isValidEndDis: false
    });
    let METHODS: any = reactive({
      // 切换搜索电房
      handleChangeElectricRoom: async () => {
        DATA.pagingParams.busWayId = null;
        DATA.buswayList = [];
        DATA.pagingParams.electricRoomId &&
          (DATA.buswayList = await METHODS.handlFindBusWayData(
            DATA.pagingParams.electricRoomId
          ));
      },
      // 级联获取母线槽数据
      handlFindBusWayData: async (electricRoomId: number) => {
        let { data } = await findListBusbar({ electricRoomId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 分页获取母线槽数据
      handleGetPagingData: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await pagingByBusbar(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 切换分页显示个数
      handleSizeChange: (val: number) => {
        var aggregate = DATA.pagingParams.page * DATA.pagingParams.limit;
        if (aggregate > DATA.total) {
          aggregate = DATA.total;
        }
        DATA.pagingParamsCopy.limit = val;
        DATA.pagingParams.limit = val;
        var size = Math.ceil(aggregate / DATA.pagingParams.limit);
        if (size <= 0) {
          DATA.pagingParams.page = 1;
          DATA.pagingParamsCopy.page = 1;
        } else {
          DATA.pagingParams.page = size;
          DATA.pagingParamsCopy.page = size;
        }
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 切换分页当前页
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 添加
      handleCreate: () => {
        DATA.dialogTitle = "添加";
        DATA.dialogFormVisible = true;
        DATA.dialogType = true;
        DATA.formData = Object.assign(
          {},
          {
            channelId: "",
            distance: "",
            electricRoomId: "",
            startDis: "",
            endDis: "",
            name: ""
          }
        );
        DATA.renderFormArr = [
          {
            label: "母线槽名称",
            prop: "name",
            type: "input"
          },
          {
            label: "主机",
            prop: "hostId",
            type: "select",
            title: "name",
            value: "id",
            clearable: true,
            filterable: true
          },
          {
            label: "通道",
            prop: "channelId",
            type: "select",
            title: "name",
            value: "id",
            clearable: true,
            filterable: true
          },
          {
            label: "电房",
            prop: "electricRoomId",
            type: "select",
            title: "name",
            value: "id",
            clearable: true,
            filterable: true
          },
          {
            label: "开始距离",
            prop: "startDis",
            type: "input"
          },
          {
            label: "结束距离",
            prop: "endDis",
            type: "input"
          }
        ];
        DATA.options.channelId = [];
        nextTick(() => {
          proxy.$refs["refForm"].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.dialogTitle = "编辑";
            DATA.renderFormArr = [
              {
                label: "母线槽名称",
                prop: "name",
                type: "input"
              },
              {
                label: "主机",
                prop: "hostId",
                type: "select",
                title: "name",
                value: "id",
                clearable: true,
                filterable: true
              },
              {
                label: "通道",
                prop: "channelId",
                type: "select",
                title: "name",
                value: "id",
                clearable: true,
                filterable: true
              },
              {
                label: "电房",
                prop: "electricRoomId",
                type: "select",
                title: "name",
                value: "id",
                clearable: true,
                filterable: true
              },
              {
                label: "开始距离",
                prop: "startDis",
                type: "input"
              },
              {
                label: "结束距离",
                prop: "endDis",
                type: "input"
              }
            ];
            DATA.dialogFormVisible = true;
            DATA.dialogFormLoading = true;
            DATA.dialogType = false;
            let {
              id,
              channelId,
              distance,
              electricRoomId,
              startDis,
              endDis,
              name,
              hostId
            } = Object.assign({}, row);
            DATA.editQueryCoincide = Object.assign(
              {},
              { channelId, startDis, endDis }
            );
            busWayName.value = name;
            DATA.formData = {
              id,
              channelId,
              distance,
              electricRoomId,
              startDis,
              endDis,
              name,
              hostId
            };
            DATA.options.channelId = await METHODS.handleFindChannelData(
              row.hostId
            );
            nextTick(() => {
              proxy.$refs["refForm"].clearForm();
              DATA.dialogFormLoading = false;
            });
            break;
          case "delete":
            DATA.deleteDialogVisible = true;
            DATA.formData = Object.assign({}, row);
            DATA.deleteLoading = true;
            let { data } = await findBusWayData({ id: row.id });
            if (data.code === RES_SUCCESS) {
              DATA.deleteLoading = false;
              DATA.daleteData = data.data;
            }
            break;
          default:
            break;
        }
      },
      // 确认添加、编辑
      handleConfirm: async () => {
        proxy.$refs["refForm"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (DATA.dialogType) {
              let { data } = await createBusbar(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: `添加成功`,
                  type: "success"
                });
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                DATA.dialogFormVisible = false;
              }
            } else {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              let { data } = await updateBusbar(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: `编辑成功`,
                  type: "success"
                });
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                DATA.dialogFormVisible = false;
              }
            }
          }
        });
      },
      // 确认删除
      handleDeleteConfirm: async () => {
        let { data } = await deleteBusbar({ id: DATA.formData.id });
        if (data.code === RES_SUCCESS) {
          proxy.$message({
            type: "success",
            message: "删除成功!"
          });
          DATA.deleteDialogVisible = false;
          METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        }
      },
      // 级联获取通道数据
      handleFindChannelData: async (hostId: number) => {
        let { data } = await findChannelList({ hostId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 切换选择框
      handleChange: async ({ formdata, item }: any) => {
        switch (item.prop) {
          case "hostId":
            DATA.formData.channelId = "";
            DATA.options.channelId = [];
            formdata.hostId &&
              (DATA.options.channelId = await METHODS.handleFindChannelData(
                formdata.hostId
              ));
            break;

          default:
            break;
        }
      }
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      DATA.options.hostId = STORE.state.data.hostList;
      DATA.options.electricRoomId = STORE.state.data.electricRoomList;
      DATA.electricRoomList = STORE.state.data.electricRoomList;
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