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
      <el-select
        :placeholder="unUsedSaleAttrList.length > 0 ? `还有${unUsedSaleAttrList.length}个没使用`: '没有了'"
        v-model="attrIdAttrName"
      >
        <el-option
          :label="attr.name"
          v-for="attr in unUsedSaleAttrList"
          :key="attr.id"
          :value="attr.id + ':' + attr.name"
        ></el-option>
      </el-select>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="addSpuSaleAttr"
        :disabled="!attrIdAttrName"
      >添加销售属性</el-button>
      <el-table border style="margin-top:20px" :data="spuInfo.spuSaleAttrList">
        <!-- 序列号 -->
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="属性名" prop="saleAttrName"></el-table-column>
        <el-table-column label="属性值名称">
          <template slot-scope="{row,$index}">
            <el-tag
              style="margin-left: 5px"
              :key="value.id"
              closable
              :disabled-transition="false"
              @close="row.spuSaleAttrValueList.splice(index,1)"
              v-for="(value, index) in row.spuSaleAttrValueList"
            >{{value.saleAttrValueName}}</el-tag>
            <!-- 失去焦点或者按下enter键的时候推出编辑模式 进入查看模式 -->
            <el-input
              style="100px"
              placeholder="请输入名称"
              ref="saveTagInput"
              v-if="row.edit"
              v-model="row.saleAttrValueName"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            ></el-input>
            <!-- 点击添加按钮进入编辑模式 -->
            <el-button class="button-new-tag" size="small" @click="showInput(row)" v-else>+添加</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row,$index}">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="spuInfo.spuSaleAttrList.splice($index,1)"
            >删除</el-button>
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
  /*
      显示初始请求的数据
          品牌列表 : trademarkList ==> 数组 遍历在页面上 绑定数据:v-model ==> spuInfo.tmId
          SPU图片列表 :
                返回的结构为:
                    {
                      id:1244
                      imgName:"2fc5f623d055f89c.jpg"
                      imgUrl:"http://182.92.128.115:8080/group1/M00/00/0D/rBFUDF7HBiOASJG2AAJCIRrZR60291.jpg"
                      name:"2fc5f623d055f89c.jpg"
                      spuId:153
                      status:"success"
                      uid:1590222646269
                      url:"http://182.92.128.115:8080/group1/M00/00/0D/rBFUDF7HBiOASJG2AAJCIRrZR60291.jpg"
                    }
                upload要求的数据结构为:
                    {
                      name:'xxx.jpg'
                      url:'https://xxx.jpg'
                    }
                这种情况需要对返回的数据进行整理修改才能使用
                  - 给数组元素对象添加name属性和url属性
                  - 请求回来数据的时候先不直接给info对象添加 而是先做处理再给info添加图片的数组
                   为了让Upload组件初始显示图片列表, 必须指定name和url属性
                    spuImageList.forEach(item => {
                      item.name = item.imgName;
                      item.url = item.imgUrl;
                    });
        销售属性列表显示
            spu属性销售列表 spuInfo.spuSaleAttrList 数组
                需要给这个数组中添加属性
  */
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
      //spu的详细信息 // 最好提前定义info中本来有的数据 这样不容易报错 (特别是数组的操作)
      spuInfo: {
        category3Id: "", //3 级菜单id
        spuName: "", // SPU名称
        description: "", // SPU描述
        tmId: "", // 品牌的id
        spuImageList: [], // 图片的数据(数组结构)
        spuSaleAttrList: [] // SPU销售属性列表
      },
      spuImageList: [], // spu图片列表
      trademarkList: [], //品牌列表
      saleAttrList: [], //销售属性列表
      attrIdAttrName: "" // 这个是用于收集销售属性的id和name  他们两个已经在前面被合并成了一个 'id:name'
    };
  },
  computed: {
    /*
      得到saleAttrList中还没有使用过的属性的数组:只留下没有spuInfo.spuSaleAttrList中的属性
    */
    //   attr的结构:
    //   {
    //     "name": "选择颜色"
    //   },
    // spuAttr:
    //     {
    //       "saleAttrName": "选择版本",
    //     }
    // 判断: attr的name与spuSaleAttrList数组中每个spuAttr的saleAttrName都不相同
    unUsedSaleAttrList() {
      return this.saleAttrList.filter(attr =>
        this.spuInfo.spuSaleAttrList.every(
          spuAttr => spuAttr.saleAttrName !== attr.name
        )
      );
    }
  },
  methods: {
    // save方法 保存(更新)SPU的详细信息
    async save() {
      // 取出请求需要的数据 还需要做必要的整理 接着发送请求
      const { spuInfo, spuImageList } = this; //取出 info 和 img 的数据
      // 处理 spuImageList 属性
      spuInfo.spuImageList = spuImageList.map(item => {
        return {
          imgName: item.name,
          imgUrl: item.response ? item.response.data : item.url
        };
      });

      //整理2
      // 删除不必要的参数数据 数组元素对象(属性对象)
      // 过滤没有属性值的对象
      spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(attr => {
        delete attr.edit;
        delete attr.saleAttrValueName;
        return attr.spuSaleAttrValueList.length > 0;
      });

      //判断 要是空数据 直接return 并且提示
      if (!spuInfo.spuName || !spuInfo.description) {
        this.$message.warning("必须写名称和描述");
        return;
      }

      //发送请求保存SPU详细信息
      const result = await this.$API.spu.addOrUpdate(spuInfo);
      //成功
      if (result.code === 200) {
        this.$message.success("保存成功");
      } else {
        // 失败
        this.$message.error("保存失败");
      }

      this.$emit("update:visible", false);

      this.$emit("getList");
    },
    // 失去焦点的时候 或者 按enter键的时候 触发进入显示模式 确定添加一个新的SPU属性销售对象:
    // 也就是spuinFo对象中的spuSaleAttrList数组中添加
    /*
        {
          saleAttrValueName:'111'  // 输入的值
          baseSaleAttrId:'1'   // 销售属性的id
        }
    */
    //点击添加一个新的SPU销售属性数据对象
    addSpuSaleAttr() {
      //取出收集的销售属性的id与name
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(":");
      //添加一个新的spu属性对象
      // 向spiinfo对象的spuSaleAttrList 中添加的是销售属性 不是销售属性值!!!!!!
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      });
      // 进s删除收集的id和name
      this.attrIdAttrName = "";
    },

    handleInputConfirm(spuSaleAttr) {
      // 取出数据(输入的值 和 id)
      const { saleAttrValueName, baseSaleAttrId } = spuSaleAttr;
      // 限制1 : 属性值名称必须有输入
      if (!saleAttrValueName) {
        // 如果没有输入任何值
        spuSaleAttr.edit = false; // 退出编辑模式
        return;
      }
      // 限制2 : 输入的属性值名称不能与已有重复
      const isRepeat = spuSaleAttr.spuSaleAttrValueList.some(
        value => value.saleAttrValueName === saleAttrValueName // 如果有一个saleAttrValueName和原本的saleAttrValueName重复返回true
      );
      if (isRepeat) {
        //如果为true
        this.$message.warning("不能重复"); //提示用户不能重复
        return;
      }
      //保存==> 向spuSaleAttr的spuSaleAttrValueList 中添加一个新的spu销售属性值对象
      spuSaleAttr.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      });

      //退出编辑模式 显示查看模式
      spuSaleAttr.edit = false;
      //清空输入的值
      spuSaleAttr.saleAttrValueName = "";
    },

    // 点击添加按钮的时候显示input输入框 (在当前行)
    // 上面传入的是row(也就是spuinFo对象中的spuSaleAttrList数组)
    showInput(spuSaleAttr) {
      // 将指定的edit的值改为true(也就是进入编辑模式),但是首先要做的就是判断 spuSaleAttr数组中有没有edit (从服务器返回的没有),这个时候调用$set方法 添加一个
      if (spuSaleAttr.hasOwnProperty("edit")) {
        // 如果这个数组中已经有了 那么就改为true
        spuSaleAttr.edit = true;
      } else {
        //如果数组中没有,要添加一个响应式的edit
        this.$set(spuSaleAttr, "edit", true);
      }

      //让输入框自动获取焦点
      //等input标签对象加载出来的时候在调用方法 这样才能生效
      this.$nextTick(() => this.$refs.saveTagInput.focus());
    },
    // 点击文件列表的图片(已上传的大图)时候的回调
    handlePictureCardPreview(file) {
      console.log(file);
      //保存要显示的大图的url
      this.dialogImagesUrl = file.url;
      // 为true可以显示大图
      this.dialogVisible = true;
    },

    // 图片上传成功时候的回调,接收三个参数
    /*
     response :响应体的数据对象 对应的是axios里面的response.data
     file : '新'上传成功的图片对象
     fileList : 所有图片对象的数组
     */
    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList);
      // 将已上传的图片对象的列表保存起来(保存到spuImageList数组中)
      this.spuImageList = fileList;
    },
    // 图片移除时候的回调函数
    // 点击删除按钮的回调(这个时候并没有发送请求 只是删除了对应对象的数组)
    // file:被删除的图片对象
    // fileList:剩下的所有图片对象的数组
    handleRemove(file, fileList) {
      // 将剩下的图片对象的列表保存起来(保存到spuImageList数组中)
      this.spuImageList = fileList;
    },
    // 返回主界面
    // 分发自定义事件,关闭修改界面
    back() {
      this.$emit("update:visible", false);
    },

    // 这也是由父组件调用的方法 :由按钮触发显示spu的界面之后同样是使用$refs获取到子组件对象初始化添加数据
    initLoadAddData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      // 获取所有品牌的列表
      this.getTrademark();
      // 获取所有销售属性的列表
      this.getSaleAttrList();
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
    // 获取SPU指定id的信息
    async getInfo() {
      const result = await this.$API.spu.get(this.spuId);
      if (result.code === 200) {
        // 发送请求
        this.spuInfo = result.data; //保存到info对象中
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
          item.name = item.imgName;
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
