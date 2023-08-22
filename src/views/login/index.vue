<template>
  <div class="container">
    <div class="container_login">
      <h3 class="login_title">电力母线智能测控预警系统</h3>
      <div class="login_item">
        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRule"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username">
              <template #prefix>
                <i class="iconfont icon-yonghu"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="isShowPwd ? 'password' : 'text'"
              @keydown.enter="handleLogin"
            >
              <template #prefix>
                <i class="iconfont icon-icon"></i>
              </template>
              <template #suffix>
                <i
                  v-if="isShowPwd"
                  class="iconfont icon-kanbujian"
                  @click="handleClickIcon"
                ></i>
                <i
                  v-if="!isShowPwd"
                  class="iconfont icon-kanjian"
                  @click="handleClickIcon"
                ></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="login_foot">
        <el-button
          :loading="loading"
          class="sign_btn"
          type="primary"
          @click="handleLogin"
        >登录</el-button>
        <el-button
          class="sign_btn"
          type="primary"
          @click="handleReset"
        > 重置</el-button>
      </div>
    </div>
    <!-- 二次验证模态框 -->
    <el-dialog
      title="二次验证"
      v-model="dialogFormVisible"
      @close="closeDialogFormVisible"
    >
      <div style="text-align:center">
        <h4 class="mb-10">动态验证码有4次的容错，也就是说最近2分钟的验证码都有效</h4>
      </div>
      <el-input
        v-model="code"
        placeholder="请输入动态密码"
      ></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="VerifyModalTwice"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, getCurrentInstance } from 'vue';
import md5 from 'js-md5';
import { useStore } from 'vuex';
import { RES_SUCCESS, sessionWrite } from '@/api/common/common';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const STORE = useStore();
    const ROUTER = useRouter();
    let DATA: any = reactive({
      loginForm: {
        username: '',
        password: '',
      },
      isShowPwd: true,
      loginRule: {
        username: { required: true, message: '请输入用户名', trigger: 'blur' },
        password: {
          required: true,
          message: '请输入密码',
          trigger: 'blur',
        },
      },
      loading: false,
      code: '',
      dialogFormVisible: false,
    });
    let METHODS: any = reactive({
      // 点击密码框图标
      handleClickIcon: () => {
        DATA.isShowPwd = !DATA.isShowPwd;
      },
      // 重置
      handleReset: () => {
        proxy.$refs['loginRef'].clearValidate();
        DATA.loginForm = Object.assign(
          {},
          {
            username: '',
            password: '',
          }
        );
      },
      // 登录
      handleLogin: () => {
        proxy.$refs['loginRef'].validate((valid: boolean) => {
          if (valid) {
            DATA.loading = true;
            DATA.loginForm.password = md5(DATA.loginForm.password);
            STORE.dispatch('Login', DATA.loginForm)
              .then((res) => {
                if (res.data.data.isBinding) {
                  DATA.dialogFormVisible = true;
                  STORE.commit('setBindingState', res.data.data.isBinding);
                } else {
                  if (res.data.code === RES_SUCCESS) {
                    ROUTER.push('/');
                  }
                  STORE.commit('setBindingState', res.data.data.isBinding);
                }
              })
              .catch(() => {
                DATA.loginForm.password = '';
                DATA.loading = false;
              });
          }
        });
      },
      // 确认二次绑定
      VerifyModalTwice() {
        if (!DATA.code) {
          ElMessage({
            message: '请输入动态密码',
            type: 'warning',
          });
          return;
        }
        STORE.dispatch('TwoLogin', {
          code: DATA.code,
          ...DATA.loginForm,
        }).then((res) => {
          if (res.data.code == 200) {
            //登录成功
            proxy.$message({
              type: 'success',
              message: '登录成功',
            });
            DATA.loading = false;
            //跳转
            ROUTER.push({ path: '/' });
          }
        });
      },
      closeDialogFormVisible() {
        DATA.loading = false;
        DATA.code = '';
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
.container {
  width: 100vw;
  height: 100vh;
  background-image: url('../../assets/image/login_bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  overflow: hidden;
  .container_login {
    width: 20%;
    height: 60%;
    min-width: 325px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 20px;
    border-radius: 16px;
    backdrop-filter: blur(10px);
    background-color: rgba(237, 227, 236, 0.404);
    box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px;
    border: 0px rgba(255, 255, 255, 0.4) solid;
    border-bottom: 0px rgba(40, 40, 40, 0.35) solid;
    border-right: 0px rgba(40, 40, 40, 0.35) solid;
    &::-webkit-scrollbar {
      width: 0;
    }
    .login_title {
      width: 100%;
      text-align: center;
      letter-spacing: 0.4em;
      color: #45607a;
      // flex: 1;
      height: 150px;
      line-height: 150px;
      font-size: 0.9375vw;
    }
    .login_item {
      width: 70%;
      // flex: 5;
      flex: 1;
      /deep/ .el-input__prefix {
        margin-left: 5px;
      }
    }
    .login_foot {
      width: 70%;
      height: 400px;
      display: flex;
      flex-direction: column;
      // justify-content: center;
      margin-top: 20px;
      .sign_btn {
        width: 100%;
        background-color: #2e416c;
        border-radius: 28px;
        border: 0;
        font-weight: bold;
        color: #f6f6f6;
        display: block;
        margin-bottom: 10px;
        letter-spacing: 0.2em;
      }
      .el-button + .el-button {
        margin: 0 !important;
      }
    }
  }
}
</style>