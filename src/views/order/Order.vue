<template>
  <div>
    <!-- 面包屑导航 -->
    <bread-crumb>
      <span slot="first">订单管理</span>
      <span slot="second">订单列表</span>
    </bread-crumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <!-- 搜索栏区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template v-slot:default="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="150px">
          <template v-slot:default="scope">{{scope.row.create_time | showDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-outline"
              size="mini"
              @click="showLogisticsInfo"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页功能 -->
      <pagination
        :total="total"
        :queryInfo="queryInfo"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      ></pagination>

      <!-- 点击编辑按钮弹出的对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="addressForm.address1"
              :options="citydata"
              :props="{ expandTrigger: 'hover', value: 'value', label: 'label', checkStrictly: 'true' }"
            ></el-cascader>
          </el-form-item>

          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流信息对话框 -->
      <el-dialog title="物流进度" :visible.sync="logisticsInfoDialogVisible" width="50%">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import breadCrumb from 'components/common/BreadCrumb/breadcrumb'
import pagination from 'components/common/Pagination/pagination'

import citydata from 'views/order/citydata'

import {formatDate} from 'common/utils'

import {
  getOrderData,
  getTargetLogisticsInfo,
} from 'network/order'

export default {
  name: 'Order',
  data() {
    return {
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 订单总量
      total: 0,
      // 控制修改地址对话框的显示和隐藏
      editDialogVisible: false,
      // 控制物流信息对话框的显示和隐藏
      logisticsInfoDialogVisible: false,
      // 修改地址数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址规则的数据对象
      addressFormRules: {
        address1: [
          {required: true, message: '请选择省市区/县', trigger: 'blur'}
        ],
        address2: [
          {required: true, message: '请填写详细地址', trigger: 'blur'}
        ]
      },
      // 城市对象
      citydata,
      progressInfo: [
        {
          "time": "2018-05-10 09:39:00",
          "ftime": "2018-05-10 09:39:00",
          "context": "已签收,感谢使用顺丰,期待再次为您服务",
          "location": ""
        },
        {
          "time": "2018-05-10 08:23:00",
          "ftime": "2018-05-10 08:23:00",
          "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          "location": ""
        },
        {
          "time": "2018-05-10 07:32:00",
          "ftime": "2018-05-10 07:32:00",
          "context": "快件到达 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-10 02:03:00",
          "ftime": "2018-05-10 02:03:00",
          "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-09 23:05:00",
          "ftime": "2018-05-09 23:05:00",
          "context": "快件到达 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 21:21:00",
          "ftime": "2018-05-09 21:21:00",
          "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 13:07:00",
          "ftime": "2018-05-09 13:07:00",
          "context": "顺丰速运 已收取快件",
          "location": ""
        },
        {
          "time": "2018-05-09 12:25:03",
          "ftime": "2018-05-09 12:25:03",
          "context": "卖家发货",
          "location": ""
        },
        {
          "time": "2018-05-09 12:22:24",
          "ftime": "2018-05-09 12:22:24",
          "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          "location": ""
        },
        {
          "time": "2018-05-08 21:36:04",
          "ftime": "2018-05-08 21:36:04",
          "context": "商品已经下单",
          "location": ""
        }
      ]
    }
  },
  components: {
    breadCrumb,
    pagination
  },
  methods: {
    getOrderList() {
      getOrderData(this.queryInfo).then(res => {
        if(res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.orderList = res.data.goods
        this.total = res.data.total
        console.log(this.orderList);
      })
    },
    showEditDialog() {
      this.editDialogVisible = true
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 修改地址对话框实现关闭时表单重置
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流信息
    showLogisticsInfo() {
      this.logisticsInfoDialogVisible = true
    }
  },
  created() {
    this.getOrderList()
  },
  filters: {
    showDate: function(value) {
      let date = new Date(value * 1000)
      return formatDate(date, "yyyy-MM-dd hh:mm")
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>