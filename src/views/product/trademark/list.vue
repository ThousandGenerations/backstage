<template>
  <div>
    <!-- 添加按钮 primary 按钮颜色  icon 定义按钮大小-->
    <el-button type="primary" icon="el-icon-puls" :style="{marginBottom:'20px'}" @click="showAdd">添加</el-button>
    <el-table v-loading="loading" :data="trademarks" border stripe>
      <!-- 序号列 -->
      <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>

      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column label="姓名">
        <template slot-scope="{row}">
          <img :src="row.logoUrl" alt style="width: 100px; height: 60px;" />
        </template>
      </el-table-column>
      <!-- 如果列表列的内容是指定指定的结构: 使用作用域插槽 -->
      <el-table-column prop="address" label="操作">
        <template slot-scope="{row, $index}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="showUpdate(row)">修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
          >删除</el-button>
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
      @current-change="getTrademarks"
      @size-change="handleSizeChange"
    ></el-pagination>
    <el-dialog :title="form.id ? '更新' : '添加'" :visible.sync="isShowDialog">
      <!-- 内部会执行: $emit('update:visible', false) 自动关闭 -->
      <el-form :model="form" style="width: 80%">
        <el-form-item label="品牌名称" :label-width="formLabelWidth">
          <el-input v-model="form.tmName" autocomplete="off" placeholder="请输入品牌名称"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth">
          <!--
            action: 指定上传图片的接口地址   组件内部向发此地址发送上传文件的ajax请求
              http://182.92.128.115/admin/product/fileUpload: 不可以, 跨域了
              /dev-api/admin/product/fileUpload: 可以, 通过代理服务转发, 就没跨域了
            on-success: 指定上传成功时调用的回调函数
            before-upload: 指定在准备发送上传图片请求前的回调函数, 如果返回值为false, 不会发出请求
          -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      loading: false, // 是否显示loading加载界面
      trademarks: [], // 当前页的列表数据
      total: 0, // 总数量
      page: 1, // 当前页码
      limit: 3, // 每页显示列表数量

      isShowDialog: false, // 是否显示添加的dialog
      form: {
        tmName: "", // 表单中的名称
        logoUrl: "" // 图片的url
      },
      formLabelWidth: "100px" // 表格宽度
    };
  },
  mounted() {
    // 在组件创建之后 获取列表数据
    this.getTrademarks(); // 不需要传递数据 因为已经制定该参数默认值
  },
  methods: {
    showUpdate(trademark) {
      // 更新已经存在的数据
      // 将当前的品牌对象保存到 form 中 用于在dialog中显示
      this.form = trademark;
      // 显示对话框
      this.isShowDialog = true;
    },
    handleLogoSuccess(res, file) {
      // 上传图片请求成功时候的回调函数
      // 当图片上传成功的时候应该得到图片的url并保存
      const logoUrl = res.data; // 得到url
      this.form.logoUrl = logoUrl; // 保存
    },
    beforeLogoUpload(file) {
      // 请求前的回调函数
      // 在准备发sing上传图片请求的前 调用的回调函数农户 如果返回值是false,不再发送请求
      // 作用就是为了限制图片的大小和格式
      const isJPGorPNG = ["image/jpeg", "image/png"].indexOf(file.type) >= 0; // 就说明符合格式
      const isLt500KB = file.size / 1024 < 500; // 就说明符合大小规定

      // 判断是不是两个条件都符合 , 都符合才返回true 不符合就返回false
      // 都进行判断 要是有一个不符合就进行提示
      if (!isJPGorPNG) {
        this.$message.error("上传的图片必须是png或者jpg格式哦");
      }
      if (!isLt500KB) {
        this.$message.error("上传的图片大小必须是500k以内哦");
      }
      // 最后返回的应该是一个布尔值 ,为真就继续请求 为假就中断请求
      return isJPGorPNG && isLt500KB;
    },
    async addOrUpdateTrademark() {
      // 更新按钮或者是添加按钮 就是确定键
      // 取出请求需要的数据 之后发送请求
      const trademark = this.form; // 从form中获取用户上传的信息
      // 如果这个trademark中存在id 那么就是一个更新请求 否则就是一个添加请求
      let result;
      if (trademark.id) {
        result = await this.$API.trademark.update(trademark);
      } else {
        result = await this.$API.trademark.add(trademark);
      }
      // 在请求成功之后应该关闭对话框,之后应该重新发送请求获取更新最新的数据列表
      if (result.code === 200) {
        this.$message.success(`${trademark.id ? "更新" : "添加"}成功`);
        // 关闭弹框显示
        this.isShowDialog = false;
        // 如果是更新请求成功,就应该显示当前页
        // 如果是添加请求成功就应该是第一页
        // 就是调用之前定义的获取指定页码的函数,参数传递的是当前页或者是第一页
        this.getTrademarks(trademark.id ? this.page : 1);
        // 还应该做的事就是清楚弹框中的数据(其实不清楚也可以 因为再次点击添加按钮的时候也会清除)
      } else {
        // 如果请求失败了 就应该提示用户 添加或者更新失败
        this.$message.error(`${trademark.id ? "更新" : "添加"}成功`);
      }
    },

    handleSizeChange(pageSize) {
      // 改变每页数量时候调用的回调函数
      // 更新limit数据
      this.limit = pageSize;
      // 重新发送请求获取第一页列表显示
      this.getTrademarks();
    },
    // 异步获取指定页码的数据列表显示
    async getTrademarks(page = 1) {
      // 参数默认值,不传默认第一页
      this.page = page; // 最新页码赋值data中page
      // 在发请求前显示加载动画 loading
      this.loading = true;
      // 发送请求获取数据(携带当前页码和每页数量)
      const result = await this.$API.trademark.getList(page, this.limit);
      // 请求结束后关闭loading(不论失败或者成功)
      this.loading = false;

      // 判断成功还是失败,做出响应操作
      if (result.code === 200) {
        const { records, total } = result.data;
        this.trademarks = records; // records赋值给 data中的trademarks数组,显示数据
        this.total = total; // 赋值给total,更新总数量
      } else {
        // 失败之后提示
        this.$message.error("获取列表数据失败,请重试");
      }
    },
    showAdd() {
      // 首先应该重置form数据(因为原本可能添加过数据,再点击添加按钮的时候,不管有没有数据都先清除一次)
      this.form = {
        tmName: "",
        logoUrl: "" // 将data中的数据置成空值就行
        // 显示添加图片界面,将isShowDialog 改为true,内部自动分发事件
      };
      this.isShowDialog = true;
    },
    // 删除指定的品牌
    deleteTrademark(trademark) {
      this.$confirm(`确定删除吗:${trademark.tmName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          // 点击确定,发送删除品牌的请求
          const result = await this.$API.trademark.remove(trademark.id);
          // 如果成功了
          if (result.code === 200) {
            this.$message.success("删除品牌成功!");
            const page =
              this.trademarks.length === 1 ? this.pages - 1 : this.page;
            this.getTrademarks(page);
          } else {
            // 如果失败了
            this.$message.error("删除品牌失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style lang="less" scoped>
</style>
