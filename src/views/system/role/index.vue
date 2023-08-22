<template>
  <div class="container">
    <div class="d_flex container_header">
      <el-input
        placeholder="请输入角色名称"
        v-model="searchRoleObj.content"
        class="container_header_input"
        clearable
        v-focus
      ></el-input>
      <el-button
        type="primary"
        @click="handleSearch"
      ><i class="el-icon-search"></i></el-button>
      <el-button
        type="primary"
        @click="handleAddRole"
      >添加</el-button>
    </div>
    <el-row>
      <el-col
        :span="24"
        class="contriner_body"
        v-loading="loading"
      >
        <ele-table
          :tableData="enableRoleArr"
          :renderTable="renderTable"
          :btnList="btnList"
          :isborder="true"
          @handleBtnEvent="handleBtnEvent"
          @handleEmitChange="handleEmitChange"
        ></ele-table>
      </el-col>
      <el-col :span="24">
        <ele-pagination
          :total="total"
          :currentPage="searchRoleObjCopy.page"
          @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"
        />
      </el-col>
    </el-row>
    <!-- 添加、编辑模态框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      :close-on-click-modal="false"
      width="40%"
    >
      <elementForm
        :renderFormArr="renderFormArr"
        :formData="roleFormObj"
        :rules="roleRules"
        :labelWidth="120"
        :refForm="'refForm'"
        ref="refForm"
      ></elementForm>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmRole"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 权限模态框 -->
    <el-dialog
      title="权限管理"
      v-model="dialogAuthVisible"
      @close="handleClose"
      width="40%"
    >
      <el-tree
        :data="authTreeArr"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        ref="treeRef"
        :default-checked-keys="checkedArr"
        v-if="isCheck"
      >
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAuthVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmAuth"
            :loading="authLoading"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  nextTick,
  inject,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { useStore } from 'vuex';
import { RES_SUCCESS } from '@/api/common/common';
import {
  getSysRole,
  addRole,
  updateRole,
  getRoleModule,
  roleModuleAddDel,
  getEnableRole,
  enableRoleModule,
} from '@/api/system/sysRole';
import elementForm from '@/components/eleForm/index.vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { getAllModule } from '@/api/system/sysModule';

