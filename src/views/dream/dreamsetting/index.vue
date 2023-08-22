<template>
  <el-row
    class="dreansetting_container"
    :gutter="10"
  >
    <el-col :span="16">
      <el-row style="width:100%">
        <el-col
          :span="24"
          class="d_flex d_flex_start mb-30"
        >
          <span class="bar"></span>
          <h3>短信设置</h3>
        </el-col>
        <el-col
          :span="24"
          class="mb-30"
        >
          <p>商场区域：{{STORE.state.data.SMSData.unitName}}</p>
        </el-col>
        <el-col
          :span="24"
          style="color:#990000"
          class="mb-30"
        >
          <p>
            <span class="dreanse_hint"><i class="el-icon-warning-outline mr-10"></i>
              提示：编辑变量统一格式请用主机：${hostName} 、主机编号：${hostUid} 、通道：${channelName} 、通道编号：${channelCode}、
              电房：${electricRoom} 、母线槽：${busWay}、报警类型 ：${type} 、报警时间：${warningDate} ，否则不生效。
            </span>
          </p>
        </el-col>
        <el-col :span="24">
          <el-form
            ref="refForm"
            :model="SMSData"
            label-width="100px"
            :rules="rules"
          >
            <el-form-item
              label="自定义短信"
              prop="smsContent"
            >
              <el-input
                v-model="SMSData.smsContent"
                type="textarea"
                @input="handleInputSMS"
              ></el-input>
              <p style="text-align:right">共{{SMSData.smsContent.length}}个字符</p>
            </el-form-item>
            <el-form-item
              label="手机号码"
              prop="maintenanceContact"
            >
              <el-input
                v-model="SMSData.maintenanceContact"
                placeholder="多个手机号以英文“ , ”分割，格式如下：
