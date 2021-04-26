<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb>
      <span slot="first">权限管理</span>
      <span slot="second">权限列表</span>
    </breadcrumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import breadcrumb from 'components/common/BreadCrumb/breadcrumb'

import {getRightsData} from 'network/power'
export default {
  name: 'Rights',
  data() {
    return {
      // 表单存储信息的数组
      rightList: []
    }
  },
  components: {
    breadcrumb
  },
  methods: {
    getRightsList() {
      getRightsData().then(res => {
        if(res.meta.status !== 200) {
          return this.$message({
            message: '获取列表信息失败',
            type: 'error'
          })
        }
        this.rightList = res.data
      })
    }
  },
  created() {
    this.getRightsList();
  }
}
</script>
<style lang="less" scoped>
  
</style>