<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card v-show="!isShowSpu && !isShowSku">
      <el-button
        type="primary"
        icon="el-icon-plus"
        style="margin-bottom:20px"
        click="showSpuForm"
      >添加SPU</el-button>
      <el-table v-loading="loading" :data="spuList" border stripe>
        <!-- 序号列 -->
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>

        <el-table-column label="SPU名称" prop="spuName"></el-table-column>
        <el-table-column label="SPU描述" prop="description"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row, $index}">
            <hint-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              title="添加SKU"
              @click="showSku"
            ></hint-button>
            <hint-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改SPU"
              @click="showSpuForm(row.id)"
            ></hint-button>
            <hint-button type="info" icon="el-icon-info" size="mini" title="查看所有SKU"></hint-button>
            <hint-button type="danger" icon="el-icon-delete" size="mini" title="删除SPU"></hint-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        style="text-align: center; margin-top: 20px;"
        :current-page="page"
        :page-sizes="[3, 6, 9, 12]"
        :page-size="limit"
        layout="prev, pager, next, jumper, ->, sizes, total"
        :total="total"
        @current-change="getSpuList"
        @size-change="handleSizeChange"
      ></el-pagination>
    </el-card>
    <!-- 相当于自定义update事件
        @update:visible = 'isShowSpu = $event'
    -->
    <SpuForm ref="spuForm" :visible.sync="isShowSpu" />
    <SkuForm v-show="isShowSku" />
  </div>
</template>

<script>
import SpuForm from "../components/SpuForm";
import SkuForm from "../components/SkuForm";
export default {
  name: "SpuList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",

      loading: false,
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,

      isShowSpu: false, // 定义显示spuForm组件
      isShowSku: false // 定义显示skuForm组件
    };
  },
  mounted() {
    //开局获取列表数据
    this.category3Id = 61;
    this.getSpuList();
  },
  methods: {
    //显示sku界面
    showSku() {
      this.isShowSku = true;
    },
    // 显示spuForm界面
    showSpuForm(id) {
      // 将isShowSpu 更改为true 显示spuForm
      this.isShowSpu = true;

      // 通知spuform 根据传入id请求初始化需要显示的数据
      // 使用v-show隐藏 组件对象还是存在的 并不是用的v-if 所以并不需要等待组件对象加载的时候再调用函数 因为组件对象一直存在
      this.$refs.spuForm.initLoadUpdateData(id);
    },

    //子组件向父组件传递数据的自定义监听回调函数
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else {
        this.category3Id = categoryId;
        //获取列表数据
        this.getSpuList();
      }
    },
    //获取指定页码的列表数据回调
    async getSpuList(page = 1) {
      //默认不传参获取第一页
      this.page = page; // 保存页码数据
      const { limit, category3Id } = this;
      this.loading = true;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.loading = false;
        //成功 保存到spuList
        const { records, total } = result.data;
        this.spuList = records;
        this.total = total;
      }
    },
    //页面的每页数量发生改变回调
    handleSizeChange(pageSize) {
      this.limit = pageSize;
      this.getSpuList();
    }
  },
  components: {
    SpuForm,
    SkuForm
  }
};
</script>
