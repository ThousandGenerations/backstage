<template>
  <el-form v-show="visible" label-width="80px" style="margin-top:20px">
    <el-form-item label="SPU名称">
      <el-input placeholder="请输入SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择" v-model="spuInfo.tmId">
        <el-option :label="tm.tmName" :value="tm.id" v-for="(tm) in trademarkList" :key="tm.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input type="textarea" rows="4" placeholder="请输入SPU名称" v-model="spuInfo.description"></el-input>
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
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt />
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select
        :placeholder="noUsedSaleAttrList.length > 0 ? `还有${noUsedSaleAttrList.length}个可选` : '没有了'"
        v-model="attrIdAttrName"
      >
        <el-option
          :label="attr.name"
          :value="attr.id + '-' + attr.name"
          v-for="attr in noUsedSaleAttrList"
          :key="attr.id"
        ></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>
      <el-table style="width: 100%;margin-top:20px" border :data="spuInfo.spuSaleAttrList">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column label="属性名" prop="saleAttrName" align="center"></el-table-column>
        <el-table-column label="属性值" align="center">
          <template slot-scope="{row,$index}">
            <el-tag
              v-for="attr in row.spuSaleAttrValueList"
              :key="attr.id"
              closable
              @close="row.spuSaleAttrValueList.splice(index,1)"
            >{{attr.saleAttrValueName}}</el-tag>
            <el-input
              class="input-new-tag"
              ref="saveTagInput"
              v-if="row.edit"
              size="small"
              v-model="row.saleAttrValueName"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            ></el-input>
            <el-button v-else size="small" @click="showInput(row)">添加</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{row,$index}">
            <hint-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除SPU"
              @click="spuInfo.spuSaleAttrList.splice($index,1)"
            ></hint-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back()">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false, // 点击显示大图
      dialogImageUrl: "",
      category3Id: "", // 三级菜单id
      spuId: "", // spuid
      trademarkList: [], // 品牌列表
      saleAttrList: [], // 销售属性列表
      spuInfo: {
        category3Id: "", //3 级菜单id
        spuName: "", // SPU名称
        description: "", // SPU描述
        tmId: "", // 品牌的id
        spuImageList: [], // 图片的数据(数组结构)
        spuSaleAttrList: [] // SPU销售属性列表
      }, // spu详细信息
      spuImageList: [], // 图片列表
      attrIdAttrName: "", //用于收集销售属性id和name
      inputVisible: false
    };
  },
  name: "SpuForm",
  props: {
    visible: Boolean
  },
  // 定义计算属性,计算出还有几个销售属性可以选择
  computed: {
    noUsedSaleAttrList() {
      return this.saleAttrList.filter(attr =>
        this.spuInfo.spuSaleAttrList.every(
          spuAttr => spuAttr.saleAttrName !== attr.name
        )
      );
    }
  },
  methods: {
    // 重置数据
    resetData() {
      (this.dialogVisible = false), // 点击显示大图
        (this.dialogImageUrl = ""),
        (this.category3Id = ""), // 三级菜单id
        (this.spuId = ""), // spuid
        (this.trademarkList = []), // 品牌列表
        (this.saleAttrList = []),
        (this.spuInfo = {
          category3Id: "", //3 级菜单id
          spuName: "", // SPU名称
          description: "", // SPU描述
          tmId: "", // 品牌的id
          spuImageList: [], // 图片的数据(数组结构)
          spuSaleAttrList: [] // SPU销售属性列表
        }), // spu详细信息
        (this.spuImageList = []), // 图片列表
        (this.attrIdAttrName = ""), //用于收集销售属性id和name
        (this.inputVisible = false);
    },
    async save() {
      //解构需要数据
      const { spuInfo, spuImageList } = this;
      //处理新上传的图片
      spuInfo.spuImageList = spuImageList.map(item => ({
        imgName: item.imgName,
        imgUrl: item.response ? item.response.data : item.url
      }));

      //发送请求
      const result = await this.$API.spu.addOrUpdate(this.spuInfo);
      this.back();
      this.$emit("getList");
      this.resetData();
    },
    //退出编辑模式进入显示模式
    handleInputConfirm(row) {
      // 取出name和id
      const { saleAttrValueName, baseSaleAttrId } = row;
      // 作出限制判断
      if (!saleAttrValueName) {
        row.edit = false;
        return;
      }
      // 不能和之前重复
      const isrepeat = row.spuSaleAttrValueList.some(
        item => item.saleAttrValueName === saleAttrValueName
      );

      if (isrepeat) {
        // 说明重复
        this.$message.warning("不能和之前重复");
        return;
      }
      //添加
      row.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      });
      row.edit = false;
      //清空数据
      row.saleAttrValueName = "";
    },
    //显示input输入框进入输入模式
    showInput(row) {
      this.inputVisible = true;
      // 添加edit属性 先判断有没有
      if (row.hasOwnProperty("edit")) {
        //直接进入编辑模式
        row.edit = true;
      } else {
        //添加一个响应式的edit
        this.$set(row, "edit", true);
      }
      // 自动获取焦点
      this.$nextTick(() => {
        return this.$refs.saveTagInput.focus();
      });
    },
    // 点击添加销售属性
    addSaleAttr() {
      // 取出收集的id和name
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split("-");
      // 向spuinfo中spuSaleAttrList 添加销售属性
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      });
      // 清除属性收集到的数据
      this.attrIdAttrName = "";
    },
    // 返回按钮
    back() {
      this.$emit("update:visible", false);
    },
    // 文件上传成功的回调函数
    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList);
      //file是上传的文件,将上传的文件保存到spuImageList中
      this.spuImageList = fileList;
    },
    // 移除图片时候的回调函数
    handleRemove(file, fileList) {
      //file是已经移除的图片
      //fileList是还在的图片列表
      this.spuImageList = fileList;
    },
    // 点击查看大图的回调函数
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 初始化显示数据(接收categoty3Id) ==> 这个是由父组件使用ref找到并且调用的方法,用于初始化显示数据
    initLoadAddData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      // 获取所有品牌的列表
      this.getTrademarkList();
      // 获取销售属性列表
      this.getSaleAttrList();
    },
    // 初始化显示更新数据,接收一个spuid
    initLoadUpdateData(spuId) {
      // 保存spuid
      this.spuId = spuId;
      // 首先应该根据spuid获取商品的详细信息(名称,品牌,描述)
      this.getSpuInfo();
      // 获取图片信息
      this.getImgList();
      // 获取品牌列表
      this.getTrademarkList();
      // 获取销售属性
      this.getSaleAttrList();
    },
    // 获取所有品牌列表
    async getTrademarkList() {
      // 发送请求获取品牌列表
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },
    // 获取销售属性列表
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.saleAttrList = result.data;
    },
    // 根据id获取spu详细信息
    async getSpuInfo() {
      const result = await this.$API.spu.get(this.spuId);
      this.spuInfo = result.data;
    },
    // 获取图片信息
    async getImgList() {
      const result = await this.$API.sku.getSpuImg(this.spuId);
      const spuImageList = result.data;
      this.spuImageList = spuImageList.map(item => ({
        name: item.imgName,
        url: item.imgUrl
      }));
    }
  }
};
</script>

<style lang="less" scoped>
</style>
