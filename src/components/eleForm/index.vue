<template>
  <el-form
    :model="formData"
    :rules="rules"
    :ref="refForm"
    :label-width="labelWidth + 'px'"
    class="container"
  >
    <template
      v-for="(item,index) of renderFormArr"
      :key="index"
    >
      <!-- solt -->
      <el-form-item
        :label="item.label"
        v-if="item.type==='slot'"
        :prop="item.prop"
      >
        <slot :name="item.slotName"></slot>
      </el-form-item>

      <!-- 输入框 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='input'"
      >
        <el-input
          v-model="formData[item.prop]"
          :type="item.inputType || 'text'"
          :placeholder="item.placeholder"
          :disabled="item.disabled"
          :clearable="item.clearable"
        ></el-input>
      </el-form-item>

      <!-- 选择框 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='select'"
      >
        <el-select
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          :filterable="item.filterable || false"
          :disabled="typeof item.disabled === 'function' ? item.disabled() : item.disabled"
          @change="handleChange(formData,item)"
          :multiple="item.multiple || false"
          :clearable="item.clearable || false"
        >
          <el-option
            v-for="(opt,i) of options[item.prop]"
            :key="i"
            :label="opt[item.title]"
            :value="item.value ? opt[item.value] : opt"
            :disabled="opt.disabled"
          ></el-option>
        </el-select>
      </el-form-item>

      <!-- 时间选择框 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='date'"
      >
        <el-date-picker
          v-model="formData[item.prop]"
          :type="item.dateType || 'datetime'"
          :placeholder="item.placeholder"
          :disabled="item.disabled"
        >
        </el-date-picker>
      </el-form-item>

      <!-- switch按钮 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='switch'"
      >
        <el-switch
          v-model="formData[item.prop]"
          :disabled="item.disabled"
        ></el-switch>
      </el-form-item>

      <!-- 复选框 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='checkbox'"
      >
        <el-checkbox-group
          v-model="formData[item.prop]"
          :disabled="item.disabled"
        >
          <el-checkbox
            v-for="(val,i) of checkboxs[item.prop]"
            :key="i"
            :label="val[item.value]"
          >{{val[item.title]}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 单选框 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='radio'"
      >
        <el-radio-group
          v-model="formData[item.prop]"
          :disabled="item.disabled"
          @change="handleChangeRadio(formData[item.prop])"
        >
          <el-radio
            v-for="(val,i) of radios[item.prop]"
            :key="i"
            :label="val[item.value]"
          >{{val[item.title]}}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 远程搜索 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='autocomplete'"
      >
        <el-autocomplete
          v-model="formData[item.prop]"
          :fetch-suggestions="item.querySearchAsync"
          placeholder="请输入内容"
          @select="handleSelect"
        ></el-autocomplete>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='tag'"
      >
        <el-tag
          class="tag"
          type="info"
        >
          {{formData[item.props] === item.value ? item.filter(formData[item.prop]) : "无"}}
          <i
            class="el-icon-info"
            v-if="!formData[item.prop]"
          ></i>
          <i
            class="el-icon-info"
            v-if="formData[item.props] !== item.value"
          ></i>
        </el-tag>
      </el-form-item>
    </template>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, toRefs } from 'vue';

export default defineComponent({
  props: {
    // 渲染表单数组
    renderFormArr: {
      type: Array,
      default: [],
    },
    // 表单数据
    formData: {
      type: Object,
      default: {},
    },
    // 验证规则
    rules: {
      type: Object,
      default: {},
    },
    // 字段宽度
    labelWidth: {
      type: Number,
      default: 100,
    },
    // 选择框option数组
    options: {
      type: Object,
      default: {},
    },
    // 复选框数组
    checkboxs: {
      type: Object,
      default: {},
    },
    // 单选框数组
    radios: {
      type: Object,
      default: {},
    },
    // 表单ref
    refForm: {
      type: String,
      default: '',
    },
  },
  name: 'elFrom',
  emits: ['handleSelect', 'handleChangeRadio', 'handleChange'],
  setup(prop, { emit }) {
    const { proxy }: any = getCurrentInstance();
    let submitForm = () => {
      return proxy.$refs[prop.refForm].validate();
    };
    let resetForm: any = () => {
      proxy.$refs[prop.refForm].resetFields();
    };
    let clearForm: any = () => {
      proxy.$refs[prop.refForm].clearValidate();
    };
    let validateField: any = (name: string) => {
      proxy.$refs[prop.refForm].validateField(name);
    };
    let handleSelect = (item: any) => {
      emit('handleSelect', item);
    };
    let handleChangeRadio = (item: any) => {
      emit('handleChangeRadio', item);
    };
    let handleChange = (formdata: any, item: any) => {
      emit('handleChange', { formdata, item });
    };
    return {
      resetForm,
      clearForm,
      validateField,
      submitForm,
      handleSelect,
      handleChangeRadio,
      handleChange,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.container {
  .tag {
    font-size: 14px;
    font-weight: 600;
    color: #282c34;
  }
  /deep/ .el-textarea__inner {
    height: 180px;
  }
}
</style>
