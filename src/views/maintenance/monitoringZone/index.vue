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
            placeholder="监测分区名称"
            clearable
            v-model="pagingParams.name"
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
} from 'vue';
import {
  createMonitoringZone,
  deleteMonitoringZone,
  judgeDis,
  searchMonitoringZone,
  updateMonitoringZone,
} from '@/api/maintenance/monitoringZone';
import { RES_SUCCESS } from '@/api/common/common';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useStore } from 'vuex';
import { findListBusbar } from '@/api/maintenance/busbar';
import { verifyFigure, verify_0_100 } from '@/api/common/verify';
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      name?: string;
      electricRoomId?: number;
      busWayId?: number | undefined;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取vuex实例
    const STORE = useStore();
    let dialogType = ref(false);
    // 验证开始距离
    const validateStartDistance = async (
      rule: any,
      value: any,
      callback: any
    ) => {
      if (verifyFigure.test(value)) {
        if (+value >= +DATA.formData.endDis) {
          callback(new Error('开始距离不能大于或等于结束距离'));
          DATA.isStart = true;
        } else {
          let { data } = await judgeDis({
            busWayId: DATA.formData.busWayId,
            distance: value,
          });
          if (data.code === RES_SUCCESS) {
            data.data
              ? callback('母线槽分段的开始距离须在母线槽的开始和结束距离之内')
              : callback();
          }
          DATA.isStart = false;
          DATA.isEnd && proxy.$refs.refForm.validateField('endDis');
        }
      } else {
        callback(new Error('数据格式填正整数或精确1个小数点'));
      }
    };
    const validateEndDistance = async (
      rule: any,
      value: any,
      callback: any
    ) => {
      if (verifyFigure.test(value)) {
        if (+value <= +DATA.formData.startDis) {
          callback(new Error('开始距离不能大于或等于结束距离'));
          DATA.isEnd = true;
        } else {
          let { data } = await judgeDis({
            busWayId: DATA.formData.busWayId,
            distance: value,
          });
          if (data.code === RES_SUCCESS) {
            data.data
              ? callback('母线槽分段的结束距离须在母线槽的开始和结束距离之内')
              : callback();
          }
          DATA.isEnd = false;
          DATA.isStart && proxy.$refs.refForm.validateField('startDis');
        }
      } else {
        callback(new Error('数据格式填正整数或精确1个小数点'));
      }
    };
    // 验证数字0~100
    const validateXY = (rule: any, value: any, callback: any) => {
      verify_0_100.test(value)
        ? callback()
        : callback(new Error('数值在0~100之间且小数不超过两位'));
    };
    let DATA: any = reactive({
      pagingParams: {
        name: '',
        electricRoomId: '',
        busWayId: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        name: '',
        electricRoomId: '',
        busWayId: '',
        limit: 10,
        page: 1,
      },
      electricList: [],
      buswayList: [],
      /** 表格 */
      loading: false,
      tableData: [],
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: '母线槽',
          type: 'text',
          prop: 'busWayName',
        },
        {
          label: '监测分区名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '检测光纤长度',
          type: 'text',
          formatter: (row: any) => {
            let length = row.endDis - row.startDis;
            return length % 1 === 0 ? length : length.toFixed(2);
          },
        },
        {
          label: '电房',
          type: 'text',
          prop: 'electricName',
        },
        {
          label: '通道',
          type: 'text',
          prop: 'channelName',
        },
        {
          label: '操作',
          type: 'handle',
          width: 300,
        },
      ],
      btnList: [
        {
          text: '编辑',
          type: 'primary',
          handleType: 'edit',
        },
        {
          text: '删除',
          type: 'danger',
          handleType: 'delete',
        },
      ],
      total: 0,
      /** 添加、编辑 */
      dialogTitle: '',
      dialogFormVisible: false,
      renderFormArr: [
        {
          label: '电房',
          type: 'select',
          prop: 'electricRoomId',
          title: 'name',
          value: 'id',
          clearable: true,
          filterable: true,
        },
        {
          label: '母线槽',
          type: 'select',
          prop: 'busWayId',
          title: 'name',
          value: 'id',
          clearable: true,
          filterable: true,
        },
        {
          label: '监测分区名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '开始距离',
          type: 'input',
          prop: 'startDis',
        },
        {
          label: '结束距离',
          type: 'input',
          prop: 'endDis',
        },
        {
          label: 'x坐标',
          type: 'input',
          prop: 'x',
        },
        {
          label: 'y坐标',
          type: 'input',
          prop: 'y',
        },
      ],
      formData: {
        busWayId: '',
        name: '',
        startDis: '',
        endDis: '',
        x: '',
        y: '',
      },
      formRules: {
        electricRoomId: [
          { required: true, message: '请选择电房', trigger: 'change' },
        ],
        busWayId: [
          { required: true, message: '请选择母线槽', trigger: 'change' },
        ],
        electricName: [
          { required: true, message: '电房不能为空', trigger: 'blur' },
        ],
        busWayName: [
          { required: true, message: '母线槽不能为空', trigger: 'blur' },
        ],
        name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
        startDis: [
          { required: true, message: '请输入开始距离', trigger: 'blur' },
          { validator: validateStartDistance, trigger: 'blur' },
        ],
        endDis: [
          { required: true, message: '请输入结束距离', trigger: 'blur' },
          { validator: validateEndDistance, trigger: 'blur' },
        ],
        x: [
          { required: true, message: '请输入x坐标', trigger: 'blur' },
          { validator: validateXY, trigger: 'blur' },
        ],
        y: [
          { required: true, message: '请输入y坐标', trigger: 'blur' },
          { validator: validateXY, trigger: 'blur' },
        ],
      },
      options: {},
      isStart: true,
      isEnd: true,
    });
    let METHODS: any = reactive({
      // 分页获取数据
      handleGetPagingData: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await searchMonitoringZone(pagingParams);
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
        DATA.dialogTitle = '添加';
        dialogType.value = true;
        DATA.options.busWayId = [];
        DATA.formData = Object.assign(
          {},
          {
            hostId: '',
            channelId: '',
            busWayId: '',
            name: '',
            startDis: '',
            endDis: '',
            x: '',
            y: '',
          }
        );
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
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
          case 'edit':
            DATA.dialogFormVisible = true;
            DATA.dialogTitle = '编辑';
            dialogType.value = false;
            let {
              id,
              electricRoomId,
              busWayId,
              name,
              startDis,
              endDis,
              electricName,
              busWayName,
              x,
              y,
            } = Object.assign({}, row);
            electricRoomId &&
              (DATA.options.busWayId = await METHODS.handlFindBusWayData(
                electricRoomId
              ));
            DATA.formData = {
              id,
              electricRoomId,
              busWayId,
              name,
              startDis,
              endDis,
              electricName,
              busWayName,
              x,
              y,
            };
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'delete':
            ElMessageBox.confirm('是否确认删除此检测点?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(async () => {
                let { data } = await deleteMonitoringZone({
                  id: row.id,
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '删除成功',
                    type: 'success',
                  });
                  METHODS.handleGetPagingData(DATA.pagingParamsCopy);
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      // 确认添加、编辑
      handleConfirm: async () => {
        proxy.$refs['refForm'].submitForm().then(async (valid: boolean) => {
          if (valid) {
            if (dialogType.value) {
              let { data } = await createMonitoringZone(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '节点添加成功',
                  type: 'success',
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            } else {
              let { data } = await updateMonitoringZone(DATA.formData);
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '节点编辑成功',
                  type: 'success',
                });
                DATA.dialogFormVisible = false;
                METHODS.handleGetPagingData(DATA.pagingParamsCopy);
              }
            }
          }
        });
      },
      // 确认删除
      handleDeleteConfirm: async () => {},
      // 切换选择框
      handleChange: async ({ formdata, item }: any) => {
        switch (item.prop) {
          case 'electricRoomId':
            DATA.formData.busWayId = "";
            DATA.options.busWayId = [];
            DATA.options.busWayId = await METHODS.handlFindBusWayData(
              DATA.formData.electricRoomId
            );
            break;
          default:
            break;
        }
      },
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
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      DATA.options.electricRoomId = STORE.state.data.electricRoomList;
      DATA.electricList = STORE.state.data.electricRoomList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
</style>