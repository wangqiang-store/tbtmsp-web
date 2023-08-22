<template>
  <!-- 图片文件 -->
  <div v-if="isUploadImage">
    <el-upload
      :action="IMG_URL"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :before-upload="beforeUploadImage"
      :headers="getItemtoken"
      ref="uploadRef"
      :disabled="disabled"
      :multiple="multiple"
      :file-list="fileList"
      name="file"
      :class="fileList.length>0 ? 'uploadImage' : ''"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog v-model="dialogVisible">
      <img
        :src="dialogImageUrl"
        alt=""
      >
    </el-dialog>
  </div>
  <!-- 视频文件 -->
  <div
    v-else
    style="width: 100%;align-item:center"
    :style="{'display':isFlex ? 'flex' : 'block'}"
  >
    <div style="margin-right:10px;display: flex;flex-wrap: wrap;">
      <template v-if="videoList.length>0 && videoFlag == false">
        <div
          v-for="(item,index) of videoList"
          :key="index"
          style="position: relative;"
          class="videoBoxs"
        >
          <i
            class="el-icon-delete-solid"
            @click="deleteSolid(index)"
          ></i>
          <video
            id="my-video"
            class="video-js vjs-default-skin"
            controls
            preload="auto"
            v-if="item.path"
          >
            <source
              :src="item.path"
              type="application/x-mpegURL"
            >
          </video>
        </div>
      </template>
      <el-progress
        v-if="videoFlag == true"
        type="circle"
        :percentage="videoUploadPercent"
        style="margin-top:30px;"
      ></el-progress>
    </div>
    <!-- action必选参数, 上传的地址 -->
    <el-upload
      :action="VIDEO_URL"
      :headers="getItemtoken"
      list-type="picture-card"
      :show-file-list="false"
      :on-success="handleVideoSuccess"
      :before-upload="beforeUploadVideo"
      :on-progress="uploadVideoProcess"
      :disabled="disabled"
      :multiple="multiple"
      v-if="!videoList.length>0 || !videoFlag == false"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  watch
} from "vue";
import { IMG_File, IMG_URL, VIDEO_URL } from "@/api/common/common";
export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    imageList: {
      type: Array,
      default: []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 判断是否上传图片否则视频
    isUploadImage: {
      type: Boolean,
      default: true
    },
    // 视频
    videoList: {
      type: Array,
      default: []
    },
    // 是否弹性布局
    isFlex: {
      type: Boolean,
      default: true
    }
  },
  // 定义抛出的事件名称
  emits: ["uploadSuccess", "uploadVideoSuccess", "deleteSolid", "uploadRemove"],
  setup(props, { emit }) {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      dialogVisible: false,
      videoFlag: false,
      videoUploadPercent: "",
      fileList: props.imageList,
      dialogImageUrl: "",
      myVideo: ""
    });
    let METHODS: any = reactive({
      handleRemove(file: any, fileList: any) {
        DATA.fileList = [];
        emit("uploadRemove", file);
      },
      handlePictureCardPreview(file: any) {
        DATA.dialogVisible = true;
        DATA.dialogImageUrl = file.url;
      },
      // 限制图片上传格式
      beforeUploadImage: (file: any) => {
        if (["image/jpg", "image/png", "image/jpeg"].indexOf(file.type) == -1) {
          proxy.$message.error("请上传正确的图片格式");
          return false;
        }
      },
      // 上传图片成功
      handleUploadSuccess: (res: any) => {
        if (res.code === 200) {
          DATA.fileList = [];
          DATA.fileList.push({ url: IMG_File + res.data });
        }
        emit("uploadSuccess", res);
      },
      // 上传视频成功
      handleVideoSuccess: (res: any) => {
        DATA.videoFlag = false;
        DATA.videoUploadPercent = 0;
        if (DATA.myVideo) {
          DATA.myVideo.dispose(); // 该方法会重置videojs的内部状态并移除dom
        }
        emit("uploadVideoSuccess", res);
      },
      // 显示视频上传进度条
      uploadVideoProcess(event: any) {
        DATA.videoFlag = true;
        DATA.videoUploadPercent = Math.floor(event.percent);
      },
      // 判断视频格式、大小
      beforeUploadVideo: (file: any) => {
        const isLt10M = file.size / 1024 / 1024 < 500;
        if (
          [
            "video/mp4",
            "video/ogg",
            "video/flv",
            "video/avi",
            "video/wmv",
            "video/rmvb"
          ].indexOf(file.type) == -1
        ) {
          proxy.$message.error("请上传正确的视频格式");
          return false;
        }
        if (!isLt10M) {
          proxy.$message.error("上传视频大小不能超过10MB哦!");
          return false;
        }
      },
      // 删除视频
      deleteSolid: (index: number) => {
        emit("deleteSolid", index);
      },
      initVideo() {
        //初始化视频方法
        nextTick(() => {
          DATA.myVideo = proxy.$video(
            "my-video",
            {
              bigPlayButton: false,
              textTrackDisplay: false,
              posterImage: false,
              errorDisplay: false,
              controlBar: true
            }
            // function () {
            //   DATA.myVideo.play();
            // }
          );
        });
      },
      disposeVideo: () => {
        DATA.myVideo && DATA.myVideo.dispose();
      }
    });
    // 清空上传文件列表
    let handleClearFiles: any = () => {
      proxy.$refs["uploadRef"].clearFiles();
    };
    let getItemtoken = computed(() => {
      return {
        Authorization: localStorage.getItem("Admin-Token")
      };
    });
    watch(
      () => props.imageList,
      (newData, oldData) => {
        DATA.fileList = newData;
      }
    );
    onMounted(() => {
      setTimeout(() => {
        if (props.videoList.length > 0) {
          METHODS.initVideo();
        }
      }, 100);
    });
    onUnmounted(() => {
      if (DATA.myVideo) {
        DATA.myVideo.dispose(); // 该方法会重置videojs的内部状态并移除dom
      }
    });
    watch(
      () => props.videoList,
      () => {
        setTimeout(() => {
          if (props.videoList.length > 0) {
            METHODS.initVideo();
          }
        }, 1000);
      }
    );
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_URL,
      getItemtoken,
      handleClearFiles,
      VIDEO_URL
    };
  }
});
</script>
<style lang="scss" scoped>
.avatar {
  /* width: 100%; */
  height: 150px;
  box-sizing: border-box;
}
.el-icon-delete-solid {
  padding: 15px;
  position: absolute;
  right: 10px;
  top: 30%;
  z-index: 10000;
  color: lightcoral;
}
/deep/ .el-overlay {
  z-index: 999999 !important;
}
/deep/ .el-dialog__body {
  width: 100%;
  z-index: 9999;
  img {
    width: 100%;
  }
}
#my-video,
.videoBoxs {
  width: 200px;
  height: 150px;
  margin-bottom: 5px;
}
.videoBoxs {
  background: #282c34;
}
.uploadImage /deep/ .el-upload {
  display: none;
}
</style>