<template>
  <div class="dashboard-container" v-loading="loading">
    <el-card>
      <el-input
        v-model.trim="ipName"
        placeholder="请输入IP地址"
        style="width: 200px"
      ></el-input>
      <el-button type="primary" style="margin-left: 20px" @click="addMachine()"
        >新增机器</el-button
      >
    </el-card>
    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>总览</span>
      </div>
      <div class="typeBox">
        <div class="totalBox">
          <el-progress
            type="circle"
            :percentage="typeList.online_rate"
            :format="format"
          ></el-progress>
          <div class="totalRight">
            <div class="isuse">总数：{{ typeList.total }}</div>
            <div class="istrue">在线：{{ typeList.online_total }}</div>
            <div class="isend">离线：{{ typeList.offline_total }}</div>
          </div>
        </div>
        <div class="totalBox">
          <el-progress
            type="circle"
            :percentage="typeList.running_rate"
            :format="format2"
          ></el-progress>
          <div class="totalRight">
            <div class="isuse">总数：{{ typeList.total }}</div>
            <div class="istrue">运行挖矿数量：{{ typeList.running_total }}</div>
            <div class="isend">新矿机未运行数量：{{ typeList.new_total }}</div>
            <div class="isend">停机数量：{{ typeList.stop_total }}</div>
          </div>
        </div>
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>矿机列表</span>
        <el-input
          v-model.trim="searchIp"
          placeholder="请输入IP地址"
          style="width: 200px; margin-left: 20px"
          clearable
        ></el-input>
        <el-select
          v-model="searchType"
          placeholder="矿机状态"
          style="margin-left: 20px"
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="searchState"
          placeholder="网络状态"
          style="margin-left: 20px"
          clearable
        >
          <el-option
            v-for="item in options2"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          style="margin-left: 20px"
          @click="searchList()"
          >查询</el-button
        >
      </div>
      <div class="machineList" v-if="machines && machines.length > 0">
        <div class="machineItem" v-for="(item, index) in machines" :key="index">
          <div class="machineTop">
            <i class="el-icon-s-platform isuse" style="font-size: 40px"></i>
            <span>ip：{{ item.ip }}</span>
          </div>
          <div class="machineInfo">
            <p>MAC地址:{{ item.mac }}</p>
            <p>
              CPU:
              <span v-if="item.cpu"
                ><span
                  v-for="(items, indexs) in item.cpu"
                  :key="indexs"
                  style="margin-right: 10px"
                  >{{ items.name }}</span
                ></span
              >
            </p>
            <p>
              GPU:
              <span v-if="item.gpu"
                ><span
                  v-for="(items, indexs) in item.gpu"
                  :key="indexs"
                  style="margin-right: 10px"
                  >{{ items.name }}</span
                ></span
              >
            </p>
            <p>内存:{{ item.ram + "GB" }}</p>
            <p>温度:{{ item.temp + "℃" }}</p>
            <p>CPU使用率:{{ item.cpu_usage + "%" }}</p>
            <p>GPU使用率:{{ item.gpu_usage + "%" }}</p>
            <p>内存使用:{{ item.ram_usage + "GB" }}</p>
            <p>在线时间:{{ item.run_str }}</p>
            <p
              :class="
                item.state == 1
                  ? 'iswarn'
                  : item.state == 2
                  ? 'istrue'
                  : 'isend'
              "
            >
              运行状态:{{ item.state | filteState }}
            </p>
            <div class="tokenBox">
              <el-input
                size="small"
                style="width: 150px"
                placeholder="请输入token"
                v-model.trim="item.tokens"
              ></el-input
              ><el-button
                size="small"
                @click="openMining(item.id, item.tokens)"
                type="primary"
                >开启挖矿</el-button
              >
            </div>
          </div>
        </div>
      </div>
      <div v-else class="notData">暂无数据</div>
      <div style="margin-top: 20px; overflow: hidden">
        <el-pagination
          style="float: right"
          layout="total, sizes,prev, pager, next,jumper"
          :current-page.sync="pageNum"
          :page-size="pageSize"
          :page-sizes="[8, 16, 24]"
          :total="total"
          @size-change="handleOrderSizeChange"
          @current-change="handleOrderCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { machineStat, machineList, machineToken, machineAdd } from "@/api/home";