132*****261,132*****262,132*****263"
                type="textarea"
              ></el-input>
            </el-form-item>
            <el-form-item style="text-align:right">
              <el-button
                class="btn-w-100"
                type="primary"
                @click="handleSave"
                :loading="loading"
              >保存</el-button>
              <el-button
                class="btn-w-100"
                type="danger"
                @click="handleBack"
              >返回</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="8">
      <div class="phone">
        <img
          class="phone-head"
          :src="require('@/assets/image/phone-head.png')"
        />
        <img
          class="phone-left"
          :src="require('@/assets/image/phone-left.png')"
        />
        <img
          class="phone-right"
          :src="require('@/assets/image/phone-right.png')"
        />
        <img
          class="phone-bottom"
          :src="require('@/assets/image/phone-bottom.png')"
        />
        <div class="phone-content">
          {{SMSContent.length>0 ? `【广州劲联智能科技有限公司】` : ''}}
          <span
            v-if="SMSContent.length>0"
            v-html="SMSContent"
          ></span>
        </div>
      </div>
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
} from 'vue';
import { filterTime } from '@/utils/filtration';
import { verifyPhones } from '@/api/common/verify';
import { useStore } from 'vuex';
import { updateTemplate } from '@/api/dreamSend/dreamSend';
import { RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    let validatePhones = (rule: any, value: string, callback: any) => {
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
      if (verifyPhones.test(value)) {
        isrepet ? callback('手机号重复') : callback();
      } else {
        if (value) {
          callback(
            new Error(
              '手机号码格式不正确,手机号末尾不需要逗号,多个手机号用英文逗号隔开'
            )
          );
        } else {
          callback(new Error('请输入手机号'));
        }
      }
    };
    let DATA: any = reactive({
      // 短信表单
      SMSData: {
        id: '',
        maintenanceContact: '',
        smsContent: '',
        templateCode: '',
        unitId: '',
        unitName: '',
      },
      SMSDataCopy: {},
      hostName: '主机1',
      hostUid: '主机编号00001',
      channelName: '通道1',
      channelCode: '通道编号00001',
      electricRoom: '电房1',
      busWay: '母线槽1',
      type: '温度过高',
      warningDate: filterTime(new Date()),
      SMSContent: '',
      rules: {
        smsContent: [
          { required: true, message: '请输入短信内容', trigger: 'change' },
        ],
        maintenanceContact: [
          { required: true, message: '请输入手机号', trigger: 'change' },
          { validator: validatePhones, trigger: 'blur' },
        ],
      },
      loading: false,
      maintenanceContact: '',
      submitSmsContent: '',
    });
    let METHODS: any = reactive({
      handleInputSMS: () => {
        DATA.SMSContent = DATA.SMSData.smsContent.replace(
          /\$\{hostName\}|\$\{hostUid\}|\$\{channelName\}|\$\{channelCode\}|\$\{electricRoom\}|\$\{busWay\}|\$\{type\}|\$\{warningDate\}/g,
          (keyword: string) => {
            let replacement = '';
            switch (keyword) {
              case '${hostName}':
                replacement = `<i style="color:#f00">${DATA.hostName}</i>`;
                break;
              case '${hostUid}':
                replacement = `<i style="color:#f00">${DATA.hostUid}</i>`;
                break;
              case '${channelName}':
                replacement = `<i style="color:#f00">${DATA.channelName}</i>`;
                break;
              case '${channelCode}':
                replacement = `<i style="color:#f00">${DATA.channelCode}</i>`;
                break;
              case '${electricRoom}':
                replacement = `<i style="color:#f00">${DATA.electricRoom}</i>`;
                break;
              case '${busWay}':
                replacement = `<i style="color:#f00">${DATA.busWay}</i>`;
                break;
              case '${type}':
                replacement = `<i style="color:#f00">${DATA.type}</i>`;
                break;
              case '${warningDate}':
                replacement = `<i style="color:#f00">${DATA.warningDate}</i>`;
                break;
              default:
                break;
            }
            return replacement;
          }
        );
      },
      handleSave: () => {
        delete DATA.SMSData.createTime;
        delete DATA.SMSData.updateTime;
        let message = '';
        DATA.maintenanceContact = (
          DATA.SMSData.maintenanceContact as string
        ).replace(/\n/g, () => {
          return '';
        });
        DATA.submitSmsContent = (DATA.SMSData.smsContent as string).replace(
          /\n/g,
          () => {
            return '';
          }
        );
        proxy.$refs['refForm'].validate(async (valid: boolean) => {
          if (valid) {
            DATA.loading = true;
            let { data } = await updateTemplate({
              ...DATA.SMSData,
              maintenanceContact: DATA.maintenanceContact,
              smsContent: DATA.submitSmsContent,
            });
            if (data.code === RES_SUCCESS) {
              // if (data.data.templateStatus === 0) {
              //   message = '保存成功，等待审核中';
              // } else {
              //   message = '保存成功,短信模板内容未发生修改无需等待审核';
              // }
              ElMessage({
                message: '保存成功',
                type: 'success',
              });
              DATA.loading = false;
              ROUTER.push('/dream/dreamSend');
              STORE.state.data.notifyList.forEach(
                (item: any, index: number) => {
                  if (item.id == DATA.SMSData.id) {
                    STORE.state.data.notifyList.splice(index, 1);
                    STORE.commit('setNotifyList', STORE.state.data.notifyList);
                  }
                }
              );
            } else {
              history.go(-1);
            }
          }
        });
      },
      handleBack: () => {
        history.go(-1);
      },
    });

    onMounted(() => {
      DATA.SMSData = Object.assign({}, STORE.state.data.SMSData);
      DATA.SMSDataCopy = Object.assign({}, STORE.state.data.SMSData);
      DATA.SMSData.smsContent && METHODS.handleInputSMS();
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
.dreansetting_container {
  .bar {
    width: 5px;
    height: 100%;
    display: inline-block;
    background-color: #000;
    margin-right: 10px;
  }
  .dreanse_hint {
    display: inline-block;
    width: 105%;
  }
  /deep/ .el-textarea__inner {
    height: 240px;
  }
  .btn-w-100 {
    width: 100px;
  }
  .mb-30 {
    margin-bottom: 30px;
  }
  // 手机
  .phone {
    position: relative;
    width: 300px;
    height: 600px;
    margin-top: 100px;
    margin-left: 50px;
    .phone-head {
      position: absolute;
      width: 300px;
      top: -65px;
    }
    .phone-left {
      position: absolute;
      height: 534px;
      transform: translateX(-1px);
      left: 0;
    }
    .phone-right {
      position: absolute;
      height: 534px;
      transform: translateX(0.5px);
      right: 0;
    }
    .phone-bottom {
      position: absolute;
      width: 300px;
      bottom: 0;
    }
    .phone-content {
      background-color: #f2f2f2;
      width: 80%;
      margin: 0 auto;
      word-wrap: break-word;
      text-indent: 8px;
      padding: 10px 2px;
    }
  }
}
</style>