<template>
  <el-row class="container_host">
    <el-col
      :span="24"
      type="flex"
    >
      <el-row>
        <el-col
          :span="9"
          :offset="15"
          class="d_flex host_head"
        >
          <el-select
            v-model="pagingParams.status"
            placeholder="全部状态"
            clearable
          >
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.statusName"
              :value="item.status"
            >
            </el-option>
          </el-select>
          <el-input
            placeholder="主机名、主机编号"
            v-model="pagingParams.content"
            clearable
            style="margin-left:10px;width:200px"
          ></el-input>
          <el-button
            type="primary"
            style="margin-left:10px"
            @click="handleSearch"
          ><i class="el-icon-search"></i></el-button>
          <el-button
            type="primary"
            @click="handleCreateHost"
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
          v-loading="dialogLoading"
          :renderFormArr="renderFormArr"
          :formData="formData"
          :rules="formRules"
          :labelWidth="120"
          :options="options"
          :refForm="'refForm'"
          ref="refForm"
          class="dialogForm"
        >
          <template #region>
            <div style="display: flex;">
              <!-- 省 -->
              <el-select
                v-model="formData.provinceCode"
                placeholder="选择省"
                class="mr-10"
                clearable
                @change="handleChanegProvince"
              >
                <el-option
                  v-for="item in provinceList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </el-option>
              </el-select>
              <!-- 市 -->
              <el-select
                v-model="formData.cityCode"
                placeholder="选择市"
                class="mr-10"
                clearable
                @change="handleChanegCity"
              >
                <el-option
                  v-for="item in cityList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </el-option>
              </el-select>
              <!-- 区/县 -->
              <el-select
                v-model="formData.countyCode"
                placeholder="选择区/县"
                clearable
              >
                <el-option
                  v-for="item in countyList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </el-option>
              </el-select>
            </div>
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
      <!-- 主机删除模态框 -->
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
              <h4 style="font-size:16px">删除此主机会删除以下数据</h4>
              <p style="font-size:16px">下属通道<i style="color:red;font-size:16px">{{daleteHostData.channelCount}}</i>条</p>
              <p style="font-size:16px">关联母线槽<i style="color:red;font-size:16px">{{daleteHostData.busWayCount}}</i>条</p>
              <p style="font-size:16px">关联母线槽分段<i style="color:red;font-size:16px">{{daleteHostData.sectionBusWayCount}}</i>条</p>
              <p style="font-size:16px">关联节点<i style="color:red;font-size:16px">{{daleteHostData.nodeCount}}</i>条</p>
              <p style="font-size:16px">报警记录<i style="color:red;font-size:16px">{{daleteHostData.warningCount}}</i>条</p>
              <p style="font-size:16px">报警数据<i style="color:red;font-size:16px">{{daleteHostData.warningDataCount}}</i>条</p>
              <p style="font-size:16px">及其他相关数据是否确认删除</p>
            </div>
          </div>
          <div style="text-align:right">
            <el-button @click="deleteDialogVisible=false">取消</el-button>
            <el-button
              type="primary"
              @click="handleDeleceConfirm"
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
  createHost,
  deleteHost,
  findByPageHost,
  findByUid,
  findHostData,
  findHostList,
  updateHost,
} from '@/api/router/host';
import {
  getAllProvince,
  getCityCodeCounty,
  getProvinceCodeCity,
} from '@/api/region';
import { RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { useStore } from 'vuex';
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      limit: number;
      page: number;
      status?: boolean;
      type?: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    // 验证uid
    let validateUid = async (rule: any, value: any, callback: any) => {
      if (!DATA.dialogType && DATA.uid === value) {
        callback();
        return;
      }

      if (/^[a-zA-Z\d]+$/.test(value)) {
        let { data } = await findByUid({ uid: DATA.formData.uid.trim() });
        data.code === 500
          ? callback(new Error('该主机编号已存在'))
          : callback();
      } else {
        callback(new Error('主机编号只能为英文数字组成'));
      }
    };
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        status: '',
        type: '',
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        status: '',
        type: '',
      },
      statusList: [
        {
          status: false,
          statusName: '离线',
        },
        {
          status: true,
          statusName: '在线',
        },
      ],
      loading: false,
      /** 表格 */
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
          label: '主机名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '主机唯一编号',
          prop: 'uid',
          type: 'text',
        },
        // {
        //   label: '主机类型',
        //   prop: 'types',
        //   type: 'text',
        //   formatter: (row: any) => {
        //     let type: string[] = [];
        //     DATA.hostTypeList.forEach((item: any) => {
        //       if (row.types.includes(item.type)) {
        //         type.push(item.typeName);
        //       }
        //     });
        //     return type.join(',');
        //   },
        // },
        {
          label: '地址',
          prop: 'showAddress',
          type: 'text',
        },
        {
          label: '状态',
          prop: 'isOnline',
          type: 'tag',
          formatter: (row: any) => {
            let tagInfo = {
              tagType: row.isOnline ? 'success' : 'danger',
              text: '',
            };
            row.isOnline === true
              ? (tagInfo.text = '在线')
              : (tagInfo.text = '离线');
            return tagInfo;
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: 200,
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
      // 主机类型列表
      hostTypeList: [],
      /** 表单添加、编辑 */
      dialogType: false,
      dialogTitle: '',
      dialogFormVisible: false,
      renderFormArr: [
        {
          label: '主机名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '主机唯一编号',
          type: 'input',
          prop: 'uid',
        },
        // {
        //   label: '主机类型',
        //   type: 'select',
        //   prop: 'types',
        //   multiple: true,
        //   title: 'typeName',
        //   value: 'type',
        //   disabled: true,
        // },
        {
          label: '地区',
          type: 'slot',
          slotName: 'region',
        },
        {
          label: '地址',
          type: 'input',
          prop: 'address',
        },
      ],
      formData: {
        address: '',
        cityCode: null,
        countyCode: null,
        name: '',
        isOnline: false,
        provinceCode: null,
        uid: '',
      },
      formRules: {
        name: [{ required: true, message: '请输入主机名称', trigger: 'blur' }],
        uid: [
          { required: true, message: '请输入主机编号', trigger: 'blur' },
          { validator: validateUid, trigger: 'blur' },
        ],
      },
      options: {},
      uid: '',
      // 省
      provinceList: [],
      cityList: [],
      countyList: [],
      dialogLoading: false,
      /** 删除主机 */
      deleteDialogVisible: false,
      deleteLoading: false,
      daleteHostData: {},
      deleteId: '',
    });
    let METHODS: any = reactive({
      // 获取主机列表
      handleGetHostList: async () => {
        let { data } = await findHostList();
        if (data.code === RES_SUCCESS) {
          STORE.commit('setHostList', data.data);
        }
      },
      // 分页获取主机列表
      handleGetFindHostList: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await findByPageHost(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.total = data.data.total;
            DATA.tableData = data.data.records;
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
        METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
      },
      // 切换分页页数
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
      },
      // 搜索主机
      handleSearch: async () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        await METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
      },
      // 主机类型列表
      // handleGetHostTypeList: async () => {
      //   let { data } = await findHostType();
      //   if (data.code === RES_SUCCESS) {
      //     DATA.hostTypeList = data.data;
      //     DATA.options.types = data.data;
      //   }
      // },
      // 获取所有省
      handleGetAllProvince: async () => {
        let { data } = await getAllProvince();
        if (data.code === RES_SUCCESS) {
          DATA.provinceList = data.data;
        }
      },
      // 切换省
      handleChanegProvince: async () => {
        // 清空城市、区县
        DATA.cityList = [];
        DATA.countyList = [];
        DATA.formData.cityCode = null;
        DATA.formData.countyCode = null;
        // 根据省获取市
        METHODS.handleProvinceCodeCity(DATA.formData.provinceCode);
      },
      // 切换市
      handleChanegCity: async () => {
        // 清空城市、区县
        DATA.countyList = [];
        DATA.formData.countyCode = null;
        // 根据市获取区
        METHODS.handleCityCodeCounty(DATA.formData.cityCode);
      },
      // 根据省获取市
      handleProvinceCodeCity: async (code: number) => {
        let { data } = await getProvinceCodeCity({ code });
        if (data.code === RES_SUCCESS) {
          DATA.cityList = data.data;
        }
      },
      // 根据市获取区
      handleCityCodeCounty: async (code: number) => {
        let { data } = await getCityCodeCounty({ code });
        if (data.code === RES_SUCCESS) {
          DATA.countyList = data.data;
        }
      },
      // 获取主机 关联数据
      handleAssociatedData: async (id: number) => {
        let { data } = await findHostData({ id });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 添加主机
      handleCreateHost: () => {
        DATA.dialogFormVisible = true;
        DATA.dialogType = true;
        DATA.dialogTitle = '添加';
        DATA.cityList = [];
        DATA.countyList = [];
        DATA.formData = Object.assign(
          {},
          {
            address: '',
            cityCode: '',
            countyCode: '',
            name: '',
            isOnline: false,
            provinceCode: '',
            uid: '',
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
            DATA.dialogLoading = true;
            let {
              id,
              address,
              cityCode,
              countyCode,
              name,
              isOnline,
              provinceCode,
              uid,
            } = Object.assign({}, row);
            DATA.formData = {
              id,
              address,
              cityCode,
              countyCode,
              name,
              isOnline,
              provinceCode,
              uid,
            };
            DATA.uid = uid;
            await METHODS.handleProvinceCodeCity(provinceCode);
            await METHODS.handleCityCodeCounty(cityCode);
            DATA.dialogLoading = false;
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'delete':
            DATA.deleteLoading = true;
            DATA.daleteHostData = await METHODS.handleAssociatedData(row.id);
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
        let handleCreateHost = async () => {
          let { data } = await createHost(DATA.formData);
          if (data.code === RES_SUCCESS) {
            DATA.dialogFormVisible = false;
            METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
            METHODS.handleGetHostList();
            ElMessage({
              message: '主机添加成功',
              type: 'success',
            });
          }
        };
        let handleEditHost = async () => {
          delete DATA.formData.createTime;
          delete DATA.formData.updateTime;
          let { data } = await updateHost(DATA.formData);
          if (data.code === RES_SUCCESS) {
            DATA.dialogFormVisible = false;
            METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
            METHODS.handleGetHostList();
            ElMessage({
              message: '主机编辑成功',
              type: 'success',
            });
          }
        };

        proxy.$refs['refForm'].submitForm().then((res: boolean) => {
          if (res) {
            if (DATA.dialogType) {
              handleCreateHost();
            } else {
              handleEditHost();
            }
          }
        });
      },
      // 确认删除主机
      handleDeleceConfirm: async () => {
        let { data } = await deleteHost({ id: DATA.deleteId });
        if (data.code === RES_SUCCESS) {
          DATA.deleteLoading = false;
          ElMessage({
            message: '删除成功',
            type: 'success',
          });
          METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
          METHODS.handleGetHostList();
          DATA.deleteDialogVisible = false;
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetFindHostList(DATA.pagingParamsCopy);
      // METHODS.handleGetHostTypeList();
      METHODS.handleGetAllProvince();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.container_host {
  .host_head {
    justify-content: flex-end;
    /deep/ .el-input__inner {
      width: 200px;
    }
  }
}
.dialogForm {
  width: 100%;
}
</style>