export default {
  name: "Dashboard",
  data() {
    return {
      ipName: "",
      searchIp: "",
      loading: false,
      typeList: {},
      pageNum: 1,
      pageSize: 24,
      total: 0,
      searchType: null,
      searchState: null,
      machines: [],
      timer:null,
      options: [
        {
          value: 1,
          label: "未运行",
        },
        {
          value: 2,
          label: "运行中",
        },
        {
          value: 3,
          label: "停机",
        },
      ],
      options2: [
        {
          value: 1,
          label: "在线",
        },
        {
          value: 2,
          label: "离线",
        },
      ],
    };
  },
  mounted() {
    this.getList();
    this.getType();
  },
  filters: {
    filteState(value) {
      if (value == 1) {
        return "待运行";
      } else if (value == 2) {
        return "运行中";
      } else {
        return "停机";
      }
    },
  },
  methods: {
    addMachine() {
      var data = {
        ip: this.ipName,
      };
      machineAdd(data).then((res) => {
        if (res.code == 200) {
          this.$message.success("新增成功");
          this.searchList();
        } else {
          this.$message.error(res.mag);
        }
      });
    },
    searchList() {
      this.pageNum = 1;
      // this.timer=setInterval(()=>{

      // },3000)
      this.getList();
    },
    openMining(id, tokens) {
      if (tokens) {
        var data = {
          id: id,
          token: tokens,
        };
        machineToken(data).then((res) => {
          if (res.code == 200) {
            this.searchList();
            this.$message.success("开启成功");
          } else {
            this.$message.error(res.mag);
          }
        });
      } else {
        this.$message.warning("请输入token");
      }
    },
    handleOrderSizeChange(val) {
      this.pageNum=1
      this.pageSize = val;
      this.getList();
    },
    handleOrderCurrentChange(val) {
      this.pageNum = val;
      this.getList();
    },
    getType() {
      machineStat().then((res) => {
        if (res.code == 200) {
          this.typeList = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getList() {
      // 获取列表
      var data = {
        limit: this.pageSize,
        page: this.pageNum,
      };
      if (this.searchIp) {
        data.ip = this.searchIp;
      }
      if (this.searchType) {
        data.state = this.searchType;
      }
      if (this.searchState) {
        data.network = this.searchState;
      }
      machineList(data).then((res) => {
        if (res.code == 200) {
          this.machines = res.data.rows_data;
          if (this.machines && this.machines.length > 0) {
            this.machines.forEach((item) => {
              if (item.cpu) {
                item.cpu = JSON.parse(item.cpu);
              }
              if (item.gpu) {
                item.gpu = JSON.parse(item.gpu);
              }
            });
          }
          this.pageNum = res.data.current_page;
          this.total = res.data.total;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    format(percentage) {
      return "在线率" + `${percentage}%`;
    },
    format2(percentage) {
      return "运行率" + `${percentage}%`;
    },
  },
};
</script>

<style lang="scss" scoped>
.tokenBox {
  position: absolute;
  width: 84%;
  bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notData {
  height: 200px;
  text-align: center;
  line-height: 200px;
  color: #ccc;
}
.isuse {
  color: #409eff;
}
.istrue {
  color: #67c23a;
}
.isend {
  color: #f56c6c;
}

.iswarn {
  color: #e6a23c;
}
.machineList {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .machineItem {
    position: relative;
    width: 24%;
    margin-right: 12px;
    height: 400px;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 20px;
    .machineTop {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .machineInfo {
      p {
        margin: 10px 0;
        font-size: 12px;
      }
    }
  }
}
.typeBox {
  display: flex;
  align-items: center;
  .totalBox {
    flex: 1;
    display: flex;
    align-items: center;
    .totalRight {
      margin-left: 30px;
      div {
        line-height: 30px;
      }
    }
  }
}

.topTitle {
  font-size: 30px;
}
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
