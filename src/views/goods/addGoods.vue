<template>
  <div>
    <!-- 面包屑导航 -->
    <bread-crumb>
      <span slot="first">商品管理</span>
      <span slot="second">添加商品</span>
    </bread-crumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" :align-center="true">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="tabPosition"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品名称：" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="CateList"
                clearable
                :props="{ expandTrigger: 'hover' , value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: 'true'}"
                :style="{width: '250px'}"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in dynamicParamsList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(item2,index) in item.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="(item,index) in staticPropsList"
              :key="index"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="getPhotoPath"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹出的对话框 -->
    <el-dialog :visible.sync="previewDialogVisible" width="30%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
import breadCrumb from 'components/common/BreadCrumb/breadcrumb'

import {
  getCateData,
  getTargetParams,
  addGoodsData
} from "network/goods"

export default {
  name: 'addGoods',
  data() {
    return {
      activeIndex: '0',
      tabPosition: 'left',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的表单验证规则对象
      addFormRules: {
        goods_name: [
          {
            required: true, message: '请输入商品名称', trigger: 'blur'
          },
        ],
        goods_price: [
          {
            required: true, message: '请输入商品价格', trigger: 'blur'
          },
        ],
        goods_weight: [
          {
            required: true, message: '请输入商品重量', trigger: 'blur'
          },
        ],
        goods_number: [
          {
            required: true, message: '请输入商品数量', trigger: 'blur'
          },
        ],
        goods_cat: [
          {
            required: true, message: '请选择商品分类', trigger: 'blur'
          },
        ],
      },
      // 所有分类数据
      CateList: [],
      // 动态参数列表数据
      dynamicParamsList: [],
      // 静态属性列表数据
      staticPropsList: [],
      // 上传图片的URL地址
      uploadURL: "http://www.ysqorz.top:8888/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      previewPath: '',
      // 控制图片预览对话框的显示和隐藏
      previewDialogVisible: false
    }
  },
  components: {
    breadCrumb
  },
  methods: {
    /**
     * 网络请求相关方法
     */
    getCateList() {
      getCateData().then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type: 'error',message: '数据获取失败'})
        }
        this.CateList = res.data
      })
    },
    tabClicked() {
      if(this.activeIndex === '1') {
        getTargetParams(this.isthreeLevelParams,'many').then(res => {
          if(res.meta.status !== 200) {
            return this.$message({type: 'error', message: '数据获取失败'})
          }
          this.dynamicParamsList = res.data
          this.toBeArray
        })
      } else if(this.activeIndex === '2') {
        getTargetParams(this.isthreeLevelParams,'only').then(res => {
          if(res.meta.status !== 200) {
            return this.$message({type: 'error', message: '数据获取失败'})
          }
          this.staticPropsList = res.data
        })
      }
    },
    addGoods() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 处理动态参数
        this.dynamicParamsList.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(obj)
        })
        // 处理静态属性
        this.staticPropsList.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(obj)
        })
        // 深拷贝addForm
        const Form = JSON.parse(JSON.stringify(this.addForm))
        // 处理goods_cat 转化为字符串
        Form.goods_cat = Form.goods_cat.join(',')
        addGoodsData(Form).then(res => {
          console.log(res);
          if(res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message({
            type: 'success',
            message: res.meta.msg
          })
          this.$router.push('/goods')
          this.$bus.$emit('pagerefresh')
        })
      })
    },

    /**
     * 监听事件相关的方法
     */
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      this.isthreeLevelParams
    },
    beforeTabLeave(activeName, oldActiveName) {
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类和商品名称')
        return false
      }
    },
    // 处理图片预览的函数
    handlePreview(file) {
      this.previewPath = 'http://www.ysqorz.top:8888/' + file.response.data.tmp_path
      this.previewDialogVisible = true
    },
    // 处理点击图片删除的函数
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(i => i.pic === filePath)
      this.addForm.pics.splice(index,1);
      console.log(this.addForm);
    },
    // 
    getPhotoPath(response) {
      const pathObj = {}
      pathObj.pic = response.data.tmp_path
      this.addForm.pics.push(pathObj)
      console.log(this.addForm);
    },
  },
  computed: {
    isthreeLevelParams() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        this.addForm.goods_cat = []
        return this.$message({type:'error',message:'请选择三级参数'})
      }
    },
    toBeArray() {
      this.dynamicParamsList.forEach((item) => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
      })
    }
  },
  created() {
    this.getCateList()
  },
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px !important;
}
.previewImg {
  width: 100%;
}
.el-button {
  margin-top: 15px;
}
</style>