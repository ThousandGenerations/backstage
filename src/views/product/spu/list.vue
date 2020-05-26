<template>
  <div>
    <el-card v-show="!isShowSku">
      <CategorySelector ref="cs" @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card v-show="!isShowSpu && !isShowSku">
      <el-button
        type="primary"
        icon="el-icon-plus"
        style="margin-bottom:20px"
        click="showSpuForm"
        @click="showAddSpu"
        :disabled="!category3Id"
      >添加SPU</el-button>
      <el-table v-loading="loading" :data="spuList" border stripe>
        <!-- 序号列 -->
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>

        <el-table-column label="SPU名称" prop="spuName"></el-table-column>
        <el-table-column label="SPU描述" prop="description"></el-table-column>
        <!-- Table -->

        <el-table-column label="操作">
          <template slot-scope="{row, $index}">
            <hint-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              title="添加SKU"
              @click="showSku(row)"
            ></hint-button>
            <hint-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改SPU"
              @click="showSpuForm(row.id)"
            ></hint-button>
            <hint-button
              type="info"
              icon="el-icon-info"
              size="mini"
              title="查看所有SKU"
              @click="showSkuList(row)"
            ></hint-button>
            <el-popconfirm title="确定删除吗?" @onConfirm="deleteSpu(row.id)">
              <hint-button
                type="danger"
                slot="reference"
                icon="el-icon-delete"
                size="mini"
                title="删除SPU"
              ></hint-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog :title="spuName+'->sku列表'" :visible.sync="isShowSkuDialog">
        <el-table :data="skuList">
          <el-table-column property="skuName" label="名称" width="150"></el-table-column>
          <el-table-column property="price" label="价格(元)" width="200"></el-table-column>
          <el-table-column property="weight" label="重量(KG)"></el-table-column>
          <el-table-column property="1" label="默认图片">
            <template slot-scope="{row,$index}">
              <img :src="row.skuDefaultImg" style="width:100px;height:100px" alt />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
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
    <SpuForm
      ref="spuForm"
      :visible.sync="isShowSpu"
      @getList="getListSuccess"
      @back="isShowSku = false"
      @saveSuccess="handleSaveSuccess"
    />
    <SkuForm ref="skuForm" v-show="isShowSku" />
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

      isShowSpu: false, // 定义显示spuForm组件的显示隐藏
      isShowSku: false, // 定义显示skuForm组件

      isShowSkuDialog: false,
      spuName: "",
      skuList: []
    };
  },
  mounted() {
    //开局获取列表数据
    // this.category3Id = 61;
    // this.getSpuList();
  },
  watch: {
    // 利用监视属性 根据 isShowSpuForm 的值更新3级列表的可操作性
    isShowSpu(value) {
      this.$refs.cs.disabled = value;
    }
  },
  methods: {
    // 显示指定SPU的SKU列表
    async showSkuList(spu) {
      this.spuName = spu.spuName;
      this.isShowSkuDialog = true;
      const result = await this.$API.sku.findSku(spu.id);
      this.skuList = result.data;
    },
    // 删除指定ID的SPU
    async deleteSpu(spuId) {
      try {
        const result = await this.$API.spu.remove(spuId);
        if (result.code === 200) {
          this.$message.success("删除成功");
          //重新请求页面
          this.getSpuList();
        }
      } catch (e) {
        console.log(e);
      }
    },
    // 获取getListSuccess
    getListSuccess() {
      if (this.spuId) {
        // 如果spuId有值说明是更新
        // 获取当前页
        this.getSpuList(this.page);
        //重置spuId
        this.spuId = "";
      } else {
        // 没有spuId没有值
        this.getSpuList();
      }
    },
    // 显示spu的添加界面
    showAddSpu() {
      //显示界面
      this.isShowSpu = true;
      //通知supFrom 添加界面初始数据显示
      //使用$refs找到组件对象进行通信(调用子组件中的函数)
      this.$refs.spuForm.initLoadAddData(this.category3Id);
      // 和更新(修改)不一样的的是 添加数据不需要传递参数过去 因为没有要使用参数更新的数据 仅仅是更新一些列表数据 其他数据都是由用户手动添加的
    },
    //显示sku界面
    showSku(spu) {
      console.log(spu);
      this.isShowSku = true; //显示
      // 传给sku数据 除了spu之外需要的数据有一二菜单的id
      spu = {
        ...spu,
        category1Id: this.category1Id,
        category2Id: this.category2Id
      };

      // 让skuForm去加载初始化数据
      this.$refs.skuForm.initLoadAddData(spu);
    },
    // 显示spuForm的修改界面
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
    },
    // spu保存成功的事件监听回调
    handleSaveSuccess() {
      //重新获取分页列表
      // 如果是添加,显示第一页 如果是更新显示当前页
      this.getSpuList(this.spuId ? this.page : 1);
      // 重置更新的标识
      this.spuId = null;
    }
  },
  components: {
    SpuForm,
    SkuForm
  }
};
</script>
