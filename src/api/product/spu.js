/*
商品管理的spu的接口请求函数
*/
import request from '@/utils/request'

export default {
  // GET /admin/product/baseSaleAttrList
  // 获取销售属性列表
  getSaleList() {
    return request('/admin/product/baseSaleAttrList')
  },
  // 删除指定id的SPU
  // DELETE /admin/product/deleteSpu/{spuId}
  remove(id) {
    return request.delete(`/admin/product/deleteSpu/${id}`)
  },
  // 获取指定id的SPU信息
  //   GET /admin/product/getSpuById/{spuId}
  get(id) {
    return request.get(`/admin/product/getSpuById/${id}`)
  },
  addOrUpdate(spuInfo) {
    return request.post(`/admin/product/${spuInfo.id?'update':'save'}SpuInfo`, spuInfo)
  },
  // GET /admin/product/{page}/{limit}
  getList(page, limit, category3Id) {
    return request.get(`/admin/product/${page}/${limit}?category3Id=${category3Id}`, )
  }

}
