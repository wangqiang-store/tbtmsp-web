<template>
  <el-row>
    <el-col :span="24">
      <el-row type="flex" justify="end">
        <el-col :span="9" class="d_flex d_flex_end">
          <!-- <el-input
            placeholder="商场区域"
            v-model="pagingParams.content"
            style="margin-right:10px;width:200px"
          ></el-input> -->
          <el-autocomplete style="margin-right:10px;width:200px" v-model="pagingParams.content"
            :fetch-suggestions="querySearch" clearable placeholder="商场区域"></el-autocomplete>
          <!-- <el-select
            v-model="pagingParams.reviewId"
            clearable
            filterable
            placeholder="审核状态"
          >
            <el-option
              v-for="val in statusList"
              :key="val.id"
              :label="val.typeName"
              :value="val.type"
            >
            </el-option>
          </el-select> -->
          <el-button type="primary" style="margin-left:10px" @click="handleSearch"><i
              class="el-icon-search"></i></el-button>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="24" class="mt-10">
      <ele-table :tableData="tableData" :renderTable="renderTable" :btnList="btnList" :isborder="true"
        v-loading="loading" @handleBtnEvent="handleBtnEvent"></ele-table>
      <ele-pagination :total="total" :currentPage="pagingParamsCopy.page" @handleCurrentChange="handleCurrentChange"
        @handleSizeChange="handleSizeChange"></ele-pagination>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  nextTick
} from 'vue';
import { getUnit } from '@/api/system/sysUser/index';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { findByPage, findReviewType } from '@/api/dreamSend/dreamSend';
import { RES_SUCCESS } from '@/api/common/common';
import { filterTime } from '@/utils/filtration';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: { EleTable, ElePagination },
  setup() {
    interface Params {
      content?: string;
      reviewId?: number | undefined;
      limit: number;
      page: number;
    }
    // 获取vue实例对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    // 基础数据
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        reviewId: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: '',
        reviewId: '',
        limit: 10,
        page: 1,
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
          label: '短信模板内容',
          type: 'text',
          prop: 'smsContent',
          // tooltip: false,
        },
        {
          label: '维保联系方式',
          type: 'multilineText',
          prop: 'maintenanceContact',
          formatter: (row: any) => {
            let maintenanceContact;
            if (row.maintenanceContact) {
              maintenanceContact = row.maintenanceContact.replace(
                /,/g,
                (kerword: string) => {
                  return `${kerword}<br>`;
                }
              );
            }
            return maintenanceContact;
          },
        },
        {
          label: '保存时间',
          type: 'text',
          prop: 'updateTime',
          formatter: (row: any) => {
            return filterTime(row.updateTime, '/');
          },
        },
        // {
        //   label: '审核',
        //   type: 'tag',
        //   prop: 'templateStatus',
        //   formatter: (row: any) => {
        //     let tag = {
        //       text: '',
        //       tagType: '',
        //     };
        //     DATA.statusList.forEach((item: any) => {
        //       if (row.templateStatus == item.type) {
        //         tag.text = item.typeName;
        //       }
        //     });
        //     switch (row.templateStatus) {
        //       case 0:
        //         tag.tagType = 'warning';
        //         break;
        //       case 1:
        //         tag.tagType = 'success';
        //         break;
        //       case 2:
        //         tag.tagType = 'danger';
        //         break;
        //       default:
        //         break;
        //     }
        //     return tag;
        //   },
        // },
        // {
        //   label: '备注',
        //   type: 'text',
        //   prop: 'reason',
        //   // tooltip: false,
        // },
        {
          label: '操作',
          type: 'handle',
        },
      ],
      btnList: [
        {
          handleType: 'edit',
          condition: (row: any) => {
            let btnOption = {
              type: 'primary',
              isdisable: false,
              text: '编辑',
              size: 'small',
            };
            row.templateStatus === 0 && (btnOption.isdisable = true);
            return btnOption;
          },
        },
      ],
      total: 0,
      unitList: []
    });
    let METHODS = reactive({
      // 分页获取短信
      handleGetPagingData: async (pagingParams: Params) => {
        DATA.loading = true;
        let { data } = await findByPage(pagingParams);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetPagingData(DATA.pagingParamsCopy);
      },
      // 切换分页当前页面
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
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
      handleBtnEvent: ({ row, val }: any) => {
        if (val.handleType === 'edit') {
          STORE.commit('setSMSData', row);
          ROUTER.push({ name: 'dreamsetting' });
        }
      },
      // 获取状态列表
      handleGetStatusList: async () => {
        let { data } = await findReviewType();
        data.code === RES_SUCCESS && (DATA.statusList = data.data);
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
      METHODS.handleGetPagingData(DATA.pagingParams);
      METHODS.getgetUnitList()
      // METHODS.handleGetStatusList();
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