<template>
  <el-table
    :data="tableData"
    :border="isborder"
    style="width: 100%;"
    :row-key="getRowKey"
    :ref="refsName"
    :fit="true"
    @selection-change="handleSelectionChange"
  >
    <template
      v-for="(item,index) of renderTable"
      :key="index"
    >
      <!-- 多选 -->
      <el-table-column
        v-if="item.type === 'selection'"
        type="selection"
        :reserve-selection="true"
        width="55"
      >
      </el-table-column>
      <!-- 展开行 -->
      <el-table-column
        v-if="item.type === 'expand'"
        type="expand"
        width="50"
        #default="scoped"
        @click="handleClickColumn(scoped.row)"
      >
        <el-table
          :data="scoped.row[item.dataName]"
          :border="isborder"
          style="width: 100%;margin-top:10px"
        >
          <template
            v-for="(val,index) of randerExpandTable"
            :key="index"
          >
            <!-- 文本 -->
            <el-table-column
              :label="val.label"
              :show-overflow-tooltip="true"
              :prop="val.prop"
              :formatter="val.formatter"
              :sortable="val.sortable"
              align="center"
              v-if="val.type==='text'"
              :fixed="columnAlign"
            >
            </el-table-column>

            <!-- switch -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type==='switch'"
              #default="scoped"
              align="center"
              :fixed="columnAlign"
            >
              <el-switch
                v-model="scoped.row[val.prop]"
                :active-color="val.color || '#13ce66'"
                @change="handleEmitChange(scoped.row)"
              >
              </el-switch>
            </el-table-column>

            <!-- tag -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type==='tag'"
              align="center"
              #default="scoped"
              :fixed="columnAlign"
            >
              <el-tag :type="val.tagType">{{scoped.row[val.prop]}}</el-tag>
            </el-table-column>
          </template>
        </el-table>
      </el-table-column>
      <!-- :show-overflow-tooltip="item.tooltip===false ? item.tooltip : true" -->
      <!-- 文本 -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :formatter="item.formatter"
        :sortable="item.sortable"
        align="center"
        v-if="item.type==='text'"
        :fixed="item.fixed"
        :width="item.width || ''"
      >
      </el-table-column>

      <!-- 多行文本 -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :sortable="item.sortable"
        align="center"
        v-if="item.type==='multilineText'"
        :fixed="item.fixed"
        #default="scoped"
      >
        <div v-html="item.formatter(scoped.row)">

        </div>
      </el-table-column>

      <!-- 多段文本 -->
      <el-table-column
        :label="item.label"
        :show-overflow-tooltip="true"
        :prop="item.prop"
        :sortable="item.sortable"
        align="center"
        v-if="item.type==='moreText'"
        :fixed="item.fixed"
        #default="scoped"
      >
        <span>{{item.formatter(scoped.row)}}</span>
      </el-table-column>

      <!-- switch -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='switch'"
        #default="scoped"
        align="center"
      >
        <el-switch
          :disabled="item.condition ? item.condition(scoped.row).isdisable : false"
          v-model="scoped.row[item.prop]"
          :active-color="item.color || '#13ce66'"
          @change="handleEmitChange(scoped.row,item)"
        >
        </el-switch>
      </el-table-column>

      <!-- tag -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='tag'"
        align="center"
        #default="scoped"
        :min-width="item.moreTag ? 130 : 60"
      >
        <template v-if="item.moreTag">
          <div
            style="display:flex; justify-content: center;"
            class="tag"
          >
            <el-tag
              v-for="(val,index) of item.formatter(scoped.row)"
              :key="'tag' + index"
              :type="val.tagType"
              :effect="val.effect || 'light'"
            >{{val.text}}</el-tag>
          </div>
        </template>
        <el-tag
          v-else
          :type="item.formatter(scoped.row).tagType"
          :effect="item.formatter(scoped.row).effect || 'light'"
        >{{item.formatter(scoped.row).text}}</el-tag>
      </el-table-column>

      <!-- button -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        v-if="item.type==='handle'"
        align="center"
        #default="scoped"
        :fixed="columnAlign"
      >
        <div class="d_flex d_flex_c">
          <el-button
            v-for="(val,i) of btnList"
            :key="i"
            :style="{width:val.width}"
            :type="val.condition ? val.condition(scoped.row).type : val.type"
            @click="handleBtnEvent(scoped.row,val)"
            :disabled="val.condition ? val.condition(scoped.row).isdisable : false"
            :size="val.condition ? val.condition(scoped.row).size : val.size ? val.size : 'small'"
          >{{val.condition ? val.condition(scoped.row).text : val.text}}</el-button>
        </div>
      </el-table-column>
    </template>
  </el-table>
</template>
<script lang="ts">
import { useStore } from 'vuex';
import { defineComponent, getCurrentInstance, reactive, toRefs } from 'vue';
export default defineComponent({
  props: {
    // 表格数据
    tableData: {
      type: Array,
      default: [],
    },
    // 表格边框
    isborder: {
      type: Boolean,
      default: false,
    },
    // 自定义渲染表格
    renderTable: {
      type: Array,
      default: [],
    },
    // 表格操作按钮
    btnList: {
      type: Array,
      default: [],
    },
    // 表格折叠行自定义渲染
    randerExpandTable: {
      type: Array,
      default: [],
    },
    // ref名称
    refsName: {
      type: String,
      default: '',
    },
  },
  // 定义抛出的事件名称
  emits: [
    'handleSelectionChange',
    'handleBtnEvent',
    'handleEmitChange',
    'handleClickColumn',
  ],
  setup(props, { emit }) {
    // 获取vue实例化对象
    let { proxy }: any = getCurrentInstance();
    let STORE = useStore();
    let DATA: any = reactive({
      columnAlign: 'right',
    });
    let METHODES: any = reactive({
      handleSelectionChange: (val: any): void => {
        emit('handleSelectionChange', val);
      },
      handleBtnEvent: (row: any, val: any): void => {
        emit('handleBtnEvent', { row, val });
      },
      handleEmitChange: (val: any, item: any): void => {
        emit('handleEmitChange', val, item);
      },
      handleClickColumn: (row: any) => {
        emit('handleClickColumn', row);
      },
      getRowKey: (row: any) => {
        return row.id + '';
      },
      clearSelection: () => {
        proxy.$refs[props.refsName].clearSelection();
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODES),
    };
  },
});
</script>
<style lang="scss" scoped>
.tag {
  .el-tag {
    margin-right: 5px;
  }
  &:last-child {
    margin-right: -5px;
  }
}
</style>