<template>
  <el-form label-width="100px" style="margin-top:20px" v-show="visible">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>
    <el-form-item label="SPU品牌">
      <el-select placeholder="请选择" v-model="spuInfo.tmId">
        <el-option :label="tm.tmName" :value="tm.id" v-for="tm in trademarkList" :key="tm.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input type="textarea" placeholder="SPU描述" rows="4" v-model="spuInfo.description"></el-input>
    </el-form-item>
    <el-form-item label="SPU图片">
      <el-upload
        :file-list="spuImageList"
        multiple
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
      >
        <i class="el-icon-plus"></i>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过2M</div>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImagesUrl" alt />
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select placeholder="还有3可选" v-model="modelValue">
        <el-option :label="attr.name" v-for="attr in saleAttrList" :key="attr.id" :value="attr.id"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>
      <el-table border style="margin-top:20px" :data="spuInfo.spuSaleAttrList">
        <!-- 序列号 -->
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="属性名" prop="saleAttrName"></el-table-column>
        <el-table-column label="属性值名称">
          <template slot-scope="{row}">
            <el-tag
              style="margin-left: 5px"
              :key="value.id"
              v-for="(value, index) in row.spuSaleAttrValueList"
            >{{value.saleAttrValueName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row,$index}">
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuFrom",
  props: {
    //父组件使用 :visible.sync 传递的visible属性给组件 用于控制的子组件的显示隐藏
    visible: Boolean
  },
  data() {
    return {
      modelValue: "",
      dialogImagesUrl: "",
      dialogVisible: false,

      spuId: "", //更新的spuInfo的id
      spuInfo: {
        // category3Id: "",
        // spuName: "",
        // description: "",
        // tmId: "",
        // spuImageList: [],
        // spuSaleAttrList: []
      }, // SPU的详细信息
      spuImageList: [], // spu图片列表
      trademarkList: [], //品牌列表
      saleAttrList: [] //销售属性列表
    };
  },
  methods: {
    // 点击文件列表的图片(已上传)时候的回调
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImagesUrl = file.imgUrl;
      this.dialogVisible = true;
    },
    // 上传成功时候的回调
    handleSuccess() {},
    // 图片移除时候的回调函数
    handleRemove() {},
    // 返回主界面
    // 分发自定义事件,关闭修改界面
    back() {
      this.$emit("update:visible", false);
    },
    // 这是由父组件调用的方法 在显示spu组件的时候调用的函数  根据id请求加载相关数据

    // 在父组件的操作方法是: 使用ref唯一标识组件对象 之后调用子组件对象中的方法 接收id值

    // 为什么要这么做? 因为更新数据是在子组件更新的 但是调用更新应该再父组件调用,因为相关数据都在父组件中
    initLoadUpdateData(spuId) {
      // 先保存skuId
      this.spuId = spuId;
      // 1 根据spu的id值获取spu详情信息(名称/品牌/描述)
      this.getInfo();
      // 2 根据spu的id获取图片信息(单独获取 单独接口)
      this.getImageInfo();
      // 3 获取所有品牌的列表
      this.getTrademark();
      // 4 获取所有销售属性(id/name)列表
      this.getSaleAttrList();
    },
    // 获取指定id的SPU信息
    async getInfo() {
      const result = await this.$API.spu.get(this.spuId);
      if (result.code === 200) {
        this.spuInfo = result.data;
      } else {
        new Error("错误");
      }
    },
    async getImageInfo(skuid) {
      const result = await this.$API.sku.getSpuImg(this.spuId);
      if (result.code === 200) {
        const spuImageList = result.data;
        // 为了让Upload组件初始显示图片列表, 必须指定name和url属性
        spuImageList.forEach(item => {
          item.url = item.imgUrl;
        });

        this.spuImageList = spuImageList;
      } else {
        new Error("错误");
      }
    },
    async getTrademark() {
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.saleAttrList = result.data;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
