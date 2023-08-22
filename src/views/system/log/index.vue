<template>
  <div class="container">
    <div class="container_head d_flex">
      <div class="d_flex container_head_item">
        <el-input
          placeholder="请输入用户名/用户操作/用户IP"
          v-model="getPageObj.content"
          clearable
        ></el-input>
        <el-date-picker
          v-model="value"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="datePicker"
          :default-value="defaultTime"
          :disabledDate="disabledDate"
          clearable
        >
        </el-date-picker>
        <el-button
          type="primary"
          @click="handleSearch"
        ><i class="el-icon-search"></i></el-button>
      </div>
    </div>
    <el-row
      v-loading="loading"
      style="margin-top:10px"
    >
      <el-col :span="24">
        <ele-table
          :tableData="tableData"
          :isborder="true"
          :renderTable="renderTable"
        ></ele-table>
      </el-col>
      <el-col :span="24">
        <ele-pagination
          :total="total"
          :currentPage="getPageObjCopy.page"
          @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"
        />
      </el-col>
    </el-row>

  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { getLog } from "@/api/system/sysLog";
import { RES_SUCCESS } from "@/api/common/common";
import { filterTime } from "@/utils/filtration";
import EleTable from "@/components/eleTable/index.vue";
import ELeForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { EleTable, ELeForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      endTime?: string;
      limit: number;
      page: number;
      startTime?: string;
    }
    const ROUTE = useRoute();
    let DATA: any = reactive({
      defaultTime: "",
      getPageObj: {
        content: "",
        endTime: undefined,
        limit: 10,
        page: 1,
        startTime: undefined
      },
      getPageObjCopy: {
        content: "",
        endTime: undefined,
        limit: 10,
        page: 1,
        startTime: undefined
      },
      total: 0,
      value: "",
      tableData: [],
      renderTable: [
        {
          label: "序号",
          type: "text",
          fixed: "left",
          formatter: (row: any, column: any, cellValue: any, index: any) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "用户名",
          type: "text",
          prop: "username"
        },
        {
          label: "用户操作",
          type: "text",
          prop: "operation"
        },
        {
          label: "用户IP",
          type: "text",
          prop: "ip"
        },
        {
          label: "操作时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return filterTime(row.createTime, "/");
          }
        }
      ],
      isSearchBtn: false,
      loading: false
    });
    let METHODS: any = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
      },
      handelGetLog: async (getPageObj: Params) => {
        DATA.loading = true;
        try {
          let { data }: any = await getLog(getPageObj);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.total = data.data.total;
            DATA.tableData = data.data.records;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      handleSearch: () => {
        DATA.getPageObj.page = 1;
        if (DATA.value != null && DATA.value.length > 0) {
          DATA.getPageObj.startTime = filterTime(DATA.value[0], "/");
          DATA.getPageObj.endTime = filterTime(DATA.value[1], "/");
        }
        if (DATA.value === null) {
          DATA.getPageObj.startTime = null;
          DATA.getPageObj.endTime = null;
        }

        DATA.getPageObjCopy = Object.assign({}, DATA.getPageObj);
        METHODS.handelGetLog(DATA.getPageObjCopy);
      },
      handleSizeChange: (val: any) => {
        var aggregate = DATA.getPageObj.page * DATA.getPageObj.limit;
        if (aggregate > DATA.total) {
          aggregate = DATA.total;
        }
        DATA.getPageObjCopy.limit = val;
        DATA.getPageObj.limit = val;
        var size = Math.ceil(aggregate / DATA.getPageObj.limit);
        if (size <= 0) {
          DATA.getPageObj.page = 1;
          DATA.getPageObjCopy.page = 1;
        } else {
          DATA.getPageObj.page = size;
          DATA.getPageObjCopy.page = size;
        }
        METHODS.handelGetLog(DATA.getPageObjCopy);
      },
      handleCurrentChange: (val: any) => {
        DATA.getPageObj.page = val;
        DATA.getPageObjCopy.page = val;
        METHODS.handelGetLog(DATA.getPageObjCopy);
      }
    });
    // 设置默认时间 是当前月在右边显示
    DATA.defaultTime = new Date();
    DATA.defaultTime.setMonth(new Date().getMonth() - 1);
    onMounted(() => {
      METHODS.handelGetLog(DATA.getPageObjCopy);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS)
    };
  }
});
</script>
<style lang="scss" scoped>
.container {
  .container_head {
    justify-content: flex-end;
    .container_head_item {
      width: 600px;
    }
    .el-input {
      margin-right: 10px;
    }
    .el-button {
      margin-left: 10px;
    }
    .el-date-editor {
      width: 200px;
    }
  }
}
</style>