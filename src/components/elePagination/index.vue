<template>
  <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :page-sizes="pageSize"
    :page-size="size"
    :layout="pagingLayout"
    :total="total"
    class="pagination"
  >
  </el-pagination>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, getCurrentInstance } from 'vue';
export default defineComponent({
  props: {
    total: {
      type: Number,
      default: 0,
    },
    // 分页布局
    pagingLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper',
    },
    // 分页选择显示个数
    pageSize: {
      type: Array,
      default: [10, 20, 30, 50],
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  emits: ['handleSizeChange', 'handleCurrentChange'],
  setup(props, { emit }) {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      size: 10,
    });
    let METHODS: any = reactive({
      // 切换分页显示个数
      handleSizeChange: (val: any) => {
        DATA.size = val;
        emit('handleSizeChange', val);
      },
      // 切换分页当前页数
      handleCurrentChange: (val: any) => {
        DATA.currmentPage = val;
        emit('handleCurrentChange', val);
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.pagination {
  text-align: right;
}
</style>