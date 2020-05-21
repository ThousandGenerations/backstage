/*
平台属性管理的请求
*/

import request from '@/utils/request' // 相当于ajax

export default {
  // 根据3级分类获取属性列表
  //  GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  getList(category1Id, category2Id, category3Id) {
    return request(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
  },

  // 根据id删除对应的属性
  // DELETE /admin/product/deleteAttr/{attrId}
  remove(id) {
    return request.delete(`/admin/product/deleteAttr/${id}`)
  },

  // 根据属性id获取属性值列表
  // GET /admin/product/getAttrValueList/{attrId}
  getValueList(attrId) {
    return request(`/admin/product/getAttrValueList/${attrId}`)
  },

  // 添加/更新属性
  // POST /admin/product/saveAttrInfo
  // attrInfo 如果有id就是更新 如果没有就是添加
  addOrUpdate(attrInfo) {
    return request.post(`/admin/product/saveAttrInfo`, attrInfo)
  }
}
