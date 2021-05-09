<template>
  <div>
    <!-- 面包屑导航 -->
    <bread-crumb>
      <span slot="first">商品管理</span>
      <span slot="second">商品列表</span>
    </bread-crumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="GoodsList" border stripe>
        <el-table-column type="expand"></el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template v-slot:default="scope">{{scope.row.add_time | showDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot:default="scope">
            <el-button type="primary" icon="el-icon-edit" size="small"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="deleteGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页区域 -->
    <pagination
      :queryInfo="this.queryInfo"
      :total="this.total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    ></pagination>
  </div>
</template>
<script>
import breadCrumb from "components/common/BreadCrumb/breadcrumb"
import pagination from "components/common/Pagination/pagination"

import {formatDate} from "common/utils"

import {
  getGoodsData,
  deleteGoodsData
} from "network/goods"

export default {
  name: 'goodsList',
  components: {
    breadCrumb,
    pagination
  },
  data() {
    return {
      // 请求商品列表数据的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 保存商品列表页面的数据
      GoodsList: [],
      // 总数据条数
      total: 0,
    }
  },
  methods: {
    /**
     * 网络请求相关的方法
     */
    // 根据分页获取对应的商品列表
    getGoodsList() {
      getGoodsData(this.queryInfo).then(res => {
        this.GoodsList = res.data.goods
        this.total = res.data.total
        console.log(this.GoodsList);
      })
    },
    deleteGoods(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGoodsData(id).then(res => {
          const meta = res.meta
          this.successOrfail(meta.status,200,"删除失败",meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getGoodsList()
        })  
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    /**
     * 监听事件请求的方法
     */
    // 修改分页栏的当前条数获取不同的数据
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getGoodsList()
    },
    // 修改分页栏的当前页码获取不同的数据
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    successOrfail(status,num,fail,success) {
      if(status !== num) {
        return this.$message({type:'error',message:fail})
      }
      this.$message({
        type: 'success',
        message: success
      })
    },
    // 搜索相关内容的方法
    searchGoods() {
      let pagenum = this.queryInfo.pagenum
      console.log(pagenum);
      this.queryInfo.pagenum = 1
      this.getGoodsList()
      this.queryInfo.pagenum = pagenum
    },
    goAddPage() {
      this.$router.push('/goods/add')
    },
  },
  filters: {
    showDate: function(value) {
      let date = new Date(value * 1000)
      return formatDate(date, "yyyy-MM-dd hh:mm")
    }
  },
  created() {
    this.getGoodsList()
    console.log('商品列表页面被创建');
  },
  mounted() {
    this.$bus.$on('pagerefresh', () => {
      this.getGoodsList()
    })
  },
  destroyed() {
    console.log('商品列表页面被销毁');
  }
}
</script>
<style lang="less" scoped>
</style>