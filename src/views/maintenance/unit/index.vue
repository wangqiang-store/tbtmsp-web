<template>
  <el-row>
    <el-col :span="24">
      <el-row v-if="!STORE.state.user.units.isUnit">
        <el-col :span="24">
          <el-row
            type="flex"
            justify="end"
          >
            <el-col
              :span="6"
              class="d_flex unit_head"
            >
              <el-autocomplete
                style="margin-left:10px;width:200px"
                v-model="pagingParams.content"
                :fetch-suggestions="querySearch"
                clearable
                placeholder="商场区域"
              ></el-autocomplete>
              <el-button
                type="primary"
                style="margin-left:10px"
                @click="handleSearch"
              ><i class="el-icon-search"></i></el-button>
              <el-button
                type="primary"
                @click="handleCreateUnit"
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
        </el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="24">
          <el-card class="box-card">
            <template #header>
              <div class="card-header d_flex d_flex_sb">
                <span></span>
                <el-button
                  class="button"
                  type="text"
                  @click="handleConfirm"
                >保存</el-button>
              </div>
            </template>
            <ele-form
              v-loading="dialogLoading"
              :renderFormArr="renderFormArr"
              :formData="formData"
              :rules="formRules"
              :labelWidth="120"
              :refForm="'refForm'"
              ref="refForm"
              class="dialogForm"
            >
              <!-- 省市区 -->
              <!-- 
              <template #region>
                <div>
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
              -->
            </ele-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- 添加、编辑 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogFormVisible"
        width="40%"
        :close-on-click-modal="false"
      >
        <ele-form
          v-loading="dialogLoading"
          :renderFormArr="renderFormArr"
          :formData="formData"
          :rules="formRules"
          :labelWidth="130"
          :refForm="'refForm'"
          ref="refForm"
          class="dialogForm"
        >
          <!-- 省市区 -->
          <!--
          <template #region>
            <div>
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
          -->
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
      <!-- 电房-->
      <el-dialog
        title="电房权限"
        v-model="dialogElectricRoomVisible"
        width="40%"
      >
        <div v-loading="treeLoading">
          <el-tree
            :data="electricRoomList"
            show-checkbox
            default-expand-all
            :default-checked-keys="defaultCheckList"
            :check-on-click-node="true"
            node-key="id"
            ref="tree"
            highlight-current
            :props="defaultProps"
          >
          </el-tree>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogElectricRoomVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleElectricRoomConfirm"
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
  nextTick,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import {
  addDel,
  deleteUnit,
  findByPageUnit,
  findOneUnit,
  findUnitElectric,
  updateUnit,
} from '@/api/maintenance/unit';
import { RES_SUCCESS } from '@/api/common/common';
import {
  getAllProvince,
  getCityCodeCounty,
  getProvinceCodeCity,
} from '@/api/region';
import { getUnit } from '@/api/system/sysUser/index';
import { createUnit } from '@/api/maintenance/unit';
import { ElMessage } from 'element-plus/lib';
import { useStore } from 'vuex';
import { verifyPhones } from '@/api/common/verify';
import { handleGetUnitName } from '@/api/common/common';

