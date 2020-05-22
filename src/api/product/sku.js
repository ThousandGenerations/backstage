// 关于商品sku接口函数
import request from '@/utils/request'
export default {
  // 下架sku  GET /admin/product/cancelSale/{skuId}
  cancelSale(skuId) {
    return request(`/admin/product/cancelSale/${skuId}`)
  },

  // 删除指定id的sku
  // DELETE /admin/product/deleteSku/{skuId}
  remove(skuId) {
    return request.delete(`/admin/product/deleteSku/${skuId}`)
  },
  //查找指定spuId的sku
  // GET /admin/product/findBySpuId/{spuId}
  findSku(spuId) {
    return request(`/admin/product/findBySpuId/${spuId}`)
  },
  // 根据skuid获取详细信息
  // GET /admin/product/getSkuById/{skuId}
  getSku(skuId) {
    return request(`/admin/product/getSkuById/${skuId}`)
  },
  //获取sku分页列表
  // GET /admin/product/list/{page}/{limit}
  getList(page, limit) {
    return request(`/admin/product/list/${page}/${limit}`)
  },
  //上架aku
  // GET /admin/product/onSale/{skuId}
  onSale(skuId) {
    return request(`/admin/product/onSale/${skuId}`)
  },
  // 更新或者保存sku信息
  addOrUpdate(skuInfo) {
    return request.post(`/admin/product/${skuInfo.id?'update':'save'}SkuInfo`, skuInfo)
  },
  // 获取指定spuid的图片列表
  // GET /admin/product/spuImageList/{spuId}
  getSpuImg(spuId) {
    return request(`/admin/product/spuImageList/${spuId}`)
  },
  //根据spuid 获取销售属性列表
  // GET /admin/product/spuSaleAttrList/{spuId}
  getSpuAttrList(spuId) {
    return request(`/admin/product/spuSaleAttrList/${spuId}`)
  }
}
