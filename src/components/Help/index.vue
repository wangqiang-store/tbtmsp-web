<template>
  <el-row>
    <el-col :span="24">
      <!-- <div
        class="content"
        v-loading="loading"
      >
        <div ref="file"></div>
      </div> -->
      <iframe
        :src="pdfURL"
        frameborder="1"
        id="iframe"
      >
      </iframe>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, onMounted } from 'vue';
import Axios from 'axios';
let docx = require('docx-preview');
export default defineComponent({
  setup(props) {
    let file: any = ref(null);
    let DATA = reactive({
      wordURL: '/img/userManual.docx', //文件地址
      loading: false,
      pdfURL: '/img/userManual.pdf',
    });

    let METHODS = reactive({
      getDocxCode() {
        DATA.loading = true;
        Axios({
          method: 'get',
          responseType: 'blob',
          url: DATA.wordURL,
        }).then(({ data }) => {
          docx.renderAsync(data, file.value); // 渲染到页面
          DATA.loading = false;
        });
      },
    });
    onMounted(() => {
      // METHODS.getDocxCode();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      file,
    };
  },
});
</script>
<style scoped lang="scss">
.content {
  min-height: calc(100vh - 80px);
}
#iframe {
  width: 100%;
  min-height: calc(100vh - 90px);
}
</style>