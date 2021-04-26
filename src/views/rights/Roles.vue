<template>
  <div>
    <!-- 面包屑导航 -->
    <breadcrumb>
      <span slot="first">权限管理</span>
      <span slot="second">角色列表</span>
    </breadcrumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'center']"
              v-for="(item1,index) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removepower(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'center']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag closable type="success" 
                            @close="removepower(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      :class="[index3 === 0 ? '' : 'bdtop']"
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      closable
                      type="warning"
                      @close="removepower(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showEditRoleDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="RemoveRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 点击 添加角色 按钮弹出的对话框 -->
    <el-dialog title="添加角色" :visible.sync="AddRoledialogVisible" @close="addRoleFormClosed">
      <el-form :model="addRoles" ref="addRoleFormRef" label-width="120px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoles.roleName" placeholder="请输入角色名"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="AddRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 点击 编辑 按钮弹出的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="EditRoledialogVisible" @close="editRoleFormClosed">
      <el-form :model="editRoles" ref="editRoleFormRef" label-width="120px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleName"> 
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="EditRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editrole(editRoles)">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 点击 分配权限 按钮后弹出的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree :data="AllRightsList"
               show-checkbox 
               default-expand-all 
               :default-checked-keys="defKeys"
               highlight-current
               node-key="id"
               :props="treeProps"
               ref="treeRef"></el-tree>
      <div slot="footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import breadcrumb from "components/common/BreadCrumb/breadcrumb"

import {
  getRolesData,
  addRoles,
  deleteRoles,
  editRoles,
  removeRolesPower,
  getAllRightList,
  RoleAuthorization
} from "network/power"

export default {
  name: 'Roles',
  inject: ['reload'],
  components: {
    breadcrumb
  },
  data() {
    return {
      roleList: [],
      // 点击添加角色按钮的对话框值
      AddRoledialogVisible: false,
      // 点击编辑角色按钮弹出的对话框值
      EditRoledialogVisible: false,
      // 点击分配权限按钮弹出的对话框值
      setRightdialogVisible: false,
      addRoles: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色列表
      editRoles: {},
      // 角色目前所拥有的所有权限列表
      AllRightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  methods: {
    /**
     * 网络类型事件
     */
    getRolesList() {
      getRolesData().then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: '权限列表信息获取失败',
            type: 'error'
          })
        }
        this.roleList = res.data
      })
    },
    addrole() {
      this.$refs.addRoleFormRef.validate(valid => {
        if(valid === 'false'){
          return this.$message({
            message: '格式错误，请重新输入',
            type: 'error'
          })
        }
        addRoles(this.addRoles).then(res => {
          const status = res.meta.status
          this.successOrfailMessage(status,201,'添加角色失败','添加角色成功')
          this.AddRoledialogVisible = false
          this.reload()
        })
      })
    },
    RemoveRole(roleobj) {
      this.$confirm('确定永久删除该角色，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 点击确定后要执行的代码
        deleteRoles(roleobj).then(res => {
          const status = res.meta.status
          this.successOrfailMessage(status,200,'删除角色失败','删除角色成功')
          this.reload()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    editrole(obj) {
      editRoles(obj).then(res => {
        const status = res.meta.status
        this.successOrfailMessage(status,200,'修改角色失败','修改角色成功')
        this.EditRoledialogVisible = false
        this.reload()
      })
    },
    removepower(role,rightId) {
      this.$confirm('确定永久删除该账户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRolesPower(role,rightId).then(res => {
          const meta = res.meta
          this.successOrfailMessage(meta.status,200,'取消权限失败',meta.msg)
          // 把服务器反馈回来的数据重新赋值给当前对象
          role.children = res.data
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    showSetRightDialog(Rolesobj) {
      // 获取所有权限的数据
      getAllRightList().then(res => {
        this.AllRightsList = res.data
      })
      // 递归获取三级节点的 Id
      this.getLeafKeys(Rolesobj,this.defKeys)
      this.roleId = Rolesobj.id
      this.setRightdialogVisible = true
    },
    // 分配权限
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const IdStr = keys.join(',')
      RoleAuthorization(this.roleId, IdStr).then(res => {
        const meta = res.meta
        this.successOrfailMessage(meta.status, 200, '更新失败', meta.msg)
        this.setRightdialogVisible = false
        this.reload()
      })
    },

    /**
     * 监听类型事件
     */
    showAddRoleDialog() {
      this.AddRoledialogVisible = true
    },
    showEditRoleDialog(obj) {
      this.EditRoledialogVisible = true
      this.editRoles = obj
    },
    addRoleFormClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    editRoleFormClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    setRightDialogClosed() {
      // 每次关闭分配权限按钮时必须清空 defKeys 内的值
      this.defKeys = []
    },
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
    // 通过递归的形式，获取角色下所有三级权限的 id ,并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    }
  },
  created() {
    this.getRolesList();
  },
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>