export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    // 验证手机号
    const validatePhone = (rule: any, value: any, callback: any) => {
      let reg: any =
        /^(13[0-9]|15[0|1|3|6|7|8|9]|18[8|9])\d{8}$|^[0][1-9]{2,3}-[0-9]{5,10}$/;
      if (value === '') {
        callback();
      }
      reg.test(value)
        ? callback()
        : callback(new Error('请输入正确座机号码或手机号'));
    };
    // 验证维保手机号
    const validatePhones = (rule: any, value: any, callback: any) => {
      let phones: any = value.match(
        /(13[0-9]|15[0|1|3|6|7|8|9]|18[8|9])\d{8}/g
      );
      let isrepet: boolean = false;
      function isRepeat(arr: any) {
        var hash: any = {};
        for (var i in arr) {
          if (hash[arr[i]]) {
            return true;
          }
          // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
          hash[arr[i]] = true;
        }
        return false;
      }
      if (phones != null) {
        isrepet = isRepeat(phones);
      }
      verifyPhones.test(value.trim())
        ? isrepet
          ? callback('手机号重复')
          : callback()
        : callback(
            new Error(
              '手机号码格式不正确,手机号末尾不需要逗号,多个手机号用英文逗号隔开'
            )
          );
    };
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
      },
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
          label: '商场区域',
          type: 'text',
          prop: 'name',
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
          label: '操作',
          type: 'handle',
          width: 300,
        },
      ],
      btnList: [
        {
          type: 'success',
          text: '电房',
          handleType: 'electricRoom',
        },
        {
          type: 'primary',
          text: '编辑',
          handleType: 'edit',
        },
        {
          type: 'danger',
          text: '删除',
          handleType: 'delete',
        },
      ],
      total: 0,
      loading: false,
      /** 表单模态框 */
      dialogTitle: '',
      dialogFormVisible: false,
      dialogLoading: false,
      renderFormArr: [
        {
          label: '商场区域',
          type: 'input',
          prop: 'name',
        },
        // {
        //   label: '负责人',
        //   type: 'input',
        //   prop: 'principal',
        // },
        // {
        //   label: '负责人联系方式',
        //   type: 'input',
        //   prop: 'phone',
        // },
        // {
        //   label: '地区',
        //   type: 'slot',
        //   slotName: 'region',
        // },
        // {
        //   label: '地址',
        //   type: 'input',
        //   prop: 'address',
        // },
        {
          label: '维保联系方式',
          type: 'input',
          prop: 'maintenanceContact',
          placeholder: `多个手机号以英文“ , ”分割，格式如下：
132*****261,132*****262,132*****263`,
          inputType: 'textarea',
        },
      ],
      formData: {
        // address: '',
        // provinceCode: '',
        // cityCode: '',
        // countyCode: '',
        name: '',
        // phone: '',
        // principal: '',
        // showAddress: '',
        maintenanceContact: '',
      },
      formRules: {
        name: [{ required: true, message: '请输入商场区域', trigger: 'blur' }],
        // principal: [
        //   { required: true, message: '请输入单位负责人', trigger: 'blur' },
        // ],
        // phone: [{ validator: validatePhone, trigger: 'blur' }],
        maintenanceContact: [
          { required: true, message: '请输入维保联系方式', trigger: 'blur' },
          { validator: validatePhones, trigger: 'blur' },
        ],
      },
      /** 省市区 */
      provinceList: [],
      cityList: [],
      countyList: [],
      /** 电房 */
      electricRoomList: [],
      dialogElectricRoomVisible: false,
      defaultProps: {
        label: 'label',
      },
      defaultCheckList: [],
      checkedKeys: [],
      confirmCheckedKeys: [],
      electricRoomParams: {
        addList: [],
        delList: [],
        unitId: '',
      },
      treeLoading: false,
      UnitNameList: [],
      maintenanceContact: '',
      unitList: []
    });
    let METHODS: any = reactive({
      // 分页获取单位数据
      handleGetFindData: async (pagingParams: Params) => {
        DATA.loading = true;
        try {
          let { data } = await findByPageUnit(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.loading = false;
            DATA.tableData = data.data.records;
            DATA.total = data.data.total;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      // 获取单位信息
      handleUnitInfo: async () => {
        DATA.dialogType = false;
        DATA.dialogLoading = true;
        let { data } = await findOneUnit();
        if (data.code === RES_SUCCESS) {
          let {
            // address,
            // cityCode,
            // countyCode,
            id,
            name,
            // phone,
            // principal,
            // provinceCode,
            maintenanceContact,
          } = data.data;
          DATA.formData = {
            // address,
            // cityCode,
            // countyCode,
            id,
            name,
            // phone,
            // principal,
            // provinceCode,
            maintenanceContact,
          };
          // DATA.formData.provinceCode &&
          //   (await METHODS.handleProvinceCodeCity(DATA.formData.provinceCode));
          // DATA.formData.cityCode &&
          //   (await METHODS.handleCityCodeCounty(DATA.formData.cityCode));
          DATA.dialogLoading = false;
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
        METHODS.handleGetFindData(DATA.pagingParamsCopy);
      },
      // 切换分页当前页数
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleGetFindData(DATA.pagingParamsCopy);
      },
      // 搜索
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetFindData(DATA.pagingParamsCopy);
      },
      // 添加
      handleCreateUnit: () => {
        DATA.dialogTitle = '添加';
        DATA.dialogType = true;
        DATA.dialogFormVisible = true;
        DATA.formData = Object.assign(
          {},
          {
            address: '',
            provinceCode: '',
            cityCode: '',
            countyCode: '',
            name: '',
            phone: '',
            principal: '',
            showAddress: '',
          }
        );
        DATA.cityList = [];
        DATA.countyList = [];
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case 'electricRoom':
            DATA.treeLoading = true;
            DATA.electricRoomParams.unitId = row.id;
            DATA.defaultCheckList = [];
            DATA.dialogElectricRoomVisible = true;
            let { data } = await findUnitElectric({ unitId: row.id });
            if (data.code === RES_SUCCESS) {
              DATA.electricRoomList = METHODS.filtersTreeArr([], data.data);
              await data.data.forEach((item: any) => {
                item.disable && DATA.defaultCheckList.push(item.id);
              });
            }
            nextTick(() => {
              DATA.checkedKeys = proxy.$refs['tree'].getCheckedKeys();
              setTimeout(() => {
                DATA.treeLoading = false;
              }, 500);
            });
            break;
          case 'edit':
            DATA.dialogLoading = true;
            DATA.dialogTitle = '编辑';
            DATA.dialogType = false;
            DATA.dialogFormVisible = true;
            let {
              id,
              // address,
              // provinceCode,
              // cityCode,
              // countyCode,
              name,
              // phone,
              // principal,
              // showAddress,
              maintenanceContact,
            } = Object.assign({}, row);
            DATA.formData = Object.assign(
              {},
              {
                id,
                // address,
                // provinceCode,
                // cityCode,
                // countyCode,
                name,
                // phone,
                // principal,
                // showAddress,
                maintenanceContact,
              }
            );
            // await METHODS.handleProvinceCodeCity(provinceCode);
            // await METHODS.handleCityCodeCounty(cityCode);
            DATA.dialogLoading = false;
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm(
                '此操作将会永久删除, 并删除该商场区域关联的数据：短信模板和短信发送记录。是否继续?',
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }
              )
              .then(() => {
                deleteUnit({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handleGetFindData(DATA.pagingParamsCopy);
                    handleGetUnitName();
                  }
                });
              })
              .catch(() => {});
            break;

          default:
            break;
        }
      },
      // 确认添加。编辑
      handleConfirm: () => {
        DATA.maintenanceContact = (
          DATA.formData.maintenanceContact as string
        ).replace(/\n/g, () => {
          return '';
        });
        let createUnits = async () => {
          let { data } = await createUnit({
            ...DATA.formData,
            maintenanceContact: DATA.maintenanceContact,
          });
          if (data.code === RES_SUCCESS) {
            ElMessage({
              type: 'success',
              message: '商场区域添加成功,同时生成该商场区域默认短信模板',
            });
            METHODS.handleGetFindData(DATA.pagingParamsCopy);
            handleGetUnitName();
          }
        };
        let updateUnits = async () => {
          let { data } = await updateUnit({
            ...DATA.formData,
            maintenanceContact: DATA.maintenanceContact,
          });
          if (data.code === RES_SUCCESS) {
            ElMessage({
              type: 'success',
              message: '商场区域编辑成功',
            });
            if (STORE.state.user.units.isUnit) {
              METHODS.handleUnitInfo();
            } else {
              METHODS.handleGetFindData(DATA.pagingParamsCopy);
              handleGetUnitName();
            }
          }
        };
        proxy.$refs['refForm'].submitForm().then((valid: Boolean) => {
          if (valid) {
            if (DATA.dialogType) {
              createUnits();
            } else {
              updateUnits();
            }
            DATA.dialogFormVisible = false;
          }
        });
      },
      // 确认 电房权限
      handleElectricRoomConfirm: async () => {
        DATA.confirmCheckedKeys = proxy.$refs['tree'].getCheckedKeys();
        DATA.electricRoomParams.addList = DATA.confirmCheckedKeys.filter(
          (item: number) => {
            return DATA.checkedKeys.includes(item) === false;
          }
        );
        DATA.electricRoomParams.delList = DATA.checkedKeys.filter(
          (item: number) => {
            return DATA.confirmCheckedKeys.includes(item) === false;
          }
        );
        let { data } = await addDel(DATA.electricRoomParams);
        if (data.code === RES_SUCCESS) {
          ElMessage({
            message: '编辑成功',
            type: 'success',
          });
          DATA.dialogElectricRoomVisible = false;
        }
      },
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
      // 自定义生成树状权限数据
      filtersTreeArr: (arr: any, data: any) => {
        data.forEach((item: any) => {
          let obj = {
            id: item.id,
            label: item.name,
          };
          STORE.state.data.electricRoomList.forEach((val: any) => {
            if (item.id === val.id) {
              obj.label = val.name;
            }
          });
          arr.push(obj);
        });
        return arr;
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

        // var results = queryString
        //   ? (STORE.state.data.UnitNameList as Array<any>).filter(
        //       (restaurant) => {
        //         return restaurant.name.indexOf(queryString) !== -1;
        //       }
        //     )
        //   : STORE.state.data.UnitNameList;
        // // 调用 callback 返回建议列表的数据
        // cb(results);
      },
    });
    onMounted(() => {
      !STORE.state.user.units.isUnit &&
        METHODS.handleGetFindData(DATA.pagingParamsCopy);
      STORE.state.user.units.isUnit && METHODS.handleUnitInfo();
      METHODS.getgetUnitList()
      // METHODS.handleGetAllProvince();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
    };
  },
});
</script>
<style lang="scss" scoped>
.unit_head {
  justify-content: flex-end;
}
</style>