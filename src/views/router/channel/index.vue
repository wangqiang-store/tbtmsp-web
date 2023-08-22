<template>
  <el-row class="container_channel">
    <el-col
      :span="24"
      type="flex"
    >
      <el-row>
        <el-col
          :span="9"
          :offset="15"
          class="d_flex channel_head"
        >
          <el-input
            placeholder="通道名称"
            style="margin-left:10px;width:200px"
            v-model="pagingParams.content"
            clearable
          ></el-input>
          <el-select
            v-model="pagingParams.hostId"
            placeholder="主机"
            style="margin-left:10px;width:200px"
            clearable
            filterable
          >
            <el-option
              v-for="item in hostList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <el-button
            type="primary"
            style="margin-left:10px"
            @click="handleSearch"
          ><i class="el-icon-search"></i></el-button>
          <el-button
            type="primary"
            @click="handleCreateChannel"
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
            :renderTable="randerTable"
            :btnList="btnList"
            :isborder="true"
            @handleBtnEvent="handleBtnEvent"
          />
        </el-col>
        <el-col :span="24">
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
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
      <!-- 通道删除模态框 -->
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
              <h4 style="font-size:16px">删除此通道将会删除以下数据</h4>
              <p style="font-size:16px">关联母线槽<i style="color:red;font-size:16px">{{daleteChannelData.busWayCount}}</i>个</p>
              <p style="font-size:16px">关联母线槽分段<i style="color:red;font-size:16px">{{daleteChannelData.sectionBusWayCount}}</i>条</p>
              <p style="font-size:16px">关联节点<i style="color:red;font-size:16px">{{daleteChannelData.nodeCount}}</i>个</p>
              <p style="font-size:16px">报警记录<i style="color:red;font-size:16px">{{daleteChannelData.warningCount}}</i>条</p>
              <p style="font-size:16px">报警数据<i style="color:red;font-size:16px">{{daleteChannelData.warningDataCount}}</i>条</p>
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
  watch,
  nextTick,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import {
  createChannel,
  deleteChannel,
  findByCodeChannel,
  findByPageChannel,
  findChannelData,
  updateChannel,
} from '@/api/router/channel/index';
import { RES_SUCCESS } from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus/lib';
import { verifyFigure } from '@/api/common/verify';
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      hostId?: number;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    // 验证通道编号
    let validateCode = async (rule: any, value: any, callback: any) => {
      if (
        !DATA.dialogFormType &&
        value === DATA.channelCode &&
        DATA.hostId === DATA.formData.hostId
      ) {
        callback();
        return;
      }
      if (/^\d+$/.test(value)) {
        let { data } = await findByCodeChannel({
          code: value.trim(),
          hostId: DATA.formData.hostId,
        });
        data.code === 500
          ? callback(new Error('该通道编号已存在'))
          : callback();
      } else {
        callback(new Error('通道编号只能为数字'));
      }
    };
    let validateLength = async (rule: any, value: any, callback: any) => {
      verifyFigure.test(value)
        ? callback()
        : callback(new Error('数据格式为正整数或精确1个小数点'));
    };
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        hostId: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: '',
        hostId: '',
        limit: 10,
        page: 1,
      },
      /** 表格 */
      loading: false,
      tableData: [],
      randerTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80,
        },
        {
          label: '通道名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '通道编号',
          prop: 'code',
          type: 'text',
        },
        {
          label: '主机',
          prop: 'hostName',
          type: 'text',
        },
        {
          label: '长度',
          prop: 'length',
          type: 'text',
        },
        {
          label: '创建时间',
          prop: 'createTime',
          type: 'text',
          formatter: (row: any) => {
            return filterTime(row.createTime, '/');
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: '200',
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
      hostList: [],
      /* 编辑、添加 */
      dialogTitle: '',
      dialogFormVisible: false,
      renderFormArr: [
        {
          label: '主机',
          type: 'select',
          prop: 'hostId',
          title: 'name',
          value: 'id',
          filterable: true,
        },
        {
          label: '通道名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '编号',
          type: 'input',
          prop: 'code',
        },
        {
          label: '长度',
          type: 'input',
          prop: 'length',
        },
      ],
      formData: {
        hostId: '',
        name: '',
        code: '',
        length: '',
      },
      formRules: {
        hostId: [
          { required: true, message: '请输入选择主机名称', trigger: 'change' },
        ],
        name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入通道编号', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' },
        ],
        length: [
          { required: true, message: '请输入通道长度', trigger: 'blur' },
          { validator: validateLength, trigger: 'blur' },
        ],
      },
      options: {},
      channelCode: '',
      hostId: '',
      dialogFormType: false,
      /** 删除通道 */
      deleteDialogVisible: false,
      deleteLoading: false,
      daleteChannelData: {},
      deleteId: '',
    });
    let METHODS: any = reactive({
      // 分页获取通道
      handleFindGetchannel: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await findByPageChannel(pagingParams);
          if (data.code === RES_SUCCESS && data.data != null) {
            DATA.loading = false;
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      // 切换分页个数
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
        METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
      },
      // 切换分页页数
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
      },
      // 添加通道
      handleCreateChannel: () => {
        DATA.dialogTitle = '添加';
        DATA.dialogFormVisible = true;
        DATA.formData = Object.assign(
          {},
          {
            hostId: '',
            name: '',
            code: '',
            length: '',
          }
        );
        DATA.dialogFormType = true;
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
        });
      },
      // 获取通道关联数据
      handleAssociatedData: async (id: number) => {
        let { data } = await findChannelData({ id });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑';
            DATA.dialogFormVisible = true;
            DATA.formData = Object.assign({}, row);
            DATA.channelCode = row.code;
            DATA.hostId = row.hostId;
            DATA.dialogFormType = false;
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'delete':
            DATA.deleteLoading = true;
            DATA.formData = Object.assign({}, row);
            DATA.daleteChannelData = await METHODS.handleAssociatedData(row.id);
            DATA.deleteDialogVisible = true;
            DATA.deleteLoading = false;
            DATA.deleteId = row.id;
            break;
          default:
            break;
        }
      },
      // 确认添加、编辑
      handleConfirm: async () => {
        let handleConfirmCreateChannel = async () => {
          let { data } = await createChannel(DATA.formData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '通道添加成功',
              type: 'success',
            });
            DATA.dialogFormVisible = false;
            METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
          }
        };
        let handleConfirmUpdateChannel = async () => {
          let { data } = await updateChannel(DATA.formData);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '通道编辑成功',
              type: 'success',
            });
            DATA.dialogFormVisible = false;
            METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
          }
        };
        proxy.$refs['refForm'].submitForm().then((valid: boolean) => {
          if (valid) {
            if (DATA.dialogFormType) {
              handleConfirmCreateChannel();
            } else {
              delete DATA.formData.createTime;
              delete DATA.formData.updateTime;
              handleConfirmUpdateChannel();
            }
          }
        });
      },
      // 确认删除
      handleDeleteConfirm: async () => {
        let { data } = await deleteChannel({ id: DATA.formData.id });
        if (data.code === RES_SUCCESS) {
          ElMessage({
            message: '删除成功',
            type: 'success',
          });
          DATA.deleteDialogVisible = false;
          METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
        }
      },
    });
    watch(
      () => STORE.state.data.hostList,
      () => {
        DATA.hostList = STORE.state.data.hostList;
        DATA.options.hostId = STORE.state.data.hostList;
      },
      {
        deep: true,
      }
    );
    onMounted(() => {
      METHODS.handleFindGetchannel(DATA.pagingParamsCopy);
      DATA.hostList = STORE.state.data.hostList;
      DATA.options.hostId = STORE.state.data.hostList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.container_channel {
  .channel_head {
    justify-content: flex-end;
  }
}
</style>