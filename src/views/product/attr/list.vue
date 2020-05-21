<template>
  <div>
    <el-card>
      <!-- 在组件标签上定义的自定义事件 用于子向父通信 将数据给父组件 -->
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <!-- 布局:属性列表 (将从子组件得到的数据展示出来) -->
    <el-card>
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :style="{marginBottom:'20px'}"
          @click="showAdd"
        >添加属性</el-button>
        <!-- 表格 -->
        <el-table border :data="attrs">
          <!-- 每一列的情况 -->
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性名称" width="150" prop="attrName"></el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag
                :style="{margin:'2px'}"
                type="info"
                v-for="value in row.attrValueList"
                :key="value.id"
              >{{value.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <HintButton
                title="修改"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdate(row)"
              ></HintButton>
              <HintButton
                title="删除"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteAttr(row.id,row.attrName)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 修改或更新页面 -->
      <div v-show="!isShowList">
        <el-form inline :model="attr">
          <el-form-item label="属性名">
            <el-input type="text" v-model="attr.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attr.attrName"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>
        <el-table border style="margin:20px 0" :data="attr.attrValueList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row,$index}">
              <el-input
                v-if="row.edit"
                v-model="row.valueName"
                size="mini"
                placeholder="请输入属性值名称"
                @blur="toShow(row)"
                @keyup.enter.native="toShow(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row)"
                style="display:inline-block;width:100%;height:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <HintButton
                title="删除"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="attr.attrValueList.splice($index,1)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="addUpdate">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrs: [], // 这是保存请求回来的所有属性列表

      isShowList: true, //定义是否显示属性列表界面 true标识列表页面 false:添加或更新页面

      attr: {
        // 要添加或者修改的平台属性对象
        attrName: "", // 属性名
        attrValueList: [], // 属性值对象
        cateforyId: "", // 3级分类菜单
        categoryLevel: 3 // 之能是3级菜单
      }
    };
  },
  mounted() {
    // this.category1Id = 2;
    // this.category2Id = 13;
    // this.category3Id = 61;
    // this.getAttrs();
  },
  methods: {
    //更新数据
    async addUpdate() {
      // 发更新的请求
      const result = await this.$API.attr.addOrUpdate(this.attr);
      if (result.code === 200) {
        this.$message.success("成功");
        // 切换到属性列表
        this.isShowList = true;
        // 重新获取新的属性列表
        this.getAttrs();
      } else {
        this.$message.error("失败");
      }
    },
    //删除数据
    async deleteAttr(id, name) {
      this.$confirm(`此操作将永久删除${name}的数据, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const result = this.$API.attr.remove(id);
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.getAttrs();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });

      // const result = await this.$API.attr.remove(id);
      // if (result.code === 200) {
      //   //删除成功
      //   this.$message.success("删除成功");
      // } else {
      //   //删除失败
      //   this.$message.success("删除失败");
      // }
    },

    //点击修改按钮 进入更新属性界面
    showUpdate(attr) {
      // 先保存一下要修改的属性对象
      // this.attr = attr // attr是个对象 这种方式直接将data中的attr赋值给了当前的attr 两个对象引用的是同一个地址 当前attr改变的时候data中的attr也会改变,这种情况的话 改变了无法取消
      // this.attr = {...attr} // 对attr进行了一个浅拷贝 ,这种不能修改的是对象中的对象 只是最外一层的对象地址不一样,对象中的引用数据类型地址还是用的同一个 这样浅拷贝是不行的
      // 使用深拷贝进行修改属性名 和属性值名称
      this.attr = cloneDeep(attr);

      // 显示更新界面(也就是attr中有数据,显示有数据的修改属性值页面)
      this.isShowList = false;
    },
    //进入编辑模式
    toEdit(value) {
      // 给之前的属性也添加edit属性
      // 如果已经有了就直接将edit改为true 如果不是就需要通过$set添加一个响应式的对象
      if (value.hasOwnProperty("edit")) {
        value.edit = true;
      } else {
        //没有找到对应的属性值 用$set添加
        this.$set(value, "edit", true);
      }
    },
    //失去焦点或者enter键 显示查看界面
    toShow(value) {
      //必须输入了属性值名称才可以进入查看模式
      if (value.valueName) {
        // 必须不在已有的属性值列表中,与当前的数组之外的数组进行比较,相同就不行
        const isRepeat = this.attr.attrValueList.some((item, index) => {
          if (item !== value) {
            return item.valueName === value.valueName;
          }
        });
        if (!isRepeat) {
          value.edit = false;
        } else {
          value.valueName = "";
          this.$message.warning("已经存在");
        }
      }
    },
    //点击添加属性按钮显示添加属性界面
    showAdd() {
      // 重置attr对象
      this.attr = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3
      };
      this.isShowList = false;
    },
    // 点击添加属性值按钮添加一个属性值到的方法
    addAttrValue() {
      // 往attr的attrValueList数组中添加一个数据,使用push方法,
      // 如果是修改属性的话就有id值 如果是添加新属性 就没有
      this.attr.attrValueList.push({
        attrIs: this.attr.id,
        valueName: "",
        edit: true // edit确定了新添加的属性是编辑模式
      });
    },
    // 三级列表发生改变是触发的回调,将id分别存到对应的数据中去
    //回调函数接收一个对象形式的参数 分别是对应的id 以及 级别
    handleCategoryChange({ categoryId, level }) {
      //这个时候应该去判断传入的是几级菜单 ,然后分别保存
      if (level === 1) {
        // 一级菜单
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category2Id = categoryId;
      } else if (level === 3) {
        this.category3Id = categoryId;
        //当子组件传递了三级菜单的时候 就应该去获取数据显示在界面上
        //单独定义函数获取列表数据 并且保存在attrs中
        this.getAttrs();
      }
    },
    // 根据子组件提供的id值 去请求数据列表,保存在attrs数组中(为什么是数组 因为请求回来的是数组形式)
    async getAttrs() {
      // 解构出传入的所有id
      const { category1Id, category2Id, category3Id } = this;
      //发送请求获取数据
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      this.attrs = result.data;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
