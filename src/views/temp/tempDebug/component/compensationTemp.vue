<template>
  <div>
    <el-button
      type="primary"
      @click="showCompensationTemp"
    >补偿温度</el-button>
    <el-dialog
      title="补偿温度"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-row>
        <el-col
          :span="24"
          style="text-align:right"
        >
          <el-button
            type="primary"
            size="small"
            @click="onCreate"
            style="margin-bottom:10px"
          >添加补偿温度</el-button>
        </el-col>
      </el-row>
      <EleTable
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        :btnList="benList"
        @handleBtnEvent="handleBtnEvent"
      />
      <elePagination
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </el-dialog>
    <el-dialog
      :title="dialogTitle"
      v-model="disTempDialogVisible"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="120px"
        :rules="formRules"
        ref="form"
      >
        <el-form-item
          label="时间"
          prop="activeTime"
        >
          <el-date-picker
            v-model="formData.activeTime"
            type="datetime"
            placeholder="请选择时间"
            :disabledDate="disabledDate"
          />
        </el-form-item>
        <el-form-item
          label="距离/温度"
          prop="distOrTemp"
        >
          <div>
            <div style="text-align:right">
              <el-button
                type="primary"
                size="small"
                @click="onCreateDistOrTemp"
                style="margin-bottom:10px"
              >添加</el-button>
            </div>
            <template
              v-for="(item,index) of distOrTempList"
              :key="`item${index}`"
            >
              <div style="display:flex;justify-content: space-between;align-items: center;width:100%">
                <div style="width:100%">
                  <el-input
                    v-model="item.dist"
                    placeholder="请输入距离"
                    style="width:40%;margin-bottom:5px"
                  /> m
                  <span style="margin:0  5px">-</span>
                  <el-input
                    v-model="item.temp"
                    placeholder="请输入温度"
                    style="width:40%"
                  /> ℃
                </div>
                <el-button
                  type="danger"
                  size="small"
                  style="height:32px"
                  :disabled="distOrTempList.length===1"
                  @click="onDeleteDistTemp(index)"
                >删除</el-button>
              </div>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="disTempDialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmCompensationTemp"
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
  ref,
  nextTick
} from "vue";
import {
  createCompensation,
  deleteCompensation,
  updateCompensation,
  findCompensation
} from "@/api/maintenance/busbar";
import { ElMessage, ElMessageBox } from "element-plus";
import { filterTime } from "@/utils/filtration";
import { RES_SUCCESS } from "@/api/common/common";
import EleTable from "@/components/eleTable/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import { verifyPlus, verifyPlusMinus } from "@/api/common/verify";
export default defineComponent({
  components: { EleTable, ElePagination },
  props: ["busWayId", "startDis", "endDis"],
  setup(props) {
    let form = ref();
    var validateDistOrTemp = async (rule: any, value: any, callback: any) => {
      let isEmpty = DATA.distOrTempList.some((item: any) => {
        return item.dist === "" || item.temp === "";
      });
      let isFormatCheck = DATA.distOrTempList.every((item: any) => {
        return verifyPlus.test(item.dist) && verifyPlusMinus.test(item.temp);
      });
      let isOverrun = DATA.distOrTempList.some((item: any) => {
        return item.dist < props.startDis || item.dist > props.endDis;
      });
      if (isEmpty) {
        callback(new Error("距离/温度不能为空"));
      } else {
        if (isFormatCheck) {
          if (isOverrun) {
            callback(new Error("距离不在母线槽范围内"));
          } else {
            callback();
          }
        } else {
          callback(new Error("距离温度为数字且距离为正数温度只能一位小数位"));
        }
      }
    };
    let DATA: any = reactive({
      dialogType: true, //true 添加 false 编辑
      dialogTitle: "",
      dialogVisible: false,
      disTempDialogVisible: false,
      formData: {
        activeTime: null,
        standardTemp: ""
      },
      formRules: {
        activeTime: [
          { required: true, message: "请选择时间", trigger: "change" }
        ],
        distOrTemp: [{ validator: validateDistOrTemp, trigger: "blur" }]
      },
      distOrTempList: [{ dist: "", temp: "" }],
      total: 0,
      totalTableData: [], //总的数据
      tableData: [], //分页数据
      renderTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "时间",
          type: "text",
          prop: "activeTime"
        },
        {
          label: "距离/温度",
          type: "text",
          prop: "standardTemp"
        },
        {
          label: "操作",
          type: "handle",
          width: 200
        }
      ],
      benList: [
        {
          text: "编辑",
          handleType: "edit",
          type: "primary",
          size: "small"
        },
        {
          text: "删除",
          handleType: "delete",
          type: "danger",
          size: "small"
        }
      ],
      tablePaging: {
        limit: 10,
        page: 1
      }
    });
    let METHODS = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
      },
      // 获取补偿温度列表数据
      onGetData: async () => {
        let { data } = await findCompensation({
          busWayId: props.busWayId as number
        });
        if (data.code === RES_SUCCESS) {
          DATA.totalTableData = JSON.parse(JSON.stringify(data.data));
          DATA.tableData = data.data.slice(
            DATA.tablePaging.limit * (DATA.tablePaging.page - 1),
            DATA.tablePaging.limit * DATA.tablePaging.page
          );
          DATA.total = data.data.length;
        }
      },
      handleSizeChange: (val: number) => {
        DATA.tablePaging.limit = val;
        DATA.tableData = DATA.totalTableData.slice(
          DATA.tablePaging.limit * (DATA.tablePaging.page - 1),
          DATA.tablePaging.limit * DATA.tablePaging.page
        );
      },
      handleCurrentChange: (val: number) => {
        DATA.tablePaging.page = val;
        DATA.tableData = DATA.totalTableData.slice(
          DATA.tablePaging.limit * (DATA.tablePaging.page - 1),
          DATA.tablePaging.limit * DATA.tablePaging.page
        );
      },
      showCompensationTemp: () => {
        if (!props.busWayId) {
          ElMessage({
            type: "warning",
            message: "请选择母线槽"
          });
          return;
        }
        DATA.dialogVisible = true;
        METHODS.onGetData();
      },
      onCreate: () => {
        DATA.formData = {
          activeTime: null,
          standardTemp: ""
        };
        DATA.distOrTempList = [{ dist: "", temp: "" }];
        DATA.disTempDialogVisible = true;
        DATA.dialogTitle = "添加补偿温度";
        DATA.dialogType = true;
        nextTick(() => {
          form.value.clearValidate();
        });
      },
      onCreateDistOrTemp: () => {
        DATA.distOrTempList.push({
          dist: "",
          temp: ""
        });
      },
      onDeleteDistTemp: (index: number) => {
        DATA.distOrTempList.splice(index, 1);
      },
      handleConfirmCompensationTemp: async () => {
        await form.value.validate(async (valid: boolean) => {
          if (valid) {
            DATA.formData.standardTemp = JSON.stringify(DATA.distOrTempList);
            DATA.formData.activeTime = filterTime(
              DATA.formData.activeTime,
              "/"
            );
            if (DATA.dialogType) {
              let { data } = await createCompensation({
                busWayId: props.busWayId,
                ...DATA.formData
              });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  type: "success",
                  message: "添加成功"
                });
                DATA.disTempDialogVisible = false;
                METHODS.onGetData();
              }
            } else {
              let { data } = await updateCompensation({
                ...DATA.formData
              });
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  type: "success",
                  message: "编辑成功"
                });
                DATA.disTempDialogVisible = false;
                METHODS.onGetData();
              }
            }
          }
        });
      },
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case "edit":
            let { id, busWayId, activeTime, standardTemp } = row;
            DATA.formData = Object.assign(
              {},
              { id, busWayId, activeTime, standardTemp }
            );
            DATA.distOrTempList = standardTemp
              ? JSON.parse(standardTemp)
              : [{ dist: "", temp: "" }];
            DATA.dialogTitle = "编辑补偿温度";
            DATA.dialogType = false;
            DATA.disTempDialogVisible = true;
            nextTick(() => {
              form.value.clearValidate();
            });
            break;
          case "delete":
            ElMessageBox.confirm("是否确定删除该温度补偿?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(async () => {
                let { data } = await deleteCompensation({
                  compensationId: row.id
                });
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    type: "success",
                    message: "删除成功"
                  });
                  METHODS.onGetData();
                }
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      }
    });
    onMounted(() => {});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      form
    };
  }
});
</script>
<style scoped lang="scss">
/deep/ .el-dialog__body {
  padding: 10px;
}
</style>