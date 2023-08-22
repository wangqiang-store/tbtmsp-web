<template>
  <el-row>
    <el-col :span="24">
      <el-row
        type="flex"
        justify="end"
      >
        <el-col
          :span="16"
          class="d_flex d_flex_end"
        >
          <el-input
            placeholder="搜索节点名称"
            clearable
            v-model="pagingParams.content"
            style="width:200px;margin-right:10px"
          ></el-input>
          <el-select
            v-model="pagingParams.electricRoomId"
            clearable
            placeholder="请选择电房"
            style="margin-right:10px"
            filterable
            @change="handleChangeElectricRoom"
          >
            <el-option
              v-for="val in electricList"
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
            @change="handleChnageBusway"
          >
            <el-option
              v-for="val in buswayList"
              :key="val.id"
              :label="val.name"
              :value="val.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="pagingParams.sectionBusWayId"
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
            @click="handleSearch"
          ><i class="el-icon-search"></i></el-button>
          <el-button
            type="primary"
            @click="handleCreate"
          ><i class="el-icon-plus"></i>添加</el-button>
          <el-button
            type="primary"
            @click="handleOneImport"
          >
            一键导入
          </el-button>
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
          :labelWidth="120"
          :options="options"
          :refForm="'refForm'"
          ref="refForm"
          class="dialogForm"
          v-loading="dialogLoading"
          @handleChange="handleChange"
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
      <!-- 一键导入 -->
      <el-dialog
        v-model="oneImportDialogVisible"
        title="节点数据导入"
        width="30%"
      >
        <el-upload
          class="upload-demo text-center"
          drag
          ref="upload"
          name="uploadFile"
          :action="EXCEL_URL"
          :headers="getItemtoken"
          :limit="1"
          :on-exceed="handleExceed"
          :on-change="beforeUpload"
          :on-success="handleSuccess"
          :auto-upload="false"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将excel文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              <span>只能上传 xls/xlsx文件且只能上传一个文件</span>
              <a
                :href="IMG_File + '/img/节点Excel导入模版.xlsx'"
                download="节点Excel导入模版"
              >下载导入模板</a>
            </div>
          </template>
        </el-upload>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="oneImportDialogVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleOneImportConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 节点删除模态框 -->
      <!-- <el-dialog
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
              <h4 style="font-size:16px">删除此节点将会删除以下数据</h4>
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
      </el-dialog> -->
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
  ref,
  nextTick,
  computed
} from "vue";
import {
  createNode,
  deleteNode,
  findByBusWayId,
  findNodeData,
  pagingNode,
  updateNode
} from "@/api/maintenance/node";
import { IMG_File, EXCEL_URL, RES_SUCCESS } from "@/api/common/common";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { findListBusbar } from "@/api/maintenance/busbar";
import { verifyFigure, verify_0_100 } from "@/api/common/verify";
import { findSectionBusWay } from "@/api/maintenance/buswaySubsection";
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      electricRoomId?: number;
      busWayId?: number | undefined;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const upload = ref();
    // 获取vuex实例
    const STORE = useStore();
    let dialogType = ref(false);
    // 验证光纤距离
    const validateFiberDistance = async (
      rule: any,
      value: any,
      callback: any
    ) => {
      if (verifyFigure.test(value)) {
        if (DATA.fiberDistance == value) {
          callback();
        } else {
          let { data } = await findByBusWayId({
            busWayId: DATA.formData.busWayId,
            fiberDistance: value
          });
          if (data.code === 500) {
            callback(new Error(data.msg));
          } else {
            callback();
          }
        }
      } else {
        callback(new Error("数据格式填正整数或精确1个小数点"));
      }
    };
    // 验证数字0~100
    const validateXY = (rule: any, value: any, callback: any) => {
      verify_0_100.test(value)
        ? callback()
        : callback(new Error("数值在0~100之间且小数不超过两位"));
    };
    const validatemonitoringScope = (rule: any, value: any, callback: any) => {
      verifyFigure.test(value)
        ? callback()
        : callback(new Error("数据格式为正数且精确一位小数"));
    };
    let DATA: any = reactive({
      pagingParams: {
        content: "",
        electricRoomId: "",
        busWayId: "",
        sectionBusWayId: "",
        limit: 10,
        page: 1
      },
      pagingParamsCopy: {
        content: "",
        electricRoomId: "",
        busWayId: "",
        sectionBusWayId: "",
        limit: 10,
        page: 1
      },
      electricList: [],
      buswayList: [],
      subsectionBusWays: [],
      /** 表格 */
      loading: false,
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
          label: "节点名称",
          type: "text",
          prop: "name"
        },
        {
          label: "母线槽名称",
          type: "text",
          prop: "busWayName"
        },
        {
          label: "母线槽分段名称",
          type: "text",
          prop: "sectionBusWayName"
        },
        {
          label: "电房",
          type: "text",
          prop: "electricRoomName"
        },
        {
          label: "光纤距离",
          type: "text",
          prop: "fiberDistance"
        },
        // {
        //   label: '通道',
        //   type: 'text',
        //   prop: 'channelName',
        // },
        // {
        //   label: '主机',
        //   type: 'text',
        //   prop: 'hostName',
        // },
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
      /** 添加、编辑 */
      dialogTitle: "",
      dialogFormVisible: false,
      dialogLoading: false,
      renderFormArr: [
        {
          label: "电房",
          type: "select",
          prop: "electricRoomId",
          title: "name",
          value: "id",
          clearable: true,
          filterable: true,
          disabled: () => !dialogType.value
        },
        {
          label: "母线槽",
          type: "select",
          prop: "busWayId",
          title: "name",
          value: "id",
          clearable: true,
          filterable: true,
          disabled: () => !dialogType.value
        },
        {
          label: "母线槽分段",
          type: "select",
          prop: "sectionBusWayId",
          title: "sectionName",
          value: "id",
          clearable: true,
          filterable: true
        },
        {
          label: "节点名称",
          type: "input",
          prop: "name"
        },
        {
          label: "光纤距离",
          type: "input",
          prop: "fiberDistance"
        },
        {
          label: "温度监测范围",
          type: "input",
          prop: "monitoringScope"
        },
        {
          label: "x坐标",
          type: "input",
          prop: "x"
        },
        {
          label: "y坐标",
          type: "input",
          prop: "y"
        }
      ],
      formData: {
        busWayId: "",
        name: "",
        fiberDistance: "",
        x: "",
        y: ""
      },
      formRules: {
        electricRoomId: [
          { required: true, message: "请选择电房", trigger: "change" }
        ],
        busWayId: [
          { required: true, message: "请选择母线槽", trigger: "change" }
        ],
        sectionBusWayId: [
          { required: true, message: "请选择母线槽分段", trigger: "change" }
        ],
        name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
        fiberDistance: [
          { required: true, message: "请输入光纤距离", trigger: "blur" },
          { validator: validateFiberDistance, trigger: "blur" }
        ],
        monitoringScope: [
          { required: true, message: "请输入温度监测范围", trigger: "blur" },
          { validator: validatemonitoringScope, trigger: "blur" }
        ],
        x: [
          { required: true, message: "请输入x坐标", trigger: "blur" },
          { validator: validateXY, trigger: "blur" }
        ],
        y: [
          { required: true, message: "请输入y坐标", trigger: "blur" },
          { validator: validateXY, trigger: "blur" }
        ]
      },
      options: {},
      /** 删除 */
      // deleteDialogVisible: false,
      // daleteData: {},
      // deleteLoading: false,
      fiberDistance: "",
      // 一键导入
      oneImportDialogVisible: false,
      fileList: []
    });
    let METHODS: any = reactive({
      // 切换搜索电房
      handleChangeElectricRoom: async () => {
        DATA.pagingParams.busWayId = null;
        DATA.buswayList = [];
        DATA.subsectionBusWays = [];
        DATA.pagingParams.sectionBusWayId = null;
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
      handleChnageBusway: async () => {
        DATA.subsectionBusWays = [];
        DATA.pagingParams.sectionBusWayId = null;
        DATA.pagingParams.busWayId &&
          (DATA.subsectionBusWays = await METHODS.handleFindSectionBusWay(
            DATA.pagingParams.busWayId
          ));
      },
      // 级联获取母线槽分段
      handleFindSectionBusWay: async (busWayId: number) => {
        let { data } = await findSectionBusWay({ busWayId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 分页获取数据
      handleGetPagingData: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await pagingNode(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.total = data.data.total;
            DATA.tableData = data.data.records;
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
      // 添加
      handleCreate: () => {
        DATA.dialogFormVisible = true;
        DATA.dialogTitle = "添加";
        dialogType.value = true;
        DATA.options.busWayId = [];
        DATA.formData = Object.assign(
          {},
          {
            busWayId: "",
            sectionBusWayId: "",
            name: "",
            fiberDistance: "",
            monitoringScope: "",
            x: "",
            y: ""
          }
        );
        nextTick(() => {
          proxy.$refs["refForm"].clearForm();
        });
      },
      //切换分页页数
      handleCurrentChange: (val: number) => {
        DATA.pagingParamsCopy.page = val;
        DATA.pagingParams.page = val;
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
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.dialogFormVisible = true;
            DATA.dialogLoading = true;
            DATA.dialogTitle = "编辑";
            dialogType.value = false;
            let {
              id,
              electricRoomId,
              busWayId,
              sectionBusWayId,
              name,
              fiberDistance,
              electricRoomName,
              busWayName,
              sectionBusWayName,
              monitoringScope,
              x,
              y
            } = Object.assign({}, row);
            electricRoomId &&
              (DATA.options.busWayId = await METHODS.handlFindBusWayData(
                electricRoomId
              ));
            busWayId &&
              (DATA.options.sectionBusWayId =
                await METHODS.handleFindSectionBusWay(busWayId));

            if (DATA.options.sectionBusWayId != undefined) {
              let isSomeSectionBusWay: boolean =
                DATA.options.sectionBusWayId.some((val: any) => {
                  return val.id === sectionBusWayId;
                });
              !isSomeSectionBusWay && (sectionBusWayId = null);
            }

            DATA.formData = {
              id,
              electricRoomId,
              sectionBusWayId,
              busWayId,
              name,
              fiberDistance,
              electricRoomName,
              busWayName,
              sectionBusWayName,
              monitoringScope,
              x,
              y
            };
            DATA.fiberDistance = fiberDistance;
            nextTick(() => {
              proxy.$refs["refForm"].clearForm();
              DATA.dialogLoading = false;
            });
            break;
          case "delete":
            ElMessageBox.confirm("确定删除该节点？", "删除警告", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(async () => {
                let { data } = await deleteNode({ id: row.id });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: "删除成功",
                    type: "success"
                  });
                  // DATA.deleteDialogVisible = false;
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            // DATA.deleteDialogVisible = true;
            // DATA.deleteLoading = true;
            // DATA.formData = Object.assign({}, row);
            // let { data } = await findNodeData({ id: row.id });
            // if (data.code === RES_SUCCESS) {
            //   DATA.deleteLoading = false;
            //   DATA.daleteData = data.data;
            // }
            break;
          default:
            break;
        }
      },
      // 确认添加、编辑
      handleConfirm: async () => {
        proxy.$refs["refForm"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (dialogType.value) {
              let { data } = await createNode(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "节点添加成功",
                  type: "success"
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await updateNode(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: "节点编辑成功",
                  type: "success"
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            }
          }
        });
      },
      // 确认删除
      // handleDeleteConfirm: async () => {
      //   let { data } = await deleteNode({ id: DATA.formData.id });
      //   if (data.code === RES_SUCCESS) {
      //     ElMessage({
      //       message: '删除成功',
      //       type: 'success',
      //     });
      //     DATA.deleteDialogVisible = false;
      //     METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      //   }
      // },
      // 切换选择框
      handleChange: async ({ formdata, item }: any) => {
        switch (item.prop) {
          case "electricRoomId":
            DATA.formData.busWayId = "";
            DATA.options.busWayId = [];
            DATA.formData.sectionBusWayId = "";
            DATA.options.sectionBusWayId = [];
            DATA.options.busWayId = await METHODS.handlFindBusWayData(
              DATA.formData.electricRoomId
            );
            break;
          case "busWayId":
            DATA.formData.sectionBusWayId = "";
            DATA.options.sectionBusWayId = [];
            DATA.options.sectionBusWayId =
              await METHODS.handleFindSectionBusWay(DATA.formData.busWayId);
            break;
          default:
            break;
        }
      },
      /**
       *  一键导入 模块
       */
      handleOneImport: () => {
        DATA.oneImportDialogVisible = true;
        nextTick(() => {
          upload.value.clearFiles();
        });
      },
      // 确认一键导入
      handleOneImportConfirm: () => {
        if (DATA.fileList.length === 0) {
          ElMessage({
            message: "请选择上传文件",
            type: "warning"
          });
          return;
        }
        nextTick(() => {
          upload.value.submit();
        });
      },
      handleSuccess: (res: any) => {
        if (res.code === RES_SUCCESS) {
          DATA.oneImportDialogVisible = false;
          ElMessage({
            message: res.msg,
            type: "success"
          });
          METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        } else {
          upload.value.clearFiles();
          ElMessage({
            message: res.msg,
            type: "error"
          });
        }
      },
      // 验证 文件格式
      beforeUpload: (file: any, fileList: any) => {
        if (!/\.(xlsx|xls)$/.test(file.name)) {
          proxy.$message.error("请上传指定的文件类型");
          upload.value.clearFiles();
          return;
        }
        DATA.fileList = fileList;
      },
      handleExceed: (files: any) => {
        upload.value.clearFiles();
        upload.value.handleStart(files[0]);
      }
    });
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token")
      };
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      DATA.options.electricRoomId = STORE.state.data.electricRoomList;
      DATA.electricList = STORE.state.data.electricRoomList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      EXCEL_URL,
      getItemtoken,
      upload,
      IMG_File
    };
  }
});
</script>
<style lang="scss" scoped>
.el-upload__tip {
  display: flex;
  justify-content: space-around;
  align-items: center;
  a {
    color: #6ac3ff;
    cursor: pointer;
  }
}
</style>