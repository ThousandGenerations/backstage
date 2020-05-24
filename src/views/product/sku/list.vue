<template>
  <el-card>
    <el-table border stripe v-loading="loading" :data="skuList">
      <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
      <el-table-column label="名称" prop="skuName"></el-table-column>
      <el-table-column label="描述" prop="skuDesc"></el-table-column>
      <el-table-column label="默认图片" align="center" width="150">
        <template slot-scope="{row}">
          <img :src="row.skuDefaultImg" alt style="width:100px;height:100px;" />
        </template>
      </el-table-column>
      <el-table-column label="重量(KG)" prop="weight" width="80" align="center"></el-table-column>
      <el-table-column label="价格(元)" prop="price" width="80" align="center"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row,$index}">
          <hint-button
            title="下架"
            v-if="row.isSale === 1"
            type="warning"
            icon="el-icon-bottom"
            size="mini"
            @click="offShelf(row.id)"
          ></hint-button>
          <hint-button
            title="上架"
            v-if="row.isSale === 0"
            type="success"
            icon="el-icon-top"
            size="mini"
            @click="putOnShelves(row.id)"
          ></hint-button>
          <hint-button title="修改" type="primary" icon="el-icon-edit" size="mini"></hint-button>
          <hint-button
            title="查看详情"
            type="primary"
            icon="el-icon-info"
            size="mini"
            @click="getSkuInfo(row.id)"
          ></hint-button>
          <hint-button
            title="删除"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeSku(row.id)"
          ></hint-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      :page-sizes="[5, 10, 20, 30, 40, 50]"
      style="padding: 30px 0; text-align: center;"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @current-change="getSkuList"
      @size-change="changeSize"
    />

    <el-drawer :visible.sync="drawer" :with-header="false" size="40%">
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="15">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="15">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="15">{{skuInfo.price}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="15">
          <el-tag
            type="success"
            :style="{marginRight:'5px'}"
            v-for="value in skuInfo.skuAttrValueList"
            :key="value.id"
          >{{value.attrId + '-'+ value.valueId}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">销售属性</el-col>
        <el-col :span="15">
          <el-tag
            type="success"
            :style="{marginRight:'5px'}"
            v-for="value in skuInfo.skuSaleAttrValueList"
            :key="value.id"
          >{{value.id + "-" + value.saleAttrValueId}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="15">
          <el-carousel
            v-if="skuInfo.skuImageList"
            indicator-position="outside"
            trigger="click"
            :autoplay="false"
            arrow="always"
            height="400"
            style="width: 400px"
          >
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" style="width:400px;height:400px" alt />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
export default {
  name: "SkuList",
  data() {
    return {
      skuList: [],
      total: 0, //默认总数量
      page: 1, // 默认加载页
      limit: 10, // 默认每页数量
      loading: false,
      skuInfo: {},
      // 抽屉
      drawer: false
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    //根据商品id获取sku详细信息
    async getSkuInfo(id) {
      // 先将抽屉显示
      this.drawer = true;
      // 发送请求获取数据
      const result = await this.$API.sku.getSku(id);
      // 保存数据
      this.skuInfo = result.data;
    },
    //上架商品
    putOnShelves(id) {
      this.$API.sku.onSale(id).then(result => {
        this.$message.success("上架成功");
        this.getSkuList(this.page);
      });
    },
    //下架商品
    offShelf(id) {
      this.$API.sku.cancelSale(id).then(result => {
        this.$message.success("下架成功");
        this.getSkuList(this.page);
      });
    },
    //当页码发生改变的时候触发的回调
    changeSize(size) {
      this.limit = size;
      this.getSkuList(1);
    },
    //获取sku的更新界面
    async getSkuList(page = 1) {
      this.page = page;
      this.loading = true;
      const result = await this.$API.sku.getList(this.page, this.limit);
      if (result.code === 200) {
        //成功
        this.skuList = result.data.records; //保存列表
        this.total = result.data.total;
        this.loading = false; //关闭加载动画
      }
    },
    // 删除sku
    async removeSku(id) {
      try {
        const result = await this.$API.sku.remove(id);
        if (result.code === 200) {
          // 成功
          this.$message.success("删除成功");
          //更新列表数据
          this.getSkuList();
        } else {
          //失败
          //提示
          this.$message.warning("删除失败");
        }
      } catch (error) {
        console.log("系统数据不能删除");
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.el-row {
  margin: 10px 5px;
  .el-col-5 {
    font-size: 16px;
    font-weight: bold;
    text-align: right;
    padding-right: 10px;
  }
}

/* 深度选择器 */
/deep/ .el-carousel__container {
  height: 400px;
}

/deep/ .el-carousel__indicator.is-active {
  button {
    background-color: green;
  }
}
</style>

