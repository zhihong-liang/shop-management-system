<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb>
      <span slot="first">商品管理</span>
      <span slot="second">商品分类</span>
    </breadcrumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">标签一</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">标签二</el-tag>
          <el-tag size="mini" type="warning" v-else>标签三</el-tag>
        </template>

        <!-- 操作 -->
        <template v-slot:action="scope">
          <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
          <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="AddCatedialogVisible" @close="addCateDialogClosed">
      <el-form
        :model="addCateForm"
        label-width="120px"
        ref="addCateFormRef"
        :rules="addCateFormRule"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" placeholder="请输入角色名"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：" prop="roleDesc">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover' , value: 'cat_id',  label: 'cat_name',  children: 'children', checkStrictly: 'true'}"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="AddCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import breadcrumb from 'components/common/BreadCrumb/breadcrumb'

import {
  getCateData,
  getParentCateDate,
  addcategory
} from 'network/goods'

export default {
  name: 'Category',
  components: {
    breadcrumb
  },
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 8
      },
      // 商品分类的数据列表，默认为空
      categoryList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'action'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      AddCatedialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的时1级分类
        cat_level: 0
      },
      // 添加分类表单验证规则对象
      addCateFormRule: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  methods: {
    /**
     * 网络请求相关事件
     */
    // 获取分类列表数据
    getcateList() {
      getCateData(this.queryInfo).then(res => {
        this.categoryList = res.data.result
        this.total = res.data.total
      })
    },
    // 获取父级分类列表数据
    getParentCateList() {
      getParentCateDate().then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type: 'error',message: '数据获取失败'})
        }
        this.parentCateList = res.data;
      })
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(val => {
        if(val === false) {
          return this.$message({message: '表单格式错误，请重新输入'})
        } else {
          addcategory(this.addCateForm).then(res => {
            const meta = res.meta
            this.successOrfailMessage(meta.status,201,'创建分类失败',meta.msg)
            this.AddCatedialogVisible = false
          })
        }
      })
    },

    /**
     * 监听事件相关的方法
     */
    // 显示 添加分类 对话框
    showAddCateDialog() {
      // 先获取父级分类数据
      this.getParentCateList();
      this.AddCatedialogVisible = true
    },
    // 添加分类对话框关闭
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 选择框内容清空
      this.selectedKeys = []
      // addCateForm 中的 id 和 level 全设置为0
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // 如果 selectedKeys 数组中的 length 大于0，说明选中了父级分类
      // 反之，则说明没有选中任何父级分类
      // 父级分类的id
      if(this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 成功或失败弹出的信息
    successOrfailMessage(status,num,fail,success) {
      if(status !== num) {
        return this.$message({
          message: fail,
            type: 'error'
          })
      }
      this.$message({
        message: success,
        type: 'success'
      })
    },
  },
  created() {
    this.getcateList();
  },
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>