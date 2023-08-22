<template>
  <el-row>
    <el-col :span="24">
      <el-row>
        <el-col
          :span="24"
          class="d_flex d_flex_end"
        >
          <el-autocomplete
            style="margin-right:10px;width:200px"
            v-model="pagingParams.content"
            :fetch-suggestions="querySearch"
            clearable
            placeholder="商场区域"
          ></el-autocomplete>
          <el-select
            v-model="pagingParams.state"
            clearable
            placeholder="发送状态"
            class="mr-10"
          >
            <el-option
              v-for="val in statusList"
              :key="val.id"
              :label="val.typeName"
              :value="val.type"
            >
            </el-option>
          </el-select>
          <el-button
            type="primary"
            @click="handleSearch"
          ><i class="el-icon-search"></i></el-button>
        </el-col>
      </el-row>
      <el-row class="mt-10">
        <el-col :span="24">
          <ele-table
            v-loading="loading"
            :tableData="tableData"
            :renderTable="renderTable"
            :isborder="true"
          ></ele-table>
          <ele-pagination
            :total="total"
            :currentPage="pagingParamsCopy.page"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          ></ele-pagination>
        </el-col>
      </el-row>
    </el-col>
  </el-row>

</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { filterTime } from '@/utils/filtration';
import { findByPage, findSendType } from '@/api/dreamSend/sendRecord';
import { RES_SUCCESS } from '@/api/common/common';
import { useStore } from 'vuex';
import { getUnit } from '@/api/system/sysUser/index';
export default defineComponent({
  components: { EleTable, ElePagination },
  setup() {
    interface Params {
      content?: string;
      limit: number;
      page: number;
      state?: number;
    }
    const STORE = useStore();
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        state: '',
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        state: '',
      },
      statusList: [],
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
          label: '商场区域',
          type: 'text',
          prop: 'unitName',
        },
        {
          label: '短信发送内容',
          type: 'text',
          prop: 'smsContent',
        },
        {
          label: '接收短信号码',
          prop: 'smsNumber',
          type: 'multilineText',
          formatter: (row: any) => {
            let smsNumber;
            if (row.smsNumber) {
              smsNumber = row.smsNumber.replace(/,/g, (kerword: string) => {
                return `${kerword}<br>`;
              });
            }
            return smsNumber;
          },
        },
        {
          label: '发送时间',
          type: 'text',
          prop: 'updateTime',
          formatter: (row: any) => {
            return filterTime(row.updateTime, '/');
          },
        },
        {
          label: '发送状态',
          type: 'tag',
          prop: 'state',
          formatter: (row: any) => {
            let tag = {
              text: '',
              tagType: '',
            };
            DATA.statusList.forEach((item: any) => {
              if (row.state === item.type) {
                tag.text = item.typeName;
              }
            });
            switch (row.state) {
              case 1:
                tag.tagType = 'warning';
                break;
              case 2:
                tag.tagType = 'danger';
                break;
              case 3:
                tag.tagType = 'success';
                break;
              default:
                break;
            }
            return tag;
          },
        },
        {
          label: '备注',
          type: 'text',
          prop: 'remark',
        },
      ],
      total: 0,
      unitList: []
    });
    let METHODS = reactive({
      // 分页获取发送记录
      hendleGetPagingData: async (pagingParams: Params) => {
        DATA.loading = true;
        let { data } = await findByPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.hendleGetPagingData(DATA.pagingParamsCopy);
      },
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
        METHODS.hendleGetPagingData(DATA.pagingParamsCopy);
      },
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.hendleGetPagingData(DATA.pagingParamsCopy);
      },
      // 获取短信状态列表
      handleGetStatus: async () => {
        let { data } = await findSendType();
        if (data.code === RES_SUCCESS) {
          DATA.statusList = data.data;
        }
      },
      // 获取商场区域列表
      getgetUnitList: async () => {
        let { data } = await getUnit();
        if (data.code === RES_SUCCESS) {
          if (data.data.length > 0) {
            data.data.forEach((item: any) => {
              item.value = item.name;
            });
          }
          DATA.unitList = data.data
        }
      },
      querySearch: async (queryString: string, cb: any) => {
        var results = queryString
          ? (DATA.unitList as Array<any>).filter(
              (restaurant) => {
                return restaurant.name.indexOf(queryString) !== -1;
              }
            )
          : DATA.unitList;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
    });
    onMounted(() => {
      METHODS.hendleGetPagingData(DATA.pagingParams);
      METHODS.handleGetStatus();
      METHODS.getgetUnitList()
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>

<style scoped lang="scss">
</style>