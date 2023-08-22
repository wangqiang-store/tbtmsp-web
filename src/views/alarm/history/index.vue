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
            placeholder="主机名称"
            style="margin-left:10px;width:200px"
            v-model="pagingParams.content"
            clearable
          ></el-input>
          <el-select
            v-model="pagingParams.host"
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
      <!-- 编辑 -->
      <el-dialog
        title="备注"
        v-model="dialogFormVisible"
        width="50%"
      >
        <el-input
          type="textarea"
          v-model="formData.remark"
          placeholder="请输入内容"
        ></el-input>
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
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { filterTime } from '@/utils/filtration';
import { addRemark, pagingByOfflineLog } from '@/api/alarm/history';
import { RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { useStore } from 'vuex';
export default defineComponent({
  components: { EleForm, EleTable, ElePagination },
  setup() {
    interface params {
      content: string;
      host: number;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        host: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: '',
        host: '',
        limit: 10,
        page: 1,
      },
      hostList: [],
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
          label: '主机名称',
          type: 'text',
          prop: 'hostName',
        },
        {
          label: '离线时间',
          type: 'moreText',
          prop: 'hostType',
          formatter: (row: any) => {
            return `${filterTime(row.startTime, '/')} - ${filterTime(
              row.endTime,
              '/'
            )}`;
          },
        },
        {
          label: '备注',
          type: 'text',
          prop: 'remark',
        },
        {
          label: '操作',
          type: 'handle',
          width: 150,
        },
      ],
      btnList: [
        {
          text: '备注',
          type: 'primary',
          handleType: 'remark',
        },
      ],
      total: 0,
      /** 模态框 */
      dialogFormVisible: false,
      formData: {
        id: '',
        remark: '',
      },
    });
    let METHODS: any = reactive({
      // 分页获取表格数据
      handleGetPagingData: async (pagingParams: params) => {
        DATA.loading = true;
        let { data } = await pagingByOfflineLog(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.total = data.data.total;
          DATA.tableData = data.data.records;
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
        DATA.pagingParamsCopy.page = val;
        DATA.pagingParams.page = val;
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'remark':
            DATA.dialogFormVisible = true;
            let { id, remark } = row;
            DATA.formData = Object.assign({}, { id, remark });
            break;
          default:
            break;
        }
      },
      // 确认修改
      handleConfirm: async () => {
        let { data } = await addRemark(DATA.formData);
        if (data.code === RES_SUCCESS) {
          ElMessage({
            type: 'success',
            message: '编辑成功',
          });
          DATA.dialogFormVisible = false;
          METHODS.handleGetPagingData(DATA.pagingParamsCopy);
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetPagingData(DATA.pagingParams);
      DATA.hostList = STORE.state.data.hostList;
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
/deep/ .el-textarea__inner {
  height: 300px;
}
</style>