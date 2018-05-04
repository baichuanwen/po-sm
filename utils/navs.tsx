import { langChange, pagesRouter } from './index'

interface Navs {
  readonly name: string
  readonly id: number
  readonly sn: string
  readonly pageUrl?: string
  readonly subNav: object[]
}

const categoryBoolean: boolean = langChange.getLang() === 'zh'

const navs: Navs[] = [
  {
    'name': categoryBoolean ? '商品管理' : 'Goods Manage',
    'id': 3,
    'sn': 'goods',
    'subNav': [
      {
        'name': categoryBoolean ? '商品列表' : 'Goods List',
        'id': 31,
        'sn': 'list',
        'pageUrl': pagesRouter.GoodsList,
        'subNav': [
          {
            'name': categoryBoolean ? '商品列表' : 'Goods List',
            'id': 311,
            'sn': 'list',
            'pageUrl': pagesRouter.GoodsList,
          },
          {
            'name': categoryBoolean ? '创建商品' : 'Create Goods',
            'id': 312,
            'sn': 'create',
            'pageUrl': pagesRouter.GoodsListCreate,
          },
          {
            'name': categoryBoolean ? '查看商品' : 'View Goods',
            'id': 313,
            'sn': 'view',
            'pageUrl': pagesRouter.GoodsListView,
          },
          {
            'name': categoryBoolean ? '编辑商品' : 'Edit Goods',
            'id': 314,
            'sn': 'edit',
            'pageUrl': pagesRouter.GoodsListEdit,
          },
        ],
      },
      {
        'name': categoryBoolean ? '预售商品' : 'Presale Goods',
        'id': 34,
        'sn': 'presale',
        'pageUrl': pagesRouter.PresaleGoods,
        'subNav': [
          {
            'name': categoryBoolean ? '预售商品' : 'Presale Goods',
            'id': 341,
            'sn': 'presale',
            'pageUrl': pagesRouter.PresaleGoods,
          },
        ],
      },
      {
        'name': categoryBoolean ? '类别管理' : 'Category Management',
        'id': 315,
        'sn': 'categorymanagement',
        'pageUrl': pagesRouter.CategoryManagement,
      },
      {
        'name': categoryBoolean ? '商品标签' : 'Tags Management',
        'id': 317,
        'sn': 'tagsmanagement',
        'pageUrl': pagesRouter.TagsManagement,
      },
      {
        'name': categoryBoolean ? 'SKU管理' : 'Skus Management',
        'id': 316,
        'sn': 'skusmanagement',
        'pageUrl': pagesRouter.SkusManagement,
      },
    ],
  },
  {
    'name': categoryBoolean ? '商城商品' : 'Mall Goods',
    'id': 6,
    'sn': 'mallgoods',
    'subNav': [
      {
        'name': categoryBoolean ? '上架中商品' : 'On Shelves',
        'id': 61,
        'sn': 'onshelves',
        'pageUrl': pagesRouter.MallGoodsOnShelves,
        'subNav': [
          {
            'name': categoryBoolean ? '上架中商品' : 'On Shelves',
            'id': 611,
            'sn': 'onshelves',
            'pageUrl': pagesRouter.MallGoodsOnShelves,
          },
          {
            'name': categoryBoolean ? '商品详情' : 'Goods Details',
            'id': 612,
            'sn': 'view',
            'pageUrl': pagesRouter.OnShelvesGoodsDetailsView,
          },
          {
            'name': categoryBoolean ? '编辑商品' : 'Edit Goods',
            'id': 613,
            'sn': 'edit',
            'pageUrl': pagesRouter.OnShelvesGoodsDetailsEdit,
          }
        ],
      },
      {
        'name': categoryBoolean ? '待上架商品' : 'Waiting for Shelves',
        'id': 62,
        'sn': 'waitingfor',
        'pageUrl': pagesRouter.MallGoodsWaitingForShelves,
        'subNav': [
          {
            'name': categoryBoolean ? '待上架商品' : 'Waiting for Shelves',
            'id': 621,
            'sn': 'waitingfor',
            'pageUrl': pagesRouter.MallGoodsWaitingForShelves,
          },
          {
            'name': categoryBoolean ? '上架商品' : 'Putaway Goods',
            'id': 622,
            'sn': 'putaway',
            'pageUrl': pagesRouter.WaitingForGoodsDetailsEdit,
          }
        ],
      },
    ],
  },
  {
    'name': categoryBoolean ? '订单管理' : 'Sales Order',
    'id': 7,
    'sn': 'sales',
    'subNav': [
      {
        'name': categoryBoolean ? 'APP 订单' : 'APP Order',
        'id': 71,
        'sn': 'apporder',
        'pageUrl': pagesRouter.AppOrderList,
        'subNav': [
          {
            'name': categoryBoolean ? 'APP 订单' : 'APP Order',
            'id': 711,
            'sn': 'apporder',
            'pageUrl': pagesRouter.AppOrderList,
          },
          {
            'name': categoryBoolean ? 'APP 订单详情' : 'APP Order Detail',
            'id': 712,
            'sn': 'detail',
            'pageUrl': pagesRouter.AppOrderDetail,
          },
        ],
      },
      {
        'name': categoryBoolean ? '手工订单' : 'Manual Order',
        'id': 72,
        'sn': 'manualorder',
        'pageUrl': pagesRouter.ManualOrderList,
        'subNav': [
          {
            'name': categoryBoolean ? '手工订单' : 'Manual Order',
            'id': 721,
            'sn': 'manualorder',
            'pageUrl': pagesRouter.AppOrderList,
          },
          {
            'name': categoryBoolean ? '手工订单详情' : 'Manual Order Detail',
            'id': 722,
            'sn': 'detail',
            'pageUrl': pagesRouter.ManualOrderDetail,
          },
          {
            'name': categoryBoolean ? '创建手工订单' : 'Create Manual Order',
            'id': 723,
            'sn': 'create',
            'pageUrl': pagesRouter.CreateManualOrder,
          },
        ],
      },
      {
        'name': categoryBoolean ? '退款订单' : 'Refund Order',
        'id': 73,
        'sn': 'refundorder',
        'pageUrl': pagesRouter.RefundOrderList,
        'subNav': [
          {
            'name': categoryBoolean ? '退款订单' : 'Refund Order',
            'id': 731,
            'sn': 'refundorder',
            'pageUrl': pagesRouter.RefundOrderList,
          },
          {
            'name': categoryBoolean ? '退款订单详情' : 'Refund Order Detail',
            'id': 732,
            'sn': 'detail',
            'pageUrl': pagesRouter.RefundOrderDetail,
          },
        ],
      },
    ],
  },
  {
    'name': categoryBoolean ? '采购管理' : 'Purchase Manage',
    'id': 4,
    'sn': 'purchase',
    'subNav': [
      {
        'name': categoryBoolean ? '采购订单' : 'PO List',
        'id': 41,
        'sn': 'orderlist',
        'pageUrl': pagesRouter.PurchaseOrderList,
        'subNav': [
          {
            'name': categoryBoolean ? '采购订单' : 'PO List',
            'id': 411,
            'sn': 'orderlist',
            'pageUrl': pagesRouter.PurchaseOrderList,
          },
          {
            'name': categoryBoolean ? '新增采购订单' : 'Create New PO',
            'id': 412,
            'sn': 'create',
            'pageUrl': pagesRouter.PurchaseOrderListCreate,
          },
          {
            'name': categoryBoolean ? '查看采购订单' : 'View PO',
            'id': 413,
            'sn': 'view',
            'pageUrl': pagesRouter.PurchaseOrderListView,
          },
          {
            'name': categoryBoolean ? '编辑采购订单' : 'Edit PO',
            'id': 414,
            'sn': 'edit',
            'pageUrl': pagesRouter.PurchaseOrderListEdit,
          },
          {
            'name': categoryBoolean ? '采购订单入库' : 'PO In Storage',
            'id': 415,
            'sn': 'instorage',
            'pageUrl': pagesRouter.PurchaseOrderListInStorage,
          }
        ]
      },
      {
        'name': categoryBoolean ? '供应商信息' : 'Suppliers',
        'id': 42,
        'sn': 'suppliers',
        'pageUrl': pagesRouter.PurchaseSupplier,
        'subNav': [
          {
            'name': categoryBoolean ? '供应商信息' : 'Suppliers',
            'id': 42,
            'sn': 'suppliers',
            'pageUrl': pagesRouter.PurchaseSupplier,
          }
        ]
      }
    ],
  },
  {
    'name': categoryBoolean ? '库存管理' : 'Warehouse Manage',
    'id': 5,
    'sn': 'warehouse',
    'subNav': [
      {
        'name': categoryBoolean ? '商品出库' : 'Goods Outbound',
        'id': 51,
        'sn': 'outboundlist',
        'pageUrl': pagesRouter.WarehouseOutboundlist,
        'subNav': [
          {
            'name': categoryBoolean ? '商品出库' : 'Goods Outbound',
            'id': 511,
            'sn': 'outboundlist',
            'pageUrl': pagesRouter.WarehouseOutboundlist,
          },
          {
            'name': categoryBoolean ? '创建出库单' : 'Create Outbound',
            'id': 513,
            'sn': 'create',
            'pageUrl': pagesRouter.WarehouseOutboundlistCreate,
          },
          {
            'name': categoryBoolean ? '出库单详情' : 'Outbound Detail',
            'id': 512,
            'sn': 'view',
            'pageUrl': pagesRouter.WarehouseOutboundlistView,
          },
        ]
      },
      {
        'name': categoryBoolean ? '库存盘点' : 'Stock Count',
        'id': 52,
        'sn': 'countlist',
        'pageUrl': pagesRouter.WarehouseCountlist,
        'subNav': [
          {
            'name': categoryBoolean ? '库存盘点' : 'Stock Count',
            'id': 521,
            'sn': 'countlist',
            'pageUrl': pagesRouter.WarehouseCountlist,
          },
          {
            'name': categoryBoolean ? '创建盘点单' : 'Create Inventory',
            'id': 522,
            'sn': 'create',
            'pageUrl': pagesRouter.WarehouseCountlistCreate,
          },
          {
            'name': categoryBoolean ? '盘点单详情' : 'Inventory Detail',
            'id': 523,
            'sn': 'view',
            'pageUrl': pagesRouter.WarehouseCountlistView,
          },
          {
            'name': categoryBoolean ? '盘点' : 'Inventory',
            'id': 524,
            'sn': 'inventory',
            'pageUrl': pagesRouter.WarehouseCountlistInventory,
          },
        ]
      },
      {
        'name': categoryBoolean ? '仓库库存' : 'Warehouse Inventory',
        'id': 53,
        'sn': 'inventorylist',
        'pageUrl': pagesRouter.WarehouseInventorylist,
      },
    ],
  },
]

export default navs
