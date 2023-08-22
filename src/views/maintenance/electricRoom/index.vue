<template>
  <el-row>
    <el-col :span="24">
      <el-row
        type="flex"
        justify="end"
      >
        <el-col
          :span="8"
          class="d_flex d_flex_end"
        >
          <el-input
            placeholder="搜索电房名称"
            clearable
            v-model="pagingParams.electricName"
            style="width:200px;margin-right:10px"
          ></el-input>
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
          style="margin-top:10px"
          v-loading="loading"
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
          :refForm="'refForm'"
          ref="refForm"
          class="dialogForm"
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
      <!-- 电房删除模态框 -->
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
              <h4 style="font-size:16px">删除此电房将会删除以下数据</h4>
              <p style="font-size:16px">下属母线槽<i style="color:red;font-size:16px">{{daleteElectricRoomData.busWayCount}}</i>个</p>
              <p style="font-size:16px">下属母线槽分段<i style="color:red;font-size:16px">{{daleteElectricRoomData.sectionBusWayCount}}</i>条</p>
              <p style="font-size:16px">下属节点<i style="color:red;font-size:16px">{{daleteElectricRoomData.nodeCount}}</i>个</p>
              <p style="font-size:16px">报警记录<i style="color:red;font-size:16px">{{daleteElectricRoomData.warningCount}}</i>条</p>
              <p style="font-size:16px">报警数据<i style="color:red;font-size:16px">{{daleteElectricRoomData.warningDataCount}}</i>条</p>
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
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import {
  createElectricRoom,
  deleteElectricRoom,
  electricData,
  findByPageElectricRoom,
  findElectricRoom,
  updateElectricRoom,
} from '@/api/maintenance/electricRoom';
import { RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { useStore } from 'vuex';
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      electricName?: string;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let DATA: any = reactive({
      // 分页参数
      pagingParams: {
        electricName: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        electricName: '',
        limit: 10,
        page: 1,
      },
      /** 表格 */
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
          label: '电房名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '备注',
          prop: 'remark',
          type: 'text',
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
          handleType: 'edit',
          type: 'primary',
        },
        {
          text: '删除',
          handleType: 'delete',
          type: 'danger',
        },
      ],
      total: 0,
      loading: false,
      /** 添加、编辑 */
      dialogTitle: '',
      dialogFormVisible: false,
      renderFormArr: [
        {
          label: '电房名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '备注',
          type: 'input',
          inputType: 'textarea',
          prop: 'remark',
        },
      ],
      formData: {
        name: '',
        remark: '',
      },
      formRules: {
        name: [{ required: true, message: '请输入电房名称', trigger: 'blur' }],
      },
      dialogType: false,
      /**电房关联数据 */
      deleteDialogVisible: false,
      deleteLoading: false,
      daleteElectricRoomData: {},
    });
    let METHODS: any = reactive({
      // 获取电房列表
      handleGetElectricRoom: async () => {
        let { data } = await findElectricRoom();
        if (data.code === RES_SUCCESS) {
          STORE.commit('setElectricRoomList', data.data);
        }
      },
      // 分页获取电房数据
      handleGetElecteicRoomData: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await findByPageElectricRoom(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
          }
        } catch (error) {
          DATA.loading = false;
        }
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
        METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
      },
      // 切换分页当前页面
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
      },
      // 添加
      handleCreate: () => {
        DATA.dialogTitle = '添加';
        DATA.dialogFormVisible = true;
        DATA.dialogType = true;
        DATA.formData = Object.assign(
          {},
          {
            name: '',
            remark: '',
          }
        );
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑';
            DATA.dialogFormVisible = true;
            DATA.dialogType = false;
            let { name, remark, id } = Object.assign({}, row);
            DATA.formData = Object.assign(
              {},
              {
                name,
                remark,
                id,
              }
            );
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'delete':
            DATA.deleteDialogVisible = true;
            DATA.deleteLoading = true;
            let { data } = await electricData({ id: row.id });
            if (data.code === RES_SUCCESS) {
              DATA.daleteElectricRoomData = data.data;
              DATA.deleteLoading = false;
            }
            DATA.formData = Object.assign({}, row);
            break;
          default:
            break;
        }
      },
      // 确认提交添加编辑
      handleConfirm: async () => {
        let createElectric = async () => {
          let { data } = await createElectricRoom(DATA.formData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '电房添加成功',
              type: 'success',
            });
            DATA.dialogFormVisible = false;
            await METHODS.handleGetElectricRoom();
            await METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
          }
        };
        let updateElectric = async () => {
          let { data } = await updateElectricRoom(DATA.formData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '电房编辑成功',
              type: 'success',
            });
            DATA.dialogFormVisible = false;
            await METHODS.handleGetElectricRoom();
            await METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
          }
        };
        proxy.$refs['refForm'].submitForm().then((valid: boolean) => {
          if (valid) {
            DATA.dialogType ? createElectric() : updateElectric();
          }
        });
      },
      // 确认删除
      handleDeleteConfirm: async () => {
        let { data } = await deleteElectricRoom({ id: DATA.formData.id });
        if (data.code === RES_SUCCESS) {
          proxy.$message({
            type: 'success',
            message: '删除成功!',
          });
          await METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
          DATA.deleteDialogVisible = false;
          await METHODS.handleGetElectricRoom();
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetElecteicRoomData(DATA.pagingParamsCopy);
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