<template>
  <div>
    <!-- 面包屑导航 -->
    <bread-crumb>
      <span slot="first">数据统计</span>
      <span slot="second">数据报表</span>
    </bread-crumb>

    <!-- 卡片式内容区域 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 1000px;height:600px;"></div>
    </el-card>
  </div>
</template>
<script>
import breadCrumb from "components/common/BreadCrumb/breadcrumb"

// 导入 echarts 
import echarts from "echarts"

import {getreportsData} from "network/reports"

export default {
  name: 'Report',
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  components: {
    breadCrumb
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    getreportsData().then(res => {
      if(res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      const result = {...this.options,...res.data}
      myChart.setOption(result);
    })
  }
}
</script>
<style lang="less" scoped>
</style>