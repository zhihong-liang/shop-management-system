<template>
  <div>
    <bread-crumb>
      <span slot="first">商品管理</span>
      <span slot="second">参数列表</span>
    </bread-crumb>

    <el-card>
      <!-- 警告消息栏 -->
      <el-alert type="warning" show-icon title="注意：只允许为第三级分类设置相关参数！" :closable="false"></el-alert>

      <!-- 商品分类栏 -->
      <div>
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedValue"
          :options="paramsList"
          :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: 'true' }"
          @change="handleChange"
        ></el-cascader>
      </div>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            class="button-mg15"
            :disabled="isbtnDisabled"
            @click="showAddDialog"
          >添加参数</el-button>

          <my-table
            :data="dynamicParamsList"
            :name="dynamicParaTableName"
            @showEditDialog="showEditDialog(arguments)"
            @isDeleteParams="deleteParams(arguments)"
          >
            <template v-slot:expand>
              <el-table-column type="expand">
                <template v-slot:default="scope">
                  <my-tags :dynamicTags="scope.row" 
                           @addParamsValue="addParamsValue"
                           @deleteParamsValue="deleteParamsValue"></my-tags>
                </template>
              </el-table-column>
            </template>
          </my-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            class="button-mg15"
            :disabled="isbtnDisabled"
            @click="showAddDialog"
          >添加属性</el-button>

          <my-table
            :data="staticAttributeList"
            :name="staticAttrTableName"
            @showEditDialog="showEditDialog(arguments)"
            @isDeleteParams="deleteParams(arguments)"
          >
            <template v-slot:expand>
              <el-table-column type="expand">
                <template v-slot:default="props">
                  <my-tags :dynamicTags="props.row" 
                           @addParamsValue="addParamsValue"
                           @deleteParamsValue="deleteParamsValue"></my-tags>
                </template>
              </el-table-column>
            </template>
          </my-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加按钮的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText + '：'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑按钮的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText + '：'" prop="cat_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import breadCrumb from "components/common/BreadCrumb/breadcrumb"
import myTable from "components/common/Table/mytable"
import myTags from "components/common/Tag/mytag"

import {
  getParentCateDate,
  getTargetParams,
  addTargetParams,
  editTargetParams,
  queryTargetParams,
  deleteTargetParams,
  addTag
} from "network/goods"
export default {
  name: 'goodsParams',
  data() {
    return {
      // 选择商品分类的数据
      paramsList: [],
      // 选中的值
      selectedValue: [],
      // 选中面板的值
      activeName: 'many',
      // 获取目标的动态参数的列表
      dynamicParamsList: [],
      // 获取目标的静态属性的列表
      staticAttributeList: [],
      dynamicParaTableName: '参数名称',
      staticAttrTableName: '参数名称',
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑对话框的显示和隐藏
      editDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: '',
        attr_sel: [],
      },
      addParamsTag: {

      },
      // 编辑参数的表单数据对象
      editForm: {
        attrId: '',
        attr_name: '',
        attr_sel: [],
      },
      // 添加参数的表单的验证对象
      addFormRules: {
        attr_name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'}
        ]
      },
      // 编辑参数的表单的验证对象
      editFormRules: {
        attr_name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'}
        ]
      }
    }
  },
  components: {
    breadCrumb,
    myTable,
    myTags
  },
  methods: {
    /**
     * 网络请求相关方法
     */
    getParamsList() {
      getParentCateDate().then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type: 'error',message: '数据获取失败'})
        }
        this.paramsList = res.data
      })
    },
    // 根据所选分类的 Id ,和当前所处的面板，获取对应的参数
    getTargetData() {
      getTargetParams(this.isThreeLevelParams,this.activeName).then(res => {
        if(this.activeName === 'many') {
          this.addForm.attr_sel.splice(0,1,this.activeName)
          this.editForm.attr_sel.splice(0,1,this.activeName)
          this.dynamicParamsList = res.data
        } else {
          this.addForm.attr_sel.splice(0,1,this.activeName)
          this.editForm.attr_sel.splice(0,1,this.activeName)
          this.staticAttributeList = res.data
        }
      })
    },
    // 添加参数或者添加属性
    addParams() {
      addTargetParams(this.isThreeLevelParams,this.addForm).then(res => {
        if(res.meta.status !== 201) {
          return this.$message({type:'error',message:'添加参数失败'})
        }
        this.addDialogVisible = false
        this.getTargetData()
      })
    },
    // 在目标参数下添加 tag 标签
    addParamsValue(attrVal) {
      addTag(this.isThreeLevelParams,attrVal).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type:'error',message:'添加失败'})
        }
        this.$message({
          type:'success',
          message: '添加成功'
        })
      })
    },
    // 显示编辑按钮对话框
    showEditDialog(e) {
      this.editDialogVisible = e[0];
      this.editForm.attrId = e[1]
      queryTargetParams(this.selectedValue[2],this.editForm).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type:'error',message:'获取数据失败'})
        }
        this.editForm.attr_name = res.data.attr_name
      })
    },
    // 编辑参数
    editParams() {
      editTargetParams(this.isThreeLevelParams,this.editForm).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type:'error',message:'修改参数失败'})
        }
        this.$message({
          type: 'success',
          message: '修改参数成功'
        })
        this.editDialogVisible = false
        this.getTargetData()
      })
    },
    // 删除参数
    deleteParams(e) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTargetParams(this.isThreeLevelParams,e[0]).then(res => {
          if(res.meta.status !== 200) {
            return this.$message({type:'error',message:'删除参数失败'})
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getTargetData()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    // 删除目标参数下的 tab 标签
    deleteParamsValue(obj) {
      addTag(this.isThreeLevelParams,obj).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({type:'error',message:'删除失败'})
        }
        this.$message({
          type:'success',
          message: '删除成功'
        })
      })
    },

    /**
     * 监听事件请求相关方法
     */

    // 级联选择框选中项变化，会触发这个函数
    handleChange() {
      if(this.selectedValue.length <= 2) {
        this.$message({type:"error",message:"一二级分类不能选择，请选择三级分类"})
        this.selectedValue = []
        this.dynamicParamsList = []
        this.staticAttributeList = []
        return
      }
      this.getTargetData();
      this.$message({type:"success",message:"分类参数获取成功"})
    },
    // 标签面板切换时会发出不同的数据请求
    handleClick() {
      this.getTargetData();
    },
    // 显示添加按钮对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 添加按钮对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑按钮对话框关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
  },
  computed: {
    // 检测是否为三级参数，是则返回，否则返回 null
    isThreeLevelParams() {
      if(this.selectedValue.length === 3) {
        return this.selectedValue[2]
      }
      return null
    },
    isbtnDisabled() {
      if(this.selectedValue.length !== 3) {
       return true
      } else {
        return false
      }
    },
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  created(){
    this.getParamsList()
  }
}
</script>
<style lang="less" scoped>
</style>