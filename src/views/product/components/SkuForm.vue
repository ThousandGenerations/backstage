<template>
  <el-form label-width="120px">
    <el-form-item label="SPU 名称">
      <span>{{spu.spuName}}</span>
    </el-form-item>
    <el-form-item label="SPU 名称">
      <el-input placeholder="SKU 名称" v-model="skuInfo.skuName"></el-input>
    </el-form-item>
    <el-form-item label="价格">
      <el-input type="number" placeholder="SKU 价格" v-model="skuInfo.price"></el-input>
    </el-form-item>
    <el-form-item label="重量">
      <el-input placeholder="SKU 重量" v-model="skuInfo.weight"></el-input>
    </el-form-item>
    <el-form-item label="规格描述">
      <el-input type="textarea" placeholder="SKU 规格描述" rows="4" v-model="skuInfo.skuDesc"></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form inline label-width="100px">
        <el-form-item :label="attr.attrName" v-for="attr in attrList" :key="attr.id">
          <el-select v-model="attr.attrId_valueId">
            <el-option
              :label="value.valueName"
              v-for="value in attr.attrValueList"
              :key="value.id"
              :value="attr.id+'_'+value.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form inline label-width="100px">
        <el-form-item :label="attr.saleAttrName" v-for="attr in spuSaleAttrList" :key="attr.id">
          <el-select v-model="attr.saleAttrValueId">
            <el-option
              v-for="value in attr.spuSaleAttrValueList"
              :key="value.id"
              :value="value.id"
              :label="value.saleAttrValueName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table border :data="spuImageList" @selection-change="handelSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="图片" align="center">
          <template slot-scope="{row,$index}">
            <img :src="row.imgUrl" alt width="150" />
          </template>
        </el-table-column>
        <el-table-column prop="imgName" label="名称" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{row,$index}">
            <el-tag type="success" v-if="row.isDefault === '1'">默认</el-tag>
            <el-button type="primary" v-else @click="setDefault(row)">设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuFrom",
  data() {
    return {
      spu: {},
      skuInfo: {
        category3Id: "",
        spuId: "",
        tmId: "",
        // 手机表单数据
        skuName: "", //名称
        price: "", // 价格
        weight: "", // 重量
        skuDesc: "", //  描述
        skuDefaultImg: "", //
        //请求前的数据保存
        skuImageList: [], // 图片列表
        skuSaleAttrValueList: [], // spu销售属性列表
        skuAttrValueList: [] //已经选中的图片列表,由selection生成
      },
      attrList: [], // 平台销售属性
      spuImageList: [], // 图片列表
      spuSaleAttrList: [], // spu销售属性列表
      selectedImageList: [] //已经选中的图片列表,由selection生成
    };
  },
  methods: {
    // 设置为默认
    setDefault(imgList) {
      // 将原来的图片改为默认图片
      this.spuImageList.forEach(item => {
        item.isDefault = "0";
      });
      // 将点击的图片改为1
      imgList.isDefault = "1";

      // 将这张图片保存到skuInfo
      this.skuInfo.skuDefaultImg = imgList.imgUrl;
    },
    // 重置一下数据
    resetData() {
      (this.skuInfo = {
        category3Id: "",
        spuId: "",
        tmId: "",
        skuName: "",
        skuDesc: "",
        price: "",
        weight: "",
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: []
      }),
        (this.spu = {}),
        (this.attrList = []), // 平台销售属性
        (this.spuImageList = []), // 图片列表
        (this.spuSaleAttrList = []), // spu销售属性列表
        (this.selectedImageList = []); //已经选中的图片列表,由selection生成
    },
    // 保存数据
    async save() {
      // 需要提交的数据有 skuInfo(sku的信息) , attrList(平台的销售属性) , spuSaleAttrList(spu销售属性列表) , selectedImageList(已选中的图片列表)
      const { skuInfo, attrList, spuSaleAttrList, selectedImageList } = this;
      /*
          整理attrList
            [
              attrId_valueId:"383_1421"
            ]
          整理产生的数据是
            [
              attrId
              valueId
            ]
      */

      skuInfo.skuAttrValueList = attrList.reduce((pre, attr) => {
        const attrId_valueId = attr.attrId_valueId;
        if (attrId_valueId) {
          //如果有值
          const [attrId, valueId] = attrId_valueId.split("_"); // 将字符串以下划线分割为数组
          pre.push({
            // 往pre中添加属性
            attrId,
            valueId
          });
        }
        return pre; //必须返回
      }, []);

      // 将本来在spuSaleAttrList数组里面的 saleAttrValueId 放进 嵌套的 spuSaleAttrValueList 里面

      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, attr) => {
        const saleAttrValueId = attr.saleAttrValueId; //将值拿出来 赋给一个新的变量
        if (saleAttrValueId) {
          //确定有值的情况下
          pre.push({
            saleAttrValueId
          });
        }
        return pre; // 必须返回 不然下一个pre就是undefined
      }, []);

      //整理图片
      // 需要的数据结构是
      /*
        "skuImageList": [
          {
            "id": 0,
            "imgName": "string",
            "imgUrl": "string",
            "isDefault": "string",
            "skuId": 0,
            "spuImgId": 0
          }
        ],
      */

      /*
          现在的数据结构是
          {
            id:1839
            imgName:"111.jpg"
            imgUrl:"http://182.92.128.115:8080/xxx.jpg"
            isDefault:"0"
            spuId:338
          }

     */

      skuInfo.skuImageList = selectedImageList.map(item => ({
        imgName: item.imgName,
        imgUrl: item.imgUrl,
        spuImgId: item.id,
        isDefault: item.isDefault
      }));

      // 发送添加sku请求
      const result = await this.$API.sku.addOrUpdate(skuInfo);
      if (result.code === 200) {
        //成功
        this.$message.success("成功");
        this.resetData(); //清除数据
      } else {
        //失败
        this.$message.warning("失败");
      }
    },
    // 返回list(点击返回按钮的时候触发的回调)
    back() {
      // 首先清空数据
      this.resetData();
      // 返回到主页面 (分发 父组件定义的自定义事件)
      this.$emit("back");
    },
    // 父组件调用的回调 用于传递数据 加载初始化页面
    initLoadAddData(spu) {
      // 保存父组件传递的spu
      this.spu = spu;
      // console.log(spu);
      // 将相关数据保存到skuInfo中
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      //异步请求需要初始显示的数据
      this.getSpuInitData();
    },
    // 当选择项发生改变的时候 触发的操作的回调
    // 参数 selection(所有选中项组成一个数组)
    handelSelectionChange(selection) {
      // console.log(selection);skuImageList
      this.selectedImageList = selection;
    },
    async getSpuInitData() {
      // 获取平台属性列表(需要的数据是 1 2 3 级菜单id)
      // 先把需要的数据解构出来 方便
      const { category1Id, category2Id, category3Id, id } = this.spu;
      const result1 = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      // 获取销售属性列表(需要的数据是spuid)
      const result2 = await this.$API.sku.getSpuAttrList(id);
      // 获取图片列表
      const result3 = await this.$API.sku.getSpuImg(id);

      if (
        result1.code === 200 &&
        result2.code === 200 &&
        result3.code === 200
      ) {
        //才能成功
        this.attrList = result1.data; // j将平台销售属性
        this.spuSaleAttrList = result2.data; // 将图片列表保存

        // 给图片列表每一个图片添加一个默认的属性,到时候设置为默认用得上
        const spuImageList = result3.data;
        spuImageList.forEach(item => {
          item.isDefault = "0";
        });
        this.spuImageList = spuImageList;
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>
