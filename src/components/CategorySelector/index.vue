<template>
  <!-- inline ==> 行内表单模式 -->
  <el-form :inline="true" class="demo-form-inline" :model="cFrom">
    <!-- label ==> 标签文本 -->
    <el-form-item label="一级分类">
      <!-- 定义自定义事件 当列表项发生改变的时候触发的事件回调 -->
      <el-select
        :disabled="disabled"
        placeholder="请选择一级分类项"
        v-model="cFrom.category1Id"
        @change="handleChange1"
      >
        <el-option :label="c.name" :value="c.id" v-for="c in category1List" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select
        :disabled="disabled"
        placeholder="请选择二级分类项"
        v-model="cFrom.category2Id"
        @change="handleChange2"
      >
        <el-option :label="c.name" :value="c.id" v-for="c in category2List" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select
        :disabled="disabled"
        placeholder="请选择三级分类项"
        v-model="cFrom.category3Id"
        @change="handleChange3"
      >
        <el-option :label="c.name" :value="c.id" v-for="c in category3List" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "CategorySelector",
  data() {
    return {
      disabled: false, // 下拉列表是否禁用
      cFrom: {
        category1Id: "", // 下拉列表每项数据的id值 也就是value值 同时v-model绑定了这个值动态获取
        category2Id: "",
        category3Id: ""
      },
      // 定义一二三级列表项存储的数组
      category1List: [], // 一级
      category2List: [], // 二级
      category3List: [] // 三级
    };
  },
  mounted() {
    // 开局应该先请求一级列表项 等用户选中一级列表项某项数据的时候 请求 二级列表项 以此类推
    this.getCategory1List();
  },
  //定义方法分别请求一二三级列表项
  methods: {
    // 请求一级列表项
    // 请求一级列表项之后应该请求的是二级列表 但前提是用户选中了一级菜单
    // 这个时候应该定义自定义事件 当表单选项发生改变的时候触发事件更新二级菜单列表
    // 同时,在获取了二级列表时候,二级列表发生改变的时候才能请求三级列表显示
    async getCategory1List() {
      const result = await this.$API.category.getCategorys1();
      this.category1List = result.data;
    },
    // 一级列表项发生改变的时候触发的事件回调==>请求二级菜单列表
    // 当每个列表项发生改变的时候还应该通知父组件,让父父组件去更新数据显示列表,这个时候应该每次请求的时候顺便去分发自定义事件,将id值传递过去
    // 通知还应该传递一个标识数据 标识当前传递的id值是几级菜单的id值 这样父组件才能在对应的id值接收到的时候去更新列表中的数据
    async handleChange1(category1Id) {
      //形参默认接收的是 当前选中的值

      //在点击某一个菜单数据发生改变的时候,这个时候应该清楚掉后面菜单的数据,防止上一次请求的数据还在或者是用户选择菜单完毕之后又一次选中某项菜单的情况
      //重置二三级菜单数据
      this.cFrom.category2Id = "";
      this.cFrom.category2Id = "";
      this.category2List = [];
      this.category3List = [];
      // 这个时候几级菜单已经选中了某一个数据了,在这个时候应该通知父组件
      // 分发自定义事件 携带当前以及菜单id 并且携带标识数据,便于父组件判断是几级菜单传递过来的id 做出对应的响应
      this.$emit("categoryChange", { categoryId: category1Id, level: 1 }); // 传递一个对象 {id,标识}

      //获取二级菜单列表,携带当前选中的值(也就是id值)
      const result = await this.$API.category.getCategorys2(category1Id);
      //保存到category2List数组中,然后在option(下拉菜单)中显示
      this.category2List = result.data;
    },
    // 二级列表项发生改变的时候触发的事件回调==>请求三级菜单列表
    async handleChange2(category2Id) {
      //形参默认接收的是 当前选中的值

      //点击二级菜单数据重置三级菜单数据
      this.cFrom.category3Id = "";
      this.category3List = [];

      this.$emit("categoryChange", { categoryId: category2Id, level: 2 }); // 传递一个对象 {id,标识}

      //获取二级菜单列表,携带当前选中的值(也就是id值)
      const result = await this.$API.category.getCategorys3(category2Id);
      //保存到category3List数组中,然后在option(下拉菜单)中显示
      this.category3List = result.data;
    },
    //此时三级菜单全部请求完毕 此时应该通知父组件更新列表数据,并且将三个id携带上
    //请求的时机就是三级菜单改变的时候
    handleChange3(category3Id) {
      //分发自定义事件 通知父组件更新数据,将一二三级id传递过去

      //选中三级菜单中某一项值的时候
      this.$emit("categoryChange", { categoryId: category3Id, level: 3 });
    }
  }
};
</script>

<style lang="less" scoped>
</style>
