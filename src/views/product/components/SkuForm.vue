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
        // 父组件传递的数据
        category3Id: "",
        spuId: "",
        tmId: "",
        // 收集的表单数据
        skuName: "", //名称
        price: "", // 价格
        weight: "", // 重量
        skuDesc: "", //  描述
        skuDefaultImg: "", //
        //请求前的数据整理保存
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
    // 重置一下数据(单独定义清除数据的方法,方便)
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
    // 保存数据发送请求的回调函数
    async save() {
      // 需要提交的数据有 skuInfo(sku的信息) , attrList(平台的销售属性) , spuSaleAttrList(spu销售属性列表) , selectedImageList(已选中的图片列表)
      // 现将所有用到的是数据进行解构处理,之后一一进行整理(因为我们现在的数据不一定是服务器上传数据所对应的格式 需要进行处理再发送请求 这样服务器才能进行正确的响应)
      const { skuInfo, attrList, spuSaleAttrList, selectedImageList } = this;
      /*
          整理attrList(我们现在有的数据)
            [
              attrId_valueId:"383_1421"
            ]
          整理产生的数据是(服务器需要的数据是)
            [
              attrId
              valueId
            ]
      */
      // 将attrList中的数据进行拆分处理 变成服务器想要接收的数据
      skuInfo.skuAttrValueList = attrList.reduce((pre, attr) => {
        const attrId_valueId = attr.attrId_valueId;
        if (attrId_valueId) {
          //如果有值
          const [attrId, valueId] = attrId_valueId.split("_"); // 将字符串以下划线分割为数组
          pre.push({
            // 往pre中添加对象
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
      // 使用map方法向数组中添加所需要的对象 遍历的数组一定要是已经选中的数组(回调函数生成的数组)
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
      // 返回到主页面 (分发 父组件定义的自定义事件),调用父组件back函数进行返回 不需要传递任何参数
      this.$emit("back");
    },
    // 当选择项发生改变的时候 触发的操作的回调(table表格中有多选按钮的时候才有的回调,作用就是可以区别出来哪个列表项是被选中的 )
    // 参数 selection(所有选中项组成一个数组)
    handelSelectionChange(selection) {
      // console.log(selection);skuImageList
      this.selectedImageList = selection; //将所有选中的列表项数据组成一个数组 当我们使用的图片数据和后台进行交互的时候 应该用已经选中的列表而不是所有列表
    },
    // 由父组件调用的回调 用于传递数据 加载初始化页面
    initLoadAddData(spu) {
      // 保存父组件传递的spuList的数据保存(发送请求时需要用到这些数据)
      this.spu = spu; // 将父组件传递的数据
      // console.log(spu);
      // 将相关数据保存到skuInfo中(发送初始化显示数据请求的时候需要用到的数据)
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      //异步请求需要初始显示的数据
      this.getSpuInitData();
    },
    // 异步发送请求获取初始化数据(方法一)
    /* async getSpuInitData() {
      // 获取平台属性列表(需要的数据是 1 2 3 级菜单id)
      // 先把需要的数据解构出来 方便
      const { category1Id, category2Id, category3Id, id } = this.spu;

      // 异步请求列表数据(需要的参数是一到三级菜单的列表)
      const result1 = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      // 获取销售属性列表(需要的数据是spuid)
      const result2 = await this.$API.sku.getSpuAttrList(id);
      // 获取图片列表
      const result3 = await this.$API.sku.getSpuImg(id);

      // 判断他们3个的返回的响应码都是200(成功) 才算成功
      if (
        result1.code === 200 &&
        result2.code === 200 &&
        result3.code === 200
      ) {
        //才能成功
        this.attrList = result1.data; // j将平台销售属性
        this.spuSaleAttrList = result2.data; // 将图片列表保存

        // 给图片列表每一个图片添加一个默认的属性,到时候设置为默认用得上,之后再进行保存
        const spuImageList = result3.data; //现将值存起来
        spuImageList.forEach(item => {
          //遍历数据 给每个数组中的对象添加一个isDefault 属性,初始值都为0(设置为默人的时候为1)
          item.isDefault = "0";
        });
        this.spuImageList = spuImageList; // 将添加好默认属性的对象赋值给data中的属性 此时 里面的数据都是响应式数据
      }
    } */

    // 异步发送请求获取初始化数据(方法二)
    async getSpuInitData() {
      // 同样是准备发送的数据
      const { category1Id, category2Id, category3Id, id } = this.spu;
      // 不用的点在于 我们可以利用 promise的all方法 实现左右成功 才返回一个成功的promise 这个特点来进行下一步操作
      // 这个时候我们不可以使用async await 而是应该将异步请求(返回一个成功或者失败的promsise) 保存之后用promise.all 方法来进行判断
      // 获取列表数据
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      ); // 正常获取数据返回成功或者失败的promise ,下面也是一样的一种
      // 获取销售属性列表(需要的参数的id)
      const promise2 = this.$API.sku.getSpuAttrList(id);
      // 获取图片列表(同样是id)
      const promise3 = this.$API.sku.getSpuImg(id);

      // 首先应该知道的是异步axios请求返回值是一个成功或者失败的promise 也就是说我们发送的这三个请求全是promise 的形式
      // 接下来利用的是promise.all方法 来判断三个promise 必须全是成功的promise 才能进行下一步
      // 这是一个异步操作(方法必须是一个数组)
      const results = await Promise.all([promise1, promise2, promise3]);
      // 此时可以选择给data中添加响应式属性
      this.attrList = results[0].data; // 将初始列表
      this.spuSaleAttrList = results[1].data; // 将属性列表保存
      // 这个时候要先对图片进行处理,像图片数组的每一个对象中添加一个默认属性isDefault 然后再将数据保存
      // 注意 不能先将数据保存在进行添加数据 除非使用$set 不然这个数据不是响应式的
      // 直接使用map方法向数组中的每个对象中添加一个属性和属性值默认为0(都不选中)
      const spuImageList = results[2].data.map(item => ({
        ...item,
        isDefault: "0"
      }));
      this.spuImageList = spuImageList;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
