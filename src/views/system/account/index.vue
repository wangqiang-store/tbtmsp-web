<template>
  <div class="account">
    <el-row
      type="flex"
      class="row-bg"
      justify="end"
    >
      <el-col
        :span="4"
        style="margin-right:15px"
      >
        <el-input
          placeholder="用户名称搜索"
          v-model="pagingParams.content"
          clearable
        ></el-input>
      </el-col>
      <el-col
        :span="0.8"
        style="text-align:right"
      >
        <el-button
          type="primary"
          @click="handleSearch"
        ><i class="el-icon-search"></i></el-button>
      </el-col>
      <el-col
        :span="1.5"
        style="text-align:right;margin-left:10px"
      >
        <el-button
          type="primary"
          @click="handleCreateUser"
        ><i class="el-icon-plus"></i> 添加</el-button>
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
          :btnList="btnList"
          :isborder="true"
          :renderTable="renderTable"
          @handleBtnEvent="handleBtnEvent"
          @handleEmitChange="handleEmitChange"
        >
        </ele-table>
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
    <!-- 添加用户模态框 -->
    <el-dialog
      title="创建"
      v-model="dialogAddFormVisible"
      :close-on-click-modal="false"
      width="40%"
    >
      <ele-form
        :renderFormArr="renderAddFormArr"
        :formData="addFormData"
        :rules="addFormRules"
        :labelWidth="100"
        :options="options"
        :refForm="'addForm'"
        ref="addForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmAddUser"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑用户模态框 -->
    <el-dialog
      title="编辑"
      v-model="dialogEditFormVisible"
      :close-on-click-modal="false"
      width="40%"
    >
      <ele-form
        :renderFormArr="renderEditFormArr"
        :formData="editFormData"
        :rules="editFormRules"
        :labelWidth="100"
        :options="options"
        :refForm="'editForm'"
        ref="editForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmEditUser"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 用户详情 -->
    <el-dialog
      title="详情"
      v-model="dialogDetailsFormVisible"
    >
      <el-descriptions
        class="margin-top"
        :column="3"
        border
      >
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>
            用户名
          </template>
          {{ detailsData.username || '无' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>
            名称
          </template>
          {{ detailsData.name || '无' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-mobile-phone"></i>
            手机号
          </template>
          {{ detailsData.phone || '无'}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-message"></i>
            邮箱
          </template>
          {{ detailsData.email || '无' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-tickets"></i>
            商场区域
          </template>
          <el-tag size="small">{{ detailsData.unitName || '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-s-check"></i>
            角色
          </template>
          <el-tag size="small"> {{ detailsData.roleName || '无' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>
            创建者
          </template>
          <el-tag size="small"> {{ detailsData.createUser || '无' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  nextTick,
  computed,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import {
  checkRepeat,
  createUser,
  enableUser,
  getUnit,
  resetPassword,
  sysUserSearch,
  updateUser,
} from '@/api/system/sysUser/index';
import { RES_SUCCESS } from '@/api/common/common';
import md5 from 'js-md5';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus/lib';
import { verifyEmail, verifyPhone, verifyPwd } from '@/api/common/verify';
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      content?: string;
      limit: number;
      page: number;
      roleId?: number;
      unitId?: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    var validatePass = (rule: any, value: any, callback: any) => {
      if (value.length < 8) {
        callback(new Error('密码长度至少8位'));
      } else {
        if (verifyPwd.test(value)) {
          callback();
        } else {
          callback(new Error('密码至少包含数字、字母、特殊字符两种'));
        }
      }
    };
    var validatePass2 = (rule: any, value: any, callback: any) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== DATA.addFormData.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    var repeatName = (rule: any, value: any, callback: any) => {
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
        if (DATA.username == value) {
          callback();
          return;
        }

        checkRepeat({ username: value }).then((res) => {
          if (res.data.code == 500) {
            callback(new Error('用户名重复，请重新输入'));
          } else {
            callback();
          }
        });
      } else {
        callback(
          new Error('用户名仅支持英文和数字且开头为英文,不允许输入特殊符号')
        );
      }
    };
    const validateEmail = (rule: any, value: any, callback: any) => {
      if (value === '' || value === null) {
        callback();
      } else {
        if (verifyEmail.test(value)) {
          callback();
        } else {
          callback(new Error('邮箱格式不正确'));
        }
      }
    };
    const validatePhone = (rule: any, value: any, callback: any) => {
      if (value === '' || value === null) {
        callback();
      }
      verifyPhone.test(value)
        ? callback()
        : callback(new Error('电话格式不正确'));
    };
    let DATA: any = reactive({
      pagingParams: {
        content: '',
        limit: 10,
        page: 1,
        roleId: null,
        unitId: null,
      },
      pagingParamsCopy: {
        content: '',
        limit: 10,
        page: 1,
        roleId: null,
        unitId: null,
      },
      tableData: [],
      btnList: [
        {
          text: '详情',
          type: 'primary',
          handleType: 'info',
        },
        {
          text: '编辑',
          type: 'primary',
          handleType: 'edit',
        },
        {
          text: '重置密码',
          type: 'danger',
          handleType: 'resetPwd',
        },
      ],
      total: 0,
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
          label: '用户名',
          type: 'text',
          prop: 'username',
        },
        {
          label: '名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '角色',
          type: 'text',
          prop: 'roleName',
        },
        {
          label: '商场区域',
          type: 'text',
          prop: 'unitName',
        },
        {
          label: '创建者',
          type: 'text',
          prop: 'createUser',
        },
        {
          label: '是否启用',
          type: 'switch',
          prop: 'isEnable',
          condition: (row: any) => {
            return { isdisable: row.roleId === 1 };
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: '300',
        },
      ],
      loading: false,
      /* 添加用户 */
      dialogAddFormVisible: false,
      renderAddFormArr: [
        {
          label: '用户名',
          type: 'input',
          prop: 'username',
        },
        {
          label: '名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '密码',
          type: 'input',
          prop: 'password',
          inputType: 'password',
        },
        {
          label: '确认密码',
          type: 'input',
          prop: 'confirmPwd',
          inputType: 'password',
        },
        {
          label: '角色',
          type: 'select',
          prop: 'roleId',
          title: 'name',
          value: 'id',
        },
        {
          label: '商场区域',
          type: 'select',
          prop: 'unitId',
          title: 'name',
          value: 'id',
          clearable: true,
        },
        {
          label: '邮箱',
          type: 'input',
          prop: 'email',
        },
        {
          label: '电话',
          type: 'input',
          prop: 'phone',
        },
      ],
      /* 表单数据 */
      addFormData: {
        email: '',
        isEnable: true,
        isUnit: '',
        name: '',
        password: '',
        phone: '',
        roleId: '',
        secret: '',
        unitId: '',
        username: '',
        confirmPwd: '',
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: repeatName, trigger: 'blur', required: true },
          {
            pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$/,
            message: '不允许输入特殊符号',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'change' },
        ],
        confirmPwd: [
          { validator: validatePass2, trigger: 'blur', required: true },
        ],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        phone: [{ validator: validatePhone, trigger: 'blur' }],
      },
      options: {},
      /*编辑用户*/
      dialogEditFormVisible: false,
      renderEditFormArr: [],
      editFormData: {},
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: repeatName, trigger: 'blur', required: true },
          {
            pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$/,
            message: '不允许输入特殊符号',
          },
        ],
        password: [
          { validator: validatePass, trigger: 'blur', required: true },
        ],
        confirmPwd: [
          { validator: validatePass2, trigger: 'blur', required: true },
        ],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        phone: [{ validator: validatePhone, trigger: 'blur' }],
      },
      username: '',
      /* 用户详情 */
      dialogDetailsFormVisible: false,
      detailsData: {},
    });
    let METHODS: any = reactive({
      // 获取用户数据
      handleGetUser: async (pagingParams: Params) => {
        let userData: any[] = [];
        DATA.loading = true;
        try {
          let { data } = await sysUserSearch(pagingParams);
          if (data.code === RES_SUCCESS) {
            DATA.total = data.data.total;
            DATA.loading = false;
            if (data.data.records.length > 0) {
              data.data.records.forEach((item: any) => {
                userData.push({
                  createUser: item.createUser,
                  roleName: item.roleName,
                  unitName: item.unitName,
                  ...item.sysUser,
                });
              });
            }
            DATA.tableData = userData;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      // 修改分页显示个数
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
        METHODS.handleGetUser(DATA.pagingParamsCopy);
      },
      // 修改分页当前页面
      handleCurrentChange: (val: number) => {
        DATA.pagingParams.page = val;
        DATA.pagingParamsCopy.page = val;
        METHODS.handleGetUser(DATA.pagingParamsCopy);
      },
      // 获取当前用户单位列表
      handleGetUnit: async () => {
        let { data } = await getUnit();
        if (data.code === RES_SUCCESS) {
          DATA.options.unitId = data.data;
        }
      },
      // 搜索用户
      handleSearch: () => {
        DATA.pagingParams.page = 1;
        DATA.pagingParamsCopy = Object.assign({}, DATA.pagingParams);
        METHODS.handleGetUser(DATA.pagingParamsCopy);
      },
      // 添加用户
      handleCreateUser: () => {
        DATA.dialogAddFormVisible = true;
        DATA.addFormData = Object.assign(
          {},
          {
            createId: '',
            createTime: '',
            email: '',
            isEnable: true,
            isUnit: '',
            loginFailTime: '',
            name: '',
            password: '',
            phone: '',
            roleId: '',
            secret: '',
            unitId: STORE.state.user.units.isUnit
              ? STORE.state.user.units.unitId
              : '',
            updatePwdTime: '',
            updateTime: '',
            username: '',
            confirmPwd: '',
          }
        );
        nextTick(() => {
          proxy.$refs['addForm'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'info':
            DATA.dialogDetailsFormVisible = true;
            DATA.detailsData = Object.assign({}, row);
            break;
          case 'edit':
            DATA.dialogEditFormVisible = true;
            let {
              id,
              email,
              isEnable,
              isUnit,
              name,
              phone,
              roleId,
              secret,
              unitId,
              username,
            } = Object.assign({}, row);
            DATA.username = username;
            DATA.renderEditFormArr = [
              {
                label: '用户名',
                type: 'input',
                prop: 'username',
                disabled: true,
              },
              {
                label: '名称',
                type: 'input',
                prop: 'name',
              },
              {
                label: '角色',
                type: 'select',
                prop: 'roleId',
                title: 'name',
                value: 'id',
              },
              {
                label: '商场区域',
                type: 'select',
                prop: 'unitId',
                title: 'name',
                value: 'id',
                clearable: true,
              },
              {
                label: '邮箱',
                type: 'input',
                prop: 'email',
              },
              {
                label: '电话',
                type: 'input',
                prop: 'phone',
              },
            ];
            DATA.editFormData = {
              id,
              email,
              isEnable,
              isUnit,
              name,
              phone,
              roleId,
              secret,
              unitId,
              username,
            };
            nextTick(() => {
              proxy.$refs['editForm'].clearForm();
            });
            break;
          case 'resetPwd':
            proxy
              .$confirm('是否确定重置密码', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                resetPassword({ userId: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '重置密码成功!',
                    });
                  }
                });
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      // switch
      handleEmitChange: async (item: any, val: any) => {
        let { data } = await enableUser({ userId: item.id });
        if (data.code === RES_SUCCESS) {
          let Obj: any = {
            message: (bool: boolean): string => {
              return bool ? '启用成功' : '不启用成功';
            },
          };
          ElMessage({
            message: Obj.message(item.isEnable),
            type: 'success',
          });
        }
      },
      // 确认添加用户
      handleConfirmAddUser: async () => {
        proxy.$refs['addForm'].submitForm().then((res: any) => {
          if (res) {
            DATA.addFormData.password = md5(DATA.addFormData.password);
            let {
              email,
              isEnable,
              isUnit,
              name,
              password,
              phone,
              roleId,
              secret,
              unitId,
              username,
            } = DATA.addFormData;
            createUser({
              email,
              isEnable,
              isUnit,
              name,
              password,
              phone,
              roleId,
              secret,
              unitId,
              username,
            }).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '添加成功',
                  type: 'success',
                });
                DATA.dialogAddFormVisible = false;
                METHODS.handleGetUser(DATA.pagingParamsCopy);
              }
            });
          }
        });
      },
      // 确认编辑用户
      handleConfirmEditUser: () => {
        proxy.$refs['editForm'].submitForm().then((res: any) => {
          if (res) {
            updateUser(DATA.editFormData).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '编辑成功',
                  type: 'success',
                });
                DATA.dialogEditFormVisible = false;
                METHODS.handleGetUser(DATA.pagingParamsCopy);
                // 判断 是否操作当前用户
                if (STORE.state.user.userId === DATA.editFormData.id) {
                  history.go(0);
                }
              }
            });
          }
        });
      },
    });
    onMounted(() => {
      METHODS.handleGetUser(DATA.pagingParamsCopy);
      METHODS.handleGetUnit();
      DATA.options.roleId = JSON.parse(
        JSON.stringify(STORE.state.data.roleList)
      );
      if (DATA.options.roleId.length > 0) {
        (DATA.options.roleId as []).forEach((item: any) => {
          if (item.id === 1 && STORE.state.user.roleId !== 1) {
            item.disabled = true;
          }
          if (item.isEnable === false) {
            item.disabled = true;
          }
        });
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.details_item {
  margin-bottom: 10px;
  span {
    margin-left: 10px;
  }
}
</style>