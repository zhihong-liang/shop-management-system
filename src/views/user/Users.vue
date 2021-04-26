<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb>
      <span slot="first">用户管理</span>
      <span slot="second">用户列表</span>
    </breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="checkUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogFormVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 展示用户表单 -->
      <el-table :data="userlist" style="width: 100%" :border="true" stripe>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              @change="UserStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditdialogVisible(scope.row.id)"
            ></el-button>
            <el-button
              @click="handleDelete(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-s-tools"
                @click="showdistdialogVisible(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页管理 -->
      <pagination
        :queryInfo="queryInfo"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      ></pagination>

      <!-- 点击添加用户后弹出的对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogFormVisible" @close="addDialogClosed">
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" placeholder="请输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="adduser">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 点击 编辑按钮 弹出的对话框 -->
      <el-dialog title="用户编辑" :visible.sync="dialogEditVisible" @close="editDialogClosed">
        <!-- 内容主体区 -->
        <el-form :model="EditForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="EditForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="EditForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="EditForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="edituser">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 点击 分配角色 弹出的对话框 -->
      <el-dialog title="分配角色" :visible.sync="dialogDistributionVisible">
        <p>当前的用户：{{currentObjInfoList.username}}</p>
        <p>当前的角色：{{currentObjInfoList.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
        <!-- 底部区域 -->
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import breadcrumb from "components/common/BreadCrumb/breadcrumb"
import pagination from "components/common/Pagination/pagination"

import {
  getUsers,
  changeUserState,
  addUser,
  deleteUser,
  queryUser,
  editUser,
  Distselector,
  queryRoles
} from 'network/users'

import {formatDate} from 'common/utils'

export default {
  name: 'User',
  inject: ['reload'],
  components: {
    breadcrumb,
    pagination
  },
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if(regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if(regMobile.test(value)) {
        // 合法的手机号
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],       // 用户数据列表
      addForm: {          // 添加用户表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min:3, max:10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min:6, max:20, message: '密码的长度在6~20个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 查询到的用户信息对象
      EditForm: {},
      total: 0,
      value: true,
      input: '',
      dialogFormVisible: false,   //控制添加用户对话框的显示和隐藏
      dialogEditVisible: false,   //控制编辑用户对话框的显示和隐藏
      dialogDistributionVisible: false,   //控制编辑角色对话框的显示和隐藏
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 用户对应角色信息列表
      currentObjInfoList: {},
      // 所有角色的数据列表
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: '',
    }
  },
  methods: {
    /**
     * 网络请求相关的方法
     */

    // 申请用户数据功能
    getUserList() {
      getUsers(this.queryInfo).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: '获取用户列表失败',
            type: 'error'
          })
        }
        this.userlist = res.data.users
        this.total = res.data.total
      })
    },

    // 监听用户状态改变的事件
    UserStatusChange(states) {
      changeUserState(states).then(res => {
        if(res.meta.status !== 200) {
          this.states.mg_state = !this.states.mg_state
          return this.$message({
            message: '用户状态更新失败',
            type: 'error'
          })
        }
        return this.$message({
          message: '用户状态更新成功',
          type: 'success'
        })
      })
    },

    // 监听 添加用户 事件
    adduser() {
      this.$refs.addFormRef.validate(valid => {
        if(valid) {
          addUser(this.addForm).then(res => {
            this.$message({
              message: '添加用户成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getUserList();
          })
        } else {
            return this.$message({
                     message: '请输入正确的格式',
                     type: 'error'
                   })
          }
      })
    },

     // 根据 id 删除用户功能
    handleDelete(id) {
      this.$confirm('确定永久删除该账户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {   //点击确认后要执行的代码
        // 1.必须先通过删除接口删掉数据库中对应的数据
        deleteUser(id).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: '删除用户失败',
            type: 'error'
          })
        } else {
            this.$message({
              message: '删除用户成功',
              type: 'success'
            })
            this.getUserList()
          }
        })
      }).catch(() => {    //点击取消后要执行的代码
        this.$message({
            type: 'info',
            message: '已取消删除'
          });          
      })
    },

    // 点击编辑按钮弹出谈话框事件
    showEditdialogVisible(id) {
      // 显示出谈话框
      this.dialogEditVisible = true
      // 根据id获取到相应的用户信息
      queryUser(id).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: 'id获取失败',
            type: 'error'
          })
        } else {
          this.EditForm = res.data
        }
      })
    },

    // 编辑用户信息功能
    edituser() {
      // 编辑表单的 预验证 
      this.$refs.editFormRef.validate(valid => {  
        if(valid === false) {
          return this.$message({
            message: '信息格式错误，请输出正确的格式',
            type: 'error'
          })
        }
  
        editUser(this.EditForm).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: '信息更新失败',
            type: 'error'
          })
        } else {
            this.$message({
              message: '信息更新成功',
              type: 'success'
            })
            this.reload()
          }
        })
        this.dialogEditVisible = false
      })
    },

    showdistdialogVisible(obj) {
      this.currentObjInfoList = obj
      queryRoles().then(res => {
        this.roleList = res.data
        console.log(this.roleList);
      })
      this.dialogDistributionVisible = true
    },

    saveRoleInfo() {
      if(!this.selectedRoleId) return this.$message({type:'error',message:"请选择要分配的角色"})
      Distselector(this.currentObjInfoList.id,this.selectedRoleId).then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            type: 'error',
            message: '角色设置失败'
          })
        }
        this.$message({
          type: 'success',
          message: '角色设置成功'
        })
        this.dialogDistributionVisible = false;
        this.getUserList()
      })
    },

    /**
     * 事件监听相关的方法
     */
    // 监听 pagesize 改变的事件
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },

    // 搜索用户功能
    checkUser(){
      let pageNum = this.queryInfo.pagenum;
      this.queryInfo.pagenum = 1;
      this.getUserList();
      this.queryInfo.pagenum = pageNum
    },

    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields() // 对话框关闭时表单状态重置
    },

    // 监听编辑用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields() // 对话框关闭时表单状态重置
    },
  },
  created() {
    this.getUserList()
  },
}
</script>

<style lang="less" scoped>
</style>