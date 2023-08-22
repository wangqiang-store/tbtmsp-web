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
          <el-select
            v-model="pagingParams.electricId"
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
            @click="handleOneClickEditWarning"
          >一键编辑预警值</el-button>
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
    </el-col>
    <el-col :span="24">
      <!-- 添加、编辑 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogFormVisible"
        :close-on-click-modal="false"
        top="6vh"
        width="40%"
      >
        <ele-form
          :renderFormArr="renderFormArr"
          :formData="formData"
          :rules="formRules"
          :labelWidth="160"
          refForm="refForm"
          ref="refForm"
          :options="options"
          class="dialogForm"
          @handleChange="handleChange"
          v-loading="dialogLoading"
        >
          <template #scanning>
            <EleUpload
              :imageList="imageList"
              @uploadSuccess="uploadSuccess"
              @uploadRemove="uploadRemove"
              ref="upload"
            />
          </template>
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
      <!-- 一键编辑预警值-->
      <el-dialog
        title="一键编辑预警值"
        v-model="editWarningDialogFormVisible"
        :close-on-click-modal="false"
        width="40%"
      >
        <ele-form
          :formData="editWarningData"
          :renderFormArr="editWarningRenderFormArr"
          :labelWidth="140"
          :rules="editWarningRules"
          refForm="editWarning"
          ref="editWarning"
        >
          <template #busway>
            <el-cascader
              v-model="selectBuswayValue"
              :props="buswayProps"
              style="width:100%"
              popper-class="cascader_selectBusway"
              @change="cascaderBusway"
              placeholder="请选择母线槽分段"
            />
          </template>
        </ele-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editWarningDialogFormVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleEditWarningConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 节点删除模态框 -->
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
              <h4 style="font-size:16px">删除此分段母线槽将会删除以下数据</h4>
              <!-- <p style="font-size:16px">节点个数<i style="color:red;font-size:16px">{{daleteData.nodeCount || 0}}</i>个</p> -->
              <p style="font-size:16px">报警数据<i style="color:red;font-size:16px">{{daleteData.warningDataCount || 0}}</i>条</p>
              <p style="font-size:16px">报警记录<i style="color:red;font-size:16px">{{daleteData.warningCount || 0}}</i>条</p>
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
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs
} from "vue";
import { IMG_File, RES_SUCCESS } from "@/api/common/common";
import { verifyInteger, verify_0_100 } from "@/api/common/verify";
import { findListBusbar } from "@/api/maintenance/busbar";
import { ElMessage, ElMessageBox } from "element-plus";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import EleUpload from "@/components/eleUpload/index.vue";
import {
  createSectionBusWay,
  searchSectionBusWay,
  updateSectionBusWay,
  deleteSectionBusWay,
  findSectionBusWay,
  oneClickEdit,
  findSectionBusWayData
} from "@/api/maintenance/buswaySubsection";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
    EleUpload
  },
  setup(props) {
    interface Params {
      content?: string;
      electricId?: number;
      busWayId?: number | undefined;
      limit: number;
      page: number;
    }
    const { proxy }: any = getCurrentInstance(); // 获取当前实例
    const STORE = useStore();
    let dialogType = ref(false); //区分 当前模态框 编辑/添加
    let upload = ref(); //区分 当前模态框 编辑/添加
    let verifyInts = (rule: any, value: string, callback: any) => {
      verifyInteger.test(value)
        ? callback()
        : callback(new Error("数据格式为整数"));
    };
    // 验证数字0~100
    const validateXY = (rule: any, value: any, callback: any) => {
      verify_0_100.test(value)
        ? callback()
        : callback(new Error("数值在0~100之间且小数不超过两位"));
    };
    let DATA: any = reactive({
      pagingParams: {
        page: 1,
        limit: 10,
        // sectionName: '',
        sectionBusWayId: "",
        electricId: "",
        busWayId: ""
      },
      pagingParamsCopy: {
        page: 1,
        limit: 10,
        // sectionName: '',
        sectionBusWayId: "",
        electricId: "",
        busWayId: ""
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
          label: "母线槽分段名称",
          type: "text",
          prop: "sectionName"
        },
        {
          label: "母线槽",
          type: "text",
          prop: "busWayName"
        },
        {
          label: "电房",
          type: "text",
          prop: "electricName"
        },
        {
          label: "节点温度预警值(℃)",
          type: "text",
          prop: "temperatureWarning"
        },
        {
          label: "节点温度差预警值(℃)",
          type: "text",
          prop: "differenceWarning"
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
      /** 添加、编辑 */
      dialogTitle: "",
      dialogFormVisible: false,
      renderFormArr: [
        {
          label: "电房",
          type: "select",
          prop: "electricId",
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
          label: "母线槽分段名称",
          type: "input",
          prop: "sectionName"
        },
        {
          label: "节点温度预警值(℃)",
          prop: "temperatureWarning",
          type: "input"
        },
        {
          label: "节点温度差预警值(℃)",
          prop: "differenceWarning",
          type: "input"
        },
        // {
        //   label: 'x坐标',
        //   type: 'input',
        //   prop: 'x',
        // },
        // {
        //   label: 'y坐标',
        //   type: 'input',
        //   prop: 'y',
        // },
        {
          label: "扫描件",
          type: "slot",
          slotName: "scanning"
        }
      ],
      formData: {
        electricId: "",
        busWayId: "",
        sectionName: "",
        temperatureWarning: 80,
        differenceWarning: 10,
        filePath: "",
        fileId: ""
        // x: '',
        // y: '',
      },
      formRules: {
        electricId: [
          { required: true, message: "请选择电房", trigger: "change" }
        ],
        busWayId: [
          { required: true, message: "请选择母线槽", trigger: "change" }
        ],
        sectionName: [
          { required: true, message: "请选择电房", trigger: "blur" }
        ],
        temperatureWarning: [
          { required: true, message: "请输入节点温度预警值", trigger: "blur" },
          { validator: verifyInts, trigger: "blur" }
        ],
        differenceWarning: [
          { required: true, message: "请输入节点温度预警值", trigger: "blur" },
          { validator: verifyInts, trigger: "blur" }
        ]
        // x: [
        //   { required: true, message: '请输入x坐标', trigger: 'blur' },
        //   { validator: validateXY, trigger: 'blur' },
        // ],
        // y: [
        //   { required: true, message: '请输入y坐标', trigger: 'blur' },
        //   { validator: validateXY, trigger: 'blur' },
        // ],
      },
      imageList: [], //扫描件列表
      options: {},
      dialogLoading: false,
      selectBuswayInfo: {},
      isValidEndDis: false,
      // 一键编辑预警
      editWarningDialogFormVisible: false,
      editWarningData: {
        list: null,
        temperatureWarning: null,
        differenceWarning: null
      },
      editWarningRenderFormArr: [
        {
          label: "母线槽分段",
          type: "slot",
          slotName: "busway",
          prop: "list"
        },
        {
          label: "节点温度预警值",
          type: "input",
          prop: "temperatureWarning"
        },
        {
          label: "节点温度差预警值",
          type: "input",
          prop: "differenceWarning"
        }
      ],
      editWarningRules: {
        list: [
          {
            required: true,
            message: "请选择母线槽分段",
            trigger: "change"
          }
        ],
        temperatureWarning: [
          {
            required: true,
            message: "节点温度预警值不能为空",
            trigger: "blur"
          },
          { validator: verifyInts, trigger: "blur" }
        ],
        differenceWarning: [
          {
            required: true,
            message: "节点温度预警值不能为空",
            trigger: "blur"
          },
          { validator: verifyInts, trigger: "blur" }
        ]
      },
      buswayProps: {
        lazy: true,
        multiple: true,
        async lazyLoad(node: any, resolve: any) {
          // console.log('node: ', node);
          const { level } = node;
          switch (level) {
            case 0:
              let electricRoomList: any = [];
              STORE.state.data.electricRoomList?.forEach((item: any) => {
                electricRoomList.push({
                  value: item.id,
                  label: item.name,
                  leaf: level >= 1
                });
              });
              resolve(electricRoomList);
              break;
            case 1:
              let { data: busways } = await findListBusbar({
                electricRoomId: node.value
              });
              let buswayList: any = [];
              if (busways.code === RES_SUCCESS) {
                busways.data?.forEach((item: any) => {
                  buswayList.push({
                    value: item.id,
                    label: item.name,
                    leaf: false
                  });
                });
              }
              resolve(buswayList);
              break;
            case 2:
              let { data: sectionBusWays } = await findSectionBusWay({
                busWayId: node.value
              });
              let sectionBusWayList: any = [];
              if (sectionBusWays.code === RES_SUCCESS) {
                sectionBusWays.data?.forEach((item: any) => {
                  sectionBusWayList.push({
                    value: item.id,
                    label: item.sectionName,
                    leaf: true
                  });
                });
              }
              resolve(sectionBusWayList);
              break;
            default:
              break;
          }
        }
      },
      selectBuswayValue: "",
      deleteDialogVisible: false,
      deleteLoading: false,
      daleteData: {}
    });
    let METHODS = reactive({
      // 切换搜索电房
      handleChangeElectricRoom: async () => {
        DATA.pagingParams.busWayId = null;
        DATA.buswayList = [];
        DATA.subsectionBusWays = [];
        DATA.pagingParams.sectionBusWayId = null;
        DATA.pagingParams.electricId &&
          (DATA.buswayList = await METHODS.handlFindBusWayData(
            DATA.pagingParams.electricId
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
      // 级联获取分段母线槽
      handleFindSectionBusWay: async (busWayId: number) => {
        let { data } = await findSectionBusWay({ busWayId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      //获取分页数据
      handleGetPagingData: async (pagingParam: Params) => {
        DATA.loading = true;
        try {
          let { data } = await searchSectionBusWay(pagingParam);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.total = data.data.total;
            DATA.tableData = data.data.records;
          }
        } catch (error) {
          DATA.loading = false;
        }
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
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 切换选择框
      handleChange: async ({ formdata, item }: any) => {
        switch (item.prop) {
          case "electricId":
            DATA.formData.busWayId = "";
            DATA.options.busWayId = [];
            DATA.options.busWayId = await METHODS.handlFindBusWayData(
              DATA.formData.electricId
            );
            break;
          case "busWayId":
            DATA.selectBuswayInfo = {};
            if (formdata.busWayId) {
              DATA.options.busWayId.forEach((item: any) => {
                if (formdata.busWayId === item.id) {
                  DATA.selectBuswayInfo = item;
                }
              });
            }
            break;
          default:
            break;
        }
      },
      // 添加
      handleCreate: () => {
        DATA.dialogTitle = "添加母线槽分段";
        DATA.dialogFormVisible = true;
        dialogType.value = true;
        DATA.formData = {
          electricId: "",
          busWayId: "",
          sectionName: "",
          temperatureWarning: 80,
          differenceWarning: 10,
          filePath: "",
          fileId: ""
          // x: null,
          // y: null,
        };
        DATA.selectBuswayInfo = {};
        DATA.imageList = [];
        DATA.options.busWayId = [];
        nextTick(() => {
          proxy.$refs["refForm"].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            DATA.dialogLoading = true;
            DATA.dialogTitle = "编辑母线槽分段";
            DATA.dialogFormVisible = true;
            dialogType.value = false;
            DATA.formData = Object.assign({}, row);
            DATA.imageList = [];
            row.filePath && DATA.imageList.push({ url: row.filePath });
            DATA.selectBuswayInfo = {};
            DATA.options.busWayId = await METHODS.handlFindBusWayData(
              row.electricId
            );
            DATA.options.busWayId.forEach((item: any) => {
              if (row.busWayId === item.id) {
                DATA.selectBuswayInfo = item;
              }
            });
            DATA.dialogLoading = false;
            nextTick(() => {
              proxy.$refs["refForm"].clearForm();
            });
            break;
          case "delete":
            DATA.deleteDialogVisible = true;
            DATA.deleteLoading = true;
            DATA.formData = Object.assign({}, row);
            let { data } = await findSectionBusWayData({ id: row.id });
            if (data.code === RES_SUCCESS) {
              DATA.deleteLoading = false;
              DATA.daleteData = data.data;
            }
            // ElMessageBox.confirm('确定删除该母线槽分段？', '删除警告', {
            //   confirmButtonText: '确定',
            //   cancelButtonText: '取消',
            //   type: 'warning',
            // })
            //   .then(async () => {
            //     let { data } = await deleteSectionBusWay({ id: row.id });
            //     if (data.code === RES_SUCCESS) {
            //       ElMessage({
            //         message: '删除成功',
            //         type: 'success',
            //       });
            //       METHODS.handleGetPagingData(DATA.pagingParamsCopy);
            //     }
            //   })
            //   .catch(() => {});
            break;
          default:
            break;
        }
      },
      // 确认添加、编辑
      handleConfirm: async () => {
        proxy.$refs["refForm"].submitForm().then(async (valid: boolean) => {
          if (valid) {
            delete DATA.formData.createTime;
            delete DATA.formData.updateTime;
            let {
              id,
              sectionName,
              electricId,
              busWayId,
              differenceWarning,
              temperatureWarning,
              fileId,
              x,
              y,
              z
            } = DATA.formData;
            if (dialogType.value) {
              let { data } = await createSectionBusWay({
                sectionName,
                electricId,
                busWayId,
                differenceWarning,
                temperatureWarning,
                fileId,
                x,
                y,
                z
              });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  type: "success",
                  message: "添加成功"
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await updateSectionBusWay({
                id,
                sectionName,
                electricId,
                busWayId,
                differenceWarning,
                temperatureWarning,
                fileId,
                x,
                y,
                z
              });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  type: "success",
                  message: "编辑成功"
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            }
          }
        });
      },
      // 确认删除
      handleDeleteConfirm: async () => {
        let { data } = await deleteSectionBusWay({ id: DATA.formData.id });
        if (data.code === RES_SUCCESS) {
          ElMessage({
            message: "删除成功",
            type: "success"
          });
          DATA.deleteDialogVisible = false;
          METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        }
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        if (res.code === RES_SUCCESS) {
          DATA.imageList = [];
          DATA.formData.filePath = res.data.path;
          DATA.formData.fileId = res.data.id;
          DATA.imageList.push({ url: IMG_File + res.data.path });
        } else {
          ElMessage({
            type: "error",
            message: "图片上传失败"
          });
          upload.value.handleClearFiles();
          console.error(res.msg);
        }
      },
      // 移除图片
      uploadRemove: () => {
        DATA.formData.filePath = "";
        DATA.formData.fileId = "";
      },
      // 一键编辑预警值
      handleOneClickEditWarning: () => {
        DATA.selectBuswayValue = [];
        DATA.editWarningData = {
          list: [],
          temperatureWarning: null,
          differenceWarning: null
        };
        DATA.editWarningDialogFormVisible = true;
        nextTick(() => {
          proxy.$refs["editWarning"].clearForm();
        });
      },
      // 级联选择母线槽
      cascaderBusway: () => {
        DATA.editWarningData.list = [];
        if (DATA.selectBuswayValue.length > 0) {
          DATA.selectBuswayValue.forEach((item: Array<number>) => {
            DATA.editWarningData.list.push(item[2]);
          });
        } else {
          DATA.editWarningData.list = [];
        }
      },
      // 确认预警值
      handleEditWarningConfirm: async () => {
        proxy.$refs["editWarning"]
          .submitForm()
          .then(async (valid: boolean) => {
            if (valid) {
              let { data } = await oneClickEdit(DATA.editWarningData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  type: "success",
                  message: "一键编辑预警值成功"
                });
                DATA.editWarningDialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            }
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);
      DATA.options.electricId = STORE.state.data.electricRoomList;
      DATA.electricList = STORE.state.data.electricRoomList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      upload
    };
  }
});
</script>
<style scoped lang="scss">
</style>