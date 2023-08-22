<template>
  <el-row>
    <el-col :span="24">
      <el-row
        type="flex"
        justify="end"
      >
        <el-col
          :span="20"
          class="d_flex"
        >
          <el-date-picker
            v-model="dateList"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right:10px"
            :default-value="defaultTime"
            :disabledDate="disabledDate"
          >
          </el-date-picker>
          <el-select
            v-model="pagingParams.electricRoomId"
            clearable
            filterable
            placeholder="请选择电房"
            style="margin-right:10px"
            @change="handleChangeElectricRoom"
          >
            <el-option
              v-for="val in electricRoomList"
              :key="val.id"
              :label="val.name"
              :value="val.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="pagingParams.busWayId"
            clearable
            filterable
            placeholder="请选择母线槽"
            style="margin-right:10px"
            @change="handleChnageBusway"
          >
            <el-option
              v-for="val in buswayList"
              :key="val.id"
              :label="val.name"
              :value="val.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="pagingParams.sectionBusWayId"
            clearable
            filterable
            placeholder="请选择母线槽分段"
            style="margin-right:10px"
          >
            <el-option
              v-for="val in subsectionBusWays"
              :key="val.id"
              :label="val.sectionName"
              :value="val.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="pagingParams.type"
            clearable
            placeholder="全部报警"
            style="margin-right:10px"
          >
            <el-option
              v-for="val in warningList"
              :key="val.id"
              :label="val.typeName"
              :value="val.type"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="pagingParams.handle"
            clearable
            placeholder="请选择状态"
            style="margin-right:10px"
          >
            <el-option
              v-for="val in statusList"
              :key="val.id"
              :label="val.name"
              :value="val.value"
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
            @click="handleExport"
            :loading="excelLoading"
            style="width: 130px;"
          ><i class="el-icon-download"></i>导出</el-button>
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
      <!-- 详情-->
      <el-dialog
        title="详情"
        v-model="dialogFormVisible"
        top="4vh"
        width="70%"
      >
        <div v-loading="detailsLoading">
          <h3 class="mb-10">处理流程</h3>
          <ele-table
            :isborder="true"
            :tableData="processesTableData"
            :renderTable="renderProcessTable"
            style="width:95%;margin:0 auto 10px auto"
          ></ele-table>
          <h3 class="mb-10">报警详情</h3>
          <ele-table
            :isborder="true"
            :tableData="detailsTableData"
            :renderTable="renderDetailsTable"
            style="width:95%;margin:0 auto"
          ></ele-table>
          <ele-pagination
            :total="detailsTotal"
            @handleSizeChange="handleSizeChangeDetails"
            @handleCurrentChange="handleCurrentChangeDetails"
          />
        </div>
      </el-dialog>
      <!-- 提交报告-->
      <el-dialog
        title="提交报告"
        v-model="dialogSubmitReportVisible"
        width="70%"
      >
        <el-input
          v-model="handleParams.content"
          type="textarea"
          placeholder="请输入内容"
          class="report-content"
        ></el-input>
        <el-upload
          class="upload-demo"
          drag
          :action="IMG_URL"
          :headers="getItemtoken"
          :on-success="handleUploadSuccess"
          :on-remove="handleRemove"
          :file-list="fileList"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 一个文件
            </div>
          </template>
        </el-upload>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogSubmitReportVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
            >确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 是否属实-->
      <el-dialog
        v-model="isTruedialog"
        title="提示"
        width="25%"
      >
        <span style="display: flex;align-items: center;">
          <i
            style="color:#e6a23c;font-size:24px"
            class="el-icon-warning mr-10"
          ></i>
          报警是否属实
        </span>
        <template #footer>
          <span class="dialog-footer">
            <el-button
              @click="handleIstrue(1)"
              size="small"
            >否</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleIstrue(0)"
            >是</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 查看报告-->
      <el-dialog
        v-model="dialogViewReportVisible"
        width="50%"
      >
        <el-descriptions
          class="margin-top"
          title="报告内容"
          :column="2"
          border
        >
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-s-opportunity"></i>
              报警ID
            </template>
            {{reportData.warningId}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-reading"></i>
              上传文件
            </template>
            <a
              v-if="reportData.filePath"
              :href="reportData.filePath"
              :download='reportData.filePath.split("/img/")[1]'
              class="fill"
            >{{reportData.filePath.split("/img/")[1]}}</a>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-reading"></i>
              内容
            </template>
            {{reportData.content}}
          </el-descriptions-item>
        </el-descriptions>
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
  computed,
  ref,
  inject,
  watch
} from "vue";
import EleTable from "@/components/eleTable/index.vue";
import EleForm from "@/components/eleForm/index.vue";
import ElePagination from "@/components/elePagination/index.vue";
import {
  findWarning,
  findWarningType,
  getWarningReport,
  handleWarning,
  warningDetails,
  warningExcel
} from "@/api/alarm/warning";
import { filterTime } from "@/utils/filtration";
import { getByKey, IMG_File, IMG_URL, RES_SUCCESS } from "@/api/common/common";
import { useStore } from "vuex";
import { findListBusbar } from "@/api/maintenance/busbar";
import { ElMessage } from "element-plus";
import { findSectionBusWay } from "@/api/maintenance/buswaySubsection";
import { findList } from "@/api/home";
export default defineComponent({
  components: { EleTable, EleForm, ElePagination },
  setup() {
    interface Params {
      endTime?: string | null;
      startTime?: string | null;
      electricRoomId?: number;
      sectionBusWayId?: number;
      busWayId?: number;
      type?: number;
      handle?: number;
      limit: number;
      page: number;
    }
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    let DATA: any = reactive({
      defaultTime: "",
      //分页参数
      pagingParams: {
        endTime: null,
        startTime: null,
        electricRoomId: "",
        sectionBusWayId: "",
        busWayId: "",
        type: "",
        handle: "",
        limit: 10,
        page: 1
      },
      pagingParamsCopy: {
        endTime: null,
        startTime: null,
        electricRoomId: "",
        sectionBusWayId: "",
        busWayId: "",
        type: "",
        handle: "",
        limit: 10,
        page: 1
      },
      // 表格
      loading: false,
      tableData: [],
      randerTable: [
        {
          label: "序号",
          type: "text",
          formatter: (row: any, column: any, cellValue: any, index: number) => {
            return index + 1;
          },
          width: 80
        },
        {
          label: "母线槽分段",
          type: "text",
          prop: "sectionBusWayName"
        },
        {
          label: "母线槽",
          type: "text",
          prop: "busWayName"
        },
        {
          label: "电房",
          type: "text",
          prop: "electricRoomName"
        },
        {
          label: "报警类型",
          type: "tag",
          prop: "type",
          moreTag: true,
          formatter: (row: any) => {
            let tagList: Array<any> = [];
            row.type?.split(",").forEach((item: any) => {
              let tag = {
                text: item,
                tagType: "",
                effect: ""
              };
              switch (item) {
                case "升温过快":
                  tag.tagType = "warning";
                  break;
                case "定温报警":
                  tag.tagType = "danger";
                  tag.effect = "dark";
                  break;
                case "差温报警":
                  tag.tagType = "danger";
                  break;
                default:
                  break;
              }
              tagList.push(tag);
            });
            return tagList;
          }
        },
        {
          label: "状态",
          type: "tag",
          prop: "handleName",
          formatter: (row: any) => {
            let tag = {
              text: row.handleName,
              tagType: ""
            };
            switch (row.handle) {
              case 1:
                tag.tagType = "warning";
                break;
              case 2:
                tag.tagType = "danger";
                break;
              case 3:
                tag.tagType = "success";
                break;
              case 4:
                tag.tagType = "info";
                break;
              default:
                break;
            }
            return tag;
          }
        },
        {
          label: "报警时间",
          type: "moreText",
          formatter: (row: any) => {
            return `${filterTime(row.startTime, "/")} - ${filterTime(
              row.endTime,
              "/"
            )}`;
          }
        },
        // {
        //   label: '备注',
        //   type: 'text',
        //   prop: 'remark',
        // },
        {
          label: "操作",
          type: "handle",
          width: 300
        }
      ],
      btnList: [
        {
          text: "详情",
          handleType: "details",
          type: "primary"
        },
        {
          handleType: "handle",
          width: "80px",
          condition: (row: any) => {
            let text, type;
            switch (row.handle) {
              case 1:
                text = "开始处理";
                type = "warning";
                break;
              case 2:
                text = "已处理";
                type = "primary";
                break;
              case 3:
                text = "查看报告";
                type = "success";
                break;
              case 4:
                text = "查看报告";
                type = "success";
                break;
              default:
                break;
            }
            return {
              text,
              type,
              size: "small"
            };
          }
        }
      ],
      total: 0,
      // 开始日期 - 结束日期
      dateList: [],
      // 电房列表
      electricRoomList: [],
      // 母线槽列表
      buswayList: [],
      subsectionBusWays: [],
      // 报警类型
      warningList: [],
      // 状态
      statusList: [],
      /**
       * 报警详情
       */
      detailsPaging: {
        limit: 10,
        page: 1
      },
      detailsLoading: false,
      dialogFormVisible: false,
      // 处理流程
      renderProcessTable: [
        {
          label: "报警状态",
          type: "tag",
          formatter: (row: any) => {
            let tag = {
              text: "",
              tagType: ""
            };
            DATA.statusList.forEach((item: any) => {
              row.handle === item.value && (tag.text = item.name);
            });
            switch (row.handle) {
              case 1:
                tag.tagType = "warning";
                break;
              case 2:
                tag.tagType = "danger";
                break;
              case 3:
                tag.tagType = "success";
                break;
              case 4:
                tag.tagType = "info";
                break;
              default:
                break;
            }
            return tag;
          }
        },
        {
          label: "时间",
          type: "moreText",
          formatter: (row: any) => {
            return filterTime(row.createTime, "/");
          }
        }
      ],
      processesTableData: [],
      // 报警详情
      renderDetailsTable: [
        {
          label: "节点",
          type: "text",
          prop: "nodeName"
        },
        {
          label: "报警距离(光纤m)",
          type: "text",
          prop: "distance"
        },
        {
          label: "温度(℃)",
          type: "text",
          prop: "temp"
        },
        {
          label: "报警类型",
          type: "tag",
          prop: "warningTypeName",
          formatter: (row: any) => {
            let tag = {
              text: row.warningTypeName,
              tagType: "",
              effect: ""
            };
            switch (row.warningTypeName) {
              case "升温过快":
                tag.tagType = "warning";
                break;
              case "定温报警":
                tag.tagType = "danger";
                tag.effect = "dark";
                break;
              case "差温报警":
                tag.tagType = "danger";
                break;
              default:
                break;
            }
            return tag;
          }
        },
        {
          label: "时间",
          type: "text",
          prop: "createTime",
          formatter: (row: any) => {
            return filterTime(row.createTime, "/");
          }
        }
      ],
      detailsTableData: [],
      detailsTotal: 0,
      handleParams: {
        content: "",
        dictValue: "",
        fileId: "",
        handle: "",
        warningId: ""
      },
      // 提交报告
      dialogSubmitReportVisible: false,
      // 查看报告
      dialogViewReportVisible: false,
      reportData: {},
      // 文件列表
      fileList: [],
      warningData: {},
      excelLoading: false,
      isTruedialog: false
    });
    let setWarningList: any = inject("setWarningList");
    let triggerAlarm: any = inject("triggerAlarm");
    let setWaringStatus: any = inject("setWaringStatus");
    // let isWaringStatus: any = inject('isWaringStatus');
    // 刷新全局报警
    let warningList: any = ref([]); //报警数据
    let getHomeData = async () => {
      // 判断是否报警
      let warningTypeList: Array<string> = [];
      warningList.value = [];
      let { data } = await findList();
      if (data.code === RES_SUCCESS) {
        if (data.data.length > 0) {
          // 循环遍历 电房
          data.data.forEach((item: any) => {
            // 循环遍历 母线槽
            if (item.busWays.length > 0) {
              item.busWays.forEach((key: any) => {
                // 循环遍历 分段母线槽 获取全部分段母线槽
                if (key.warningSectionBusWayDtos.length > 0) {
                  key.warningSectionBusWayDtos.forEach((val: any) => {
                    warningTypeList.push(val.typeName);
                    if (val.typeName) {
                      val.color = "#ff0000";
                      if (val.homePageNodeDtoList.length > 0) {
                        // 循环 节点数据
                        val.homePageNodeDtoList.forEach((k: any) => {
                          if (k.warningType) {
                            k.color = "#ff0000";
                            k.warningName = k.nodeName;
                          } else {
                            k.color = "#008800";
                          }
                        });
                      }
                      if (warningList.value.length <= 4) {
                        warningList.value.push({
                          busWayId: val.busWayId,
                          sectionBusWayId: val.sectionBusWayId,
                          sectionBusWayName: val.sectionBusWayName,
                          filePath:
                            val.filePath ||
                            require("../../../assets/image/noFile.png"),
                          nodeList: val.homePageNodeDtoList,
                          createTime: val.createTime
                        });
                      }
                      setWarningList(warningList.value);
                      triggerAlarm();
                    } else {
                      val.color = "#008000";
                    }
                  });
                }
              });
            }
          });
        }
      }

      // 更改报警状态
      let isWarning = warningTypeList.some((item) => {
        return typeof item === "string";
      });
      setWaringStatus(isWarning);
    };

    let METHODS: any = reactive({
      // 禁用未来时间
      disabledDate: (date: Date) => {
        return new Date(date).getTime() > new Date().getTime();
      },
      // 分页获取报警
      handleGetFindWarning: async (pagingParams: Params) => {
        DATA.loading = true;
        if (DATA.dateList != null && DATA.dateList.length > 0) {
          DATA.pagingParams.startTime = filterTime(DATA.dateList[0], "/");
          DATA.pagingParams.endTime = filterTime(DATA.dateList[1], "/");
        }
        if (DATA.dateList == null) {
          DATA.pagingParams.startTime = null;
          DATA.pagingParams.endTime = null;
        }
        let { data } = await findWarning(pagingParams);
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
        METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
      },
      // 切换分页显示数据个数
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
        METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
      },
      // 切换分页当前页数
      handleCurrentChange: (val: number) => {
        DATA.pagingParamsCopy.page = val;
        DATA.pagingParams.page = val;
        METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
      },
      // 点击导出
      handleExport: () => {
        proxy
          .$confirm("你是否确认导出数据, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(async () => {
            if (DATA.dateList != null && DATA.dateList.length > 0) {
              DATA.pagingParams.startTime = filterTime(DATA.dateList[0], "/");
              DATA.pagingParams.endTime = filterTime(DATA.dateList[1], "/");
            }
            if (DATA.dateList == null) {
              DATA.pagingParams.startTime = null;
              DATA.pagingParams.endTime = null;
            }
            let {
              endTime,
              startTime,
              electricRoomId,
              busWayId,
              type,
              sectionBusWayId,
              handle
            } = DATA.pagingParams;
            DATA.excelLoading = true;
            let res = await warningExcel({
              endTime,
              startTime,
              electricRoomId,
              sectionBusWayId,
              busWayId,
              type,
              handle
            });
            DATA.excelLoading = false;
            if (res.data.type === "application/json") {
              ElMessage({
                message: "数据过多,请细化报警数据再导出",
                type: "warning"
              });
              return;
            }
            if (res.data.size === 0) {
              ElMessage({
                message: "该节点在此时间段内没有报警数据",
                type: "warning"
              });
              return;
            }
            // 2.获取请求返回的response对象中的blob 设置文件类型
            let blob = new Blob([res.data], {
              type: "application/vnd.ms-excel"
            });
            // 3.创建一个临时的url指向blob对象
            let url = window.URL.createObjectURL(blob);
            // 4.创建url之后可以模拟对此文件对象的一系列操作，例如：预览、下载
            let a = document.createElement("a");
            a.href = url;
            a.download = `报警记录_${filterTime(new Date(), "-", false)}`;
            // decodeURI(res.headers['content-disposition'].split('=')[1]);
            a.click();
            // 5.释放这个临时的对象url
            window.URL.revokeObjectURL(url);
          })
          .catch(() => {});
      },
      // 操作按钮
      handleBtnEvent: async ({ row, val }: any) => {
        switch (val.handleType) {
          case "handle":
            switch (row.handle) {
              case 1:
                proxy
                  .$confirm("你是否确认开始处理, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                  })
                  .then(async () => {
                    DATA.handleParams.warningId = row.warningId;
                    DATA.handleParams.handle = row.handle;
                    let { data } = await handleWarning(DATA.handleParams);
                    if (data.code === RES_SUCCESS) {
                      METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
                      ElMessage({
                        message: "操作成功",
                        type: "success"
                      });
                    }
                  })
                  .catch(() => {});
                break;
              case 2:
                DATA.warningData = Object.assign({}, row);
                DATA.isTruedialog = true;
                break;
              case 3:
                DATA.reportData = {};
                DATA.dialogViewReportVisible = true;
                let report3 = await getWarningReport({
                  warningId: row.warningId
                });
                if (report3.data.code === RES_SUCCESS) {
                  DATA.reportData = report3.data.data;
                }
                break;
              case 4:
                DATA.reportData = {};
                DATA.dialogViewReportVisible = true;
                let report4 = await getWarningReport({
                  warningId: row.warningId
                });
                if (report4.data.code === RES_SUCCESS) {
                  DATA.reportData = report4.data.data;
                }
                break;
              default:
                break;
            }
            break;
          case "details":
            DATA.dialogFormVisible = true;
            DATA.detailsLoading = true;
            let { data } = await warningDetails({ warningId: row.warningId });
            if (data.code === RES_SUCCESS) {
              DATA.detailsLoading = false;
              DATA.processesTableData = data.data.warningProcesses;
              DATA.totalDetailsTableData = JSON.parse(
                JSON.stringify(data.data.warningDataTemp)
              );
              DATA.detailsTableData = data.data.warningDataTemp.slice(
                DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
                DATA.detailsPaging.limit * DATA.detailsPaging.page
              );
              DATA.detailsTotal = data.data.warningDataTemp.length;
            }
            break;
          default:
            break;
        }
      },
      // 是否属实
      handleIstrue: (dictValue: number) => {
        DATA.isTruedialog = false;
        DATA.dialogSubmitReportVisible = true;
        DATA.handleParams.dictValue = dictValue;
        DATA.handleParams.fileId = "";
        DATA.handleParams.content = "";
        DATA.fileList = [];
      },

      // 切换报警详情表格显示个数
      handleSizeChangeDetails: (val: number) => {
        DATA.detailsPaging.limit = val;
        DATA.detailsTableData = DATA.totalDetailsTableData.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
      },
      // 切换报警详情表格当前页
      handleCurrentChangeDetails: (val: number) => {
        DATA.detailsPaging.page = val;
        DATA.detailsTableData = DATA.totalDetailsTableData.slice(
          DATA.detailsPaging.limit * (DATA.detailsPaging.page - 1),
          DATA.detailsPaging.limit * DATA.detailsPaging.page
        );
      },
      // 提交报告
      handleConfirm: async () => {
        DATA.handleParams.warningId = DATA.warningData.warningId;
        DATA.handleParams.handle = DATA.warningData.handle;
        let { data } = await handleWarning(DATA.handleParams);
        if (data.code === RES_SUCCESS) {
          METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
          DATA.dialogSubmitReportVisible = false;
          getHomeData();
          ElMessage({
            message: "操作成功",
            type: "success"
          });
        }
      },
      // 文件上传成功
      handleUploadSuccess: (res: any) => {
        if (res.code === RES_SUCCESS) {
          DATA.fileList = [];
          DATA.fileList.push({
            url: IMG_File + res.data.path,
            name: res.data.name
          });
          DATA.handleParams.fileId = res.data.id;
        } else {
          ElMessage({
            message: "文件上传失败",
            type: "error"
          });
          DATA.fileList = [];
        }
      },
      // 文件移除
      handleRemove: () => {
        DATA.handleParams.fileId = "";
      },
      // 切换电房
      handleChangeElectricRoom: async () => {
        DATA.buswayList = [];
        DATA.pagingParams.busWayId = null;
        DATA.subsectionBusWays = [];
        DATA.pagingParams.sectionBusWayId = null;
        DATA.pagingParams.electricRoomId &&
          (DATA.buswayList = await METHODS.handlFindBusWayData(
            DATA.pagingParams.electricRoomId
          ));
      },
      handleChnageBusway: async () => {
        DATA.subsectionBusWays = [];
        DATA.pagingParams.sectionBusWayId = null;
        DATA.pagingParams.busWayId &&
          (DATA.subsectionBusWays = await METHODS.handleFindSectionBusWay(
            DATA.pagingParams.busWayId
          ));
      },
      // 级联获取母线槽数据
      handlFindBusWayData: async (electricRoomId: number) => {
        let { data } = await findListBusbar({ electricRoomId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 级联获取分段母线槽
      handleFindSectionBusWay: async (busWayId: number) => {
        let { data } = await findSectionBusWay({ busWayId });
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 获取报警类型
      handleGetWarningType: async () => {
        let { data } = await findWarningType();
        if (data.code === RES_SUCCESS) {
          DATA.warningList = data.data;
        }
      },
      // 获取状态
      handleGetStatus: async () => {
        let { data } = await getByKey({ key: "t_handle_type" });
        if (data.code === RES_SUCCESS) {
          DATA.statusList = data.data;
        }
      }
    });

    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token")
      };
    });

    // watch(isWaringStatus, (newValue) => {
    //   if (newValue) {
    //     METHODS.handleGetFindWarning(DATA.pagingParamsCopy);
    //   }
    // });

    // 设置默认时间 是当前月在右边显示
    DATA.defaultTime = new Date();
    DATA.defaultTime.setMonth(new Date().getMonth() - 1);

    onMounted(() => {
      DATA.electricRoomList = STORE.state.data.electricRoomList;
      METHODS.handleGetFindWarning(DATA.pagingParams);
      METHODS.handleGetWarningType();
      METHODS.handleGetStatus();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      getItemtoken
    };
  }
});
</script>
<style lang="scss" scoped>
.fill {
  text-decoration: underline;
  &:hover {
    color: #61afef;
  }
}
.report-content {
  /deep/ .el-textarea__inner {
    height: 100px;
  }
}
// 上传文件
.upload-demo {
  margin-top: 10px;
  text-align: center;
  .el-upload__tip {
    color: #d18c4c;
  }
}
/deep/ .el-descriptions__label {
  width: 100px;
}
</style>