export default defineComponent({
  components: { elementForm, EleTable, ElePagination },
  setup() {
    interface Params {
      content?: string;
      limit: number;
      page: number;
    }
    // 获取Store实例
    const STORE = useStore();
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const ROUTE = useRoute();
    // 检测角色名称 重复
    const validateRepeatRole = (rule: any, value: string, callback: any) => {
      if (!DATA.isAdd) {
        value === DATA.roleFormObj.name && callback();
      }
      callback();
    };
    let DATA: any = reactive({
      searchRoleObj: {
        content: '',
        limit: 10,
        page: 1,
      },
      searchRoleObjCopy: {
        content: '',
        limit: 10,
        page: 1,
      },
      // 角色数组
      enableRoleArr: [],
      // 渲染表格
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, columna: any, cellValue: any, index: any) => {
            return index + 1;
          },
          width: 80,
        },
        {
          type: 'text',
          prop: 'name',
          label: '角色名称',
        },
        {
          type: 'text',
          prop: 'createName',
          label: '创建者',
        },
        {
          type: 'switch',
          prop: 'isEnable',
          label: '是否启用',
          condition: (row: any) => {
            let obj = {
              isdisable: false,
            };
            if (row.id === 1) {
              obj.isdisable = true;
            }
            return obj;
          },
        },
        {
          type: 'text',
          prop: 'remark',
          label: '备注',
        },
        {
          type: 'handle',
          label: '操作',
          width: 300,
        },
      ],
      btnList: [
        {
          type: 'primary',
          text: '编辑',
          handleType: 'edit',
        },
        {
          handleType: 'auth',
          condition: (row: any) => {
            let obj = {
              type: 'warning',
              isdisable: false,
              text: '权限配置',
              size: 'small',
            };
            if (row.id === 1) {
              obj.isdisable = true;
            }
            return obj;
          },
        },
      ],
      loading: true,
      total: 0,
      // 角色表单数据
      roleFormObj: {
        createId: '',
        createName: '',
        createTime: null,
        id: '',
        isEnable: true,
        name: '',
        remark: '',
        updateTime: null,
      },
      // 渲染表单
      renderFormArr: [],
      roleRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: validateRepeatRole, trigger: 'blur' },
        ],
        remark: [
          { required: true, message: '请输入备注信息', trigger: 'blur' },
        ],
      },
      // 控制角色表单显示隐藏
      dialogFormVisible: false,
      dialogTitle: '',
      // 分辨用户点击的是添加还是编辑
      isAdd: false,
      // 控制权限管理模态框显示隐藏
      dialogAuthVisible: false,
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      authTreeArr: [],
      selectedAuthArr: [],
      // 选择权限数组
      checkedArr: [],
      isCheck: false,
      changeCheckedArr: [],
      roleModuleAddDel: {
        addList: [],
        delList: [],
        roleId: '',
      },
      allModule: [],
      // 一级菜单id
      firstMenuIdList: [],
      // 二级菜单id
      twoMenuIdList: [],
      // 半选中数组
      getHalfCheckedKeys: [],
      authLoading: false,
      isTwoMenuID: [],
      confirmTwoMenuID: [],
      allModuleList: [],
    });
    let METHODS: any = reactive({
      getEnableRole: async (searchRoleObj: Params) => {
        DATA.loading = true;
        try {
          let { data } = await getSysRole(searchRoleObj);
          if (data.code === RES_SUCCESS) {
            DATA.enableRoleArr = data.data.records;
            DATA.loading = false;
            DATA.total = data.data.total;
          }
        } catch (error) {
          DATA.loading = false;
        }
      },
      // 获取所有可用角色
      getAllEnableRole: async () => {
        let { data }: any = await getEnableRole();
        if (data.code === RES_SUCCESS) {
          STORE.commit('setRoleList', data.data);
        }
      },
      // 获取角色模块
      getRoleModule: async (id: any) => {
        DATA.checkedArr = [];
        DATA.isTwoMenuID = [];
        let { data } = await getRoleModule(id);
        if (data.code === RES_SUCCESS) {
          DATA.isCheck = true;
          data.data.forEach((item: any) => {
            if (!DATA.firstMenuIdList.includes(item.moduleId))
              DATA.checkedArr.push(item.moduleId);
          });
          nextTick(() => {
            DATA.selectedAuthArr = proxy.$refs['treeRef'].getCheckedKeys();
            DATA.getHalfCheckedKeys =
              proxy.$refs['treeRef'].getHalfCheckedKeys();
            if (DATA.getHalfCheckedKeys.length > 0) {
              DATA.getHalfCheckedKeys.forEach((item: any) => {
                DATA.twoMenuIdList.includes(item) &&
                  DATA.isTwoMenuID.push(item);
              });
            }
          });
        }
      },
      handleSizeChange: (val: any) => {
        var aggregate = DATA.searchRoleObj.page * DATA.searchRoleObj.limit;
        if (aggregate > DATA.total) {
          aggregate = DATA.total;
        }
        DATA.searchRoleObjCopy.limit = val;
        DATA.searchRoleObj.limit = val;
        var size = Math.ceil(aggregate / DATA.searchRoleObj.limit);
        if (size <= 0) {
          DATA.searchRoleObj.page = 1;
          DATA.searchRoleObjCopy.page = 1;
        } else {
          DATA.searchRoleObj.page = size;
          DATA.searchRoleObjCopy.page = size;
        }
        METHODS.getEnableRole(DATA.searchRoleObjCopy);
      },
      handleCurrentChange: (val: any) => {
        DATA.searchRoleObj.page = val;
        DATA.searchRoleObjCopy.page = val;
        METHODS.getEnableRole(DATA.searchRoleObjCopy);
      },
      // 关键字搜索角色
      handleSearch: () => {
        DATA.searchRoleObj.page = 1;
        DATA.searchRoleObjCopy = Object.assign({}, DATA.searchRoleObj);
        METHODS.getEnableRole(DATA.searchRoleObjCopy);
      },
      // 添加角色
      handleAddRole: () => {
        DATA.renderFormArr = [
          {
            label: '角色名称',
            type: 'input',
            prop: 'name',
          },
          {
            label: '备注',
            type: 'input',
            prop: 'remark',
          },
          {
            label: '是否启用',
            type: 'switch',
            prop: 'isEnable',
          },
        ];
        DATA.dialogFormVisible = true;
        DATA.isAdd = true;
        DATA.roleFormObj = Object.assign(
          {},
          {
            createId: '',
            createName: '',
            createTime: null,
            id: '',
            isEnable: true,
            name: '',
            remark: '',
            updateTime: null,
          }
        );
        DATA.dialogTitle = '添加角色';
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
        });
      },
      // 确认添加角色
      handleConfirmRole: () => {
        delete DATA.roleFormObj.createTime;
        delete DATA.roleFormObj.updateTime;
        if (DATA.isAdd) {
          proxy.$refs['refForm'].submitForm().then((res: any) => {
            if (res) {
              addRole(DATA.roleFormObj).then(({ data }: any) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage.success({
                    message: '角色添加成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.getEnableRole(DATA.searchRoleObjCopy);
                  METHODS.getAllEnableRole();
                }
              });
            }
          });
        } else {
          proxy.$refs['refForm'].submitForm().then((res: any) => {
            if (res) {
              updateRole(DATA.roleFormObj).then(({ data }: any) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage.success({
                    message: '角色编辑成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.getEnableRole(DATA.searchRoleObjCopy);
                  METHODS.getAllEnableRole();
                }
              });
            }
          });
        }
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.renderFormArr = [
              {
                label: '角色名称',
                type: 'input',
                prop: 'name',
              },
              {
                label: '备注',
                type: 'input',
                prop: 'remark',
              },
              {
                label: '是否启用',
                type: 'switch',
                prop: 'isEnable',
                disabled: row.id === 1 ? true : false,
              },
            ];
            DATA.roleFormObj = Object.assign({}, row);
            DATA.dialogFormVisible = true;
            DATA.dialogTitle = '编辑角色';
            DATA.isAdd = false;
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'auth':
            DATA.roleModuleAddDel.roleId = row.id;
            METHODS.getRoleModule(row.id);
            DATA.authTreeArr = [];
            DATA.authTreeArr = METHODS.filtersAuthTreeArr(
              DATA.authTreeArr,
              DATA.allModuleList
            );
            DATA.dialogAuthVisible = true;
            break;
          default:
            break;
        }
      },
      // 确认权限模块
      handleConfirmAuth: async () => {
        DATA.roleModuleAddDel.addList = [];
        DATA.roleModuleAddDel.delList = [];
        DATA.changeCheckedArr = proxy.$refs['treeRef'].getCheckedKeys();
        DATA.changeCheckedArr.forEach((item: any) => {
          if (DATA.selectedAuthArr.indexOf(item) === -1) {
            DATA.roleModuleAddDel.addList.push(item);
          }
        });
        DATA.selectedAuthArr.forEach((item: any) => {
          if (DATA.changeCheckedArr.indexOf(item) === -1) {
            DATA.roleModuleAddDel.delList.push(item);
          }
        });
        DATA.firstMenuIdList.forEach((item: any) => {
          if (DATA.roleModuleAddDel.addList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.addList.splice(
              DATA.roleModuleAddDel.addList.indexOf(item),
              1
            );
          }
        });
        DATA.firstMenuIdList.forEach((item: any) => {
          if (DATA.roleModuleAddDel.delList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.delList.splice(
              DATA.roleModuleAddDel.delList.indexOf(item),
              1
            );
          }
        });
        DATA.getHalfCheckedKeys.forEach((item: any) => {
          if (DATA.roleModuleAddDel.addList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.addList.splice(
              DATA.roleModuleAddDel.addList.indexOf(item),
              1
            );
          }
        });
        if (DATA.isTwoMenuID.length > 0) {
          DATA.isTwoMenuID.forEach((item: any) => {
            if (!proxy.$refs['treeRef'].getHalfCheckedKeys().includes(item)) {
              if (DATA.changeCheckedArr.includes(item)) {
                DATA.confirmTwoMenuID.push(item);
              } else {
                DATA.roleModuleAddDel.delList.push(item);
              }
            }
          });
        }
        proxy.$refs['treeRef'].getHalfCheckedKeys().forEach((item: any) => {
          if (!DATA.isTwoMenuID.includes(item)) {
            if (DATA.selectedAuthArr.includes(item)) {
              DATA.confirmTwoMenuID.push(item);
            } else {
              DATA.twoMenuIdList.includes(item) &&
                DATA.roleModuleAddDel.addList.push(item);
            }
          }
        });
        if (DATA.confirmTwoMenuID.length > 0) {
          DATA.getHalfCheckedKeys = proxy.$refs['treeRef']
            .getHalfCheckedKeys()
            .concat(DATA.confirmTwoMenuID);
        } else {
          DATA.getHalfCheckedKeys = proxy.$refs['treeRef'].getHalfCheckedKeys();
        }
        DATA.getHalfCheckedKeys.forEach((item: any) => {
          if (DATA.roleModuleAddDel.delList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.delList.splice(
              DATA.roleModuleAddDel.delList.indexOf(item),
              1
            );
          }
        });
        DATA.authLoading = true;
        let { data } = await roleModuleAddDel(DATA.roleModuleAddDel);
        if (data.code === RES_SUCCESS) {
          ElMessage.success({
            message: '编辑成功',
            type: 'success',
          });
          DATA.dialogAuthVisible = false;
          DATA.authLoading = false;
        }
      },
      // switch
      handleEmitChange: async (val: any) => {
        let { data } = await enableRoleModule({ roleId: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage.success({
              message: '启用成功',
              type: 'success',
            });
          } else {
            ElMessage.success({
              message: '不启用成功',
              type: 'success',
            });
          }
          METHODS.getAllEnableRole();
        }
      },
      // 自定义生成树状权限数据
      filtersAuthTreeArr: (arr: any, data: any) => {
        data.forEach((item: any) => {
          let obj = {
            id: item.id,
            label: item.name,
            children: [],
          };
          if (item.children != undefined && item.children.length > 0) {
            METHODS.filtersAuthTreeArr(obj.children, item.children);
          }
          if (item.name != '首页') {
            arr.push(obj);
          }
        });
        return arr;
      },
      handleClose: () => {
        DATA.isCheck = false;
      },
      // 获取所有模块
      getModule: async () => {
        let { data } = await getAllModule();
        if (data.code === RES_SUCCESS) {
          DATA.allModuleList = data.data;
          // 获取一级菜单id数组
          DATA.allModuleList.forEach((item: any) => {
            DATA.firstMenuIdList.push(item.id);
          });
        }
      },
    });
    onMounted(() => {
      METHODS.getEnableRole(DATA.searchRoleObjCopy);
      METHODS.getModule();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>

<style lang="scss" scoped>
.container {
  .container_header {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    /deep/ .el-input {
      width: 200px;
    }
    .container_header_input {
      margin-right: 10px;
    }
  }
}
</style>
