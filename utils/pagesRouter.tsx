let prefix = ''

/**
 * 如果当前处于 production
 * 更新 prefix
 */
if (process.env.NODE_ENV === 'production') {
  prefix = '/pms-static'
}

export default {
  Login: `${prefix}/login`,
  ChangePassword: `${prefix}/changepassword`,

  /* goods list */
  GoodsList: `${prefix}/goods/list`,
  GoodsListCreate: `${prefix}/goods/list/create`,
  GoodsListView: `${prefix}/goods/list/view`,
  GoodsListEdit: `${prefix}/goods/list/edit`,
  PresaleGoods: `${prefix}/goods/presale`,
  CategoryManagement: `${prefix}/goods/categorymanagement`,
  TagsManagement: `${prefix}/goods/tagsmanagement`,
  SkusManagement: `${prefix}/goods/skusmanagement`,

  /* mall goods */
  MallGoodsOnShelves: `${prefix}/mallgoods/onshelves`,
  OnShelvesGoodsDetailsView: `${prefix}/mallgoods/onshelves/view`,
  OnShelvesGoodsDetailsEdit: `${prefix}/mallgoods/onshelves/edit`,
  MallGoodsWaitingForShelves: `${prefix}/mallgoods/waitingfor`,
  WaitingForGoodsDetailsEdit: `${prefix}/mallgoods/waitingfor/putaway`,

  /* sales orderlist */
  AppOrderList: `${prefix}/sales/apporder`,
  AppOrderDetail: `${prefix}/sales/apporder/detail`,
  ManualOrderList: `${prefix}/sales/manualorder`,
  ManualOrderDetail: `${prefix}/sales/manualorder/detail`,
  CreateManualOrder: `${prefix}/sales/manualorder/create`,
  RefundOrderList: `${prefix}/sales/refundorder`,
  RefundOrderDetail: `${prefix}/sales/refundorder/detail`,

  /* purchase orderlist */
  PurchaseOrderList: `${prefix}/purchase/orderlist`,
  PurchaseOrderListCreate: `${prefix}/purchase/orderlist/create`,
  PurchaseOrderListView: `${prefix}/purchase/orderlist/view`,
  PurchaseOrderListEdit: `${prefix}/purchase/orderlist/edit`,
  PurchaseOrderListInStorage: `${prefix}/purchase/orderlist/instorage`,
  PurchaseSupplier: `${prefix}/purchase/suppliers`,

  /* warehouse outboundlist */
  WarehouseOutboundlist: `${prefix}/warehouse/outboundlist`,
  WarehouseOutboundlistCreate: `${prefix}/warehouse/outboundlist/create`,
  WarehouseOutboundlistView: `${prefix}/warehouse/outboundlist/view`,

  WarehouseCountlist: `${prefix}/warehouse/countlist`,
  WarehouseCountlistCreate: `${prefix}/warehouse/countlist/create`,
  WarehouseCountlistView: `${prefix}/warehouse/countlist/view`,
  WarehouseCountlistInventory: `${prefix}/warehouse/countlist/inventory`,

  WarehouseInventorylist: `${prefix}/warehouse/inventorylist`,
}
