/**
 * Created by nicolaszs on 2017/12/11.
 */
import { asyncComponent, pagesRouter } from '@Src/utils'
// import navs from '@Src/utils/navs'
const Login = asyncComponent(() => import(
  /* webpackChunkName: "Login" */'@Pages/Login'
))

const ChangePassword = asyncComponent(() => import(
  /* webpackChunkName: "ChangePassword" */'@Pages/ChangePassword'
))

/* goods --start */
const GoodsList = asyncComponent(() => import(
  /* webpackChunkName: "GoodsList" */'@Pages/GoodsList'
))
const CreateGoods = asyncComponent(() => import(
  /* webpackChunkName: "CreateGoods" */'@Pages/CreateGoods'
))
const CategoryManagement = asyncComponent(() => import(
  /* webpackChunkName: "CategoryManagement" */'@Pages/CategoryManagement'
))
const TagsManagement = asyncComponent(() => import(
  /* webpackChunkName: "TagsManagement" */'@Pages/TagsManagement'
))
const SkusManagement = asyncComponent(() => import(
  /* webpackChunkName: "SkusManagement" */'@Pages/SkusManagement'
))
const PresaleGoods = asyncComponent(() => import(
  /* webpackChunkName: "PresaleGoods" */'@Pages/PresaleGoods'
))
/* goods --end */

/* mall goods --start */
const MallGoodsOnShelves = asyncComponent(() => import(
  /* webpackChunkName: "MallGoodsOnShelves" */'@Pages/MallGoodsOnShelves'
))
const OnShelvesGoodsDetails = asyncComponent(() => import(
  /* webpackChunkName: "OnShelvesGoodsDetails" */'@Pages/OnShelvesGoodsDetails'
))
const ShelvesGoodsEdit = asyncComponent(() => import(
  /* webpackChunkName: "ShelvesGoodsEdit" */'@Pages/ShelvesGoodsEdit'
))
const MallGoodsWaitingForShelves = asyncComponent(() => import(
  /* webpackChunkName: "MallGoodsWaitingForShelves" */'@Pages/MallGoodsWaitingForShelves'
))
/* mall goods --end */

/* sales order --start */
const AppOrderList = asyncComponent(() => import(
  /* webpackChunkName: "AppOrderList" */'@Pages/AppOrderList'
))
const SalesOrderDetail = asyncComponent(() => import(
  /* webpackChunkName: "SalesOrderDetail" */'@Pages/SalesOrderDetail'
))
const CreateManualOrder = asyncComponent(() => import(
  /* webpackChunkName: "CreateManualOrder" */'@Pages/CreateManualOrder'
))
const RefundOrderList = asyncComponent(() => import(
  /* webpackChunkName: "RefundOrderList" */'@Pages/RefundOrderList'
))
const RefundOrderDetail = asyncComponent(() => import(
  /* webpackChunkName: "RefundOrderDetail" */'@Pages/RefundOrderDetail'
))
/* sales order --end */

/* purchurse order --start */
const PurchaseOrderList = asyncComponent(() => import(
  /* webpackChunkName: "PurchaseOrderList" */'@Pages/PurchaseOrderList'
))
const AddNewPO = asyncComponent(() => import(
  /* webpackChunkName: "AddNewPO" */'@Pages/AddNewPO'
))
const POInStorage = asyncComponent(() => import(
  /* webpackChunkName: "POInStorage" */'@Pages/POInStorage'
))
const PurchaseSuppliers = asyncComponent(() => import(
  /* webpackChunkName: "PurchaseSuppliers" */'@Pages/PurchaseSuppliers'
))
/* purchurse order --end */

const WarehouseInventory = asyncComponent(() => import(
  /* webpackChunkName: "PurchaseSuppliers" */'@Pages/WarehouseInventory'
))
/* warehouse --start */
const GoodsOutbound = asyncComponent(() => import(
  /* webpackChunkName: "GoodsOutbound" */'@Pages/GoodsOutbound'
))
const StockCount = asyncComponent(() => import(
  /* webpackChunkName: "StockCount" */'@Pages/StockCount'
))
const AddNewStockCount = asyncComponent(() => import(
  /* webpackChunkName: "AddNewStockCount" */'@Pages/AddNewStockCount'
))
const AddNewOutbound = asyncComponent(() => import(
  /* webpackChunkName: "AddNewOutbound" */'@Pages/AddNewOutbound'
))
/* warehouse --end */

const routes = [
  { path: pagesRouter.Login, component: Login },
  { path: pagesRouter.ChangePassword, component: ChangePassword },
  {
    path: '/goods',
    component: '',
    openKeys: ['goods'],
    children: [
      {
        path: pagesRouter.GoodsList,
        component: GoodsList,
      },
      {
        path: pagesRouter.GoodsListCreate,
        component: CreateGoods,
      },
      {
        path: pagesRouter.GoodsListView,
        component: CreateGoods,
      },
      {
        path: pagesRouter.GoodsListEdit,
        component: CreateGoods,
      },
      {
        path: pagesRouter.CategoryManagement,
        component: CategoryManagement,
      },
      {
        path: pagesRouter.TagsManagement,
        component: TagsManagement,
      },
      {
        path: pagesRouter.SkusManagement,
        component: SkusManagement,
      },
      {
        path: pagesRouter.PresaleGoods,
        component: PresaleGoods,
      },
    ],
  },
  {
    path: '/mallgoods',
    component: '',
    openKeys: ['mallgoods'],
    children: [
      {
        path: pagesRouter.MallGoodsOnShelves,
        component: MallGoodsOnShelves,
      },
      {
        path: pagesRouter.OnShelvesGoodsDetailsView,
        component: OnShelvesGoodsDetails,
      },
      {
        path: pagesRouter.OnShelvesGoodsDetailsEdit,
        component: ShelvesGoodsEdit,
      },
      {
        path: pagesRouter.MallGoodsWaitingForShelves,
        component: MallGoodsWaitingForShelves,
      },
      {
        path: pagesRouter.WaitingForGoodsDetailsEdit,
        component: ShelvesGoodsEdit,
      },
    ],
  },
  {
    path: '/sales',
    component: '',
    openKeys: ['sales'],
    children: [
      {
        path: pagesRouter.AppOrderList,
        component: AppOrderList,
      },
      {
        path: pagesRouter.AppOrderDetail,
        component: SalesOrderDetail,
      },
      {
        path: pagesRouter.ManualOrderList,
        component: AppOrderList,
      },
      {
        path: pagesRouter.ManualOrderDetail,
        component: SalesOrderDetail,
      },
      {
        path: pagesRouter.CreateManualOrder,
        component: CreateManualOrder,
      },
      {
        path: pagesRouter.RefundOrderList,
        component: RefundOrderList,
      },
      {
        path: pagesRouter.RefundOrderDetail,
        component: RefundOrderDetail,
      },
    ],
  },
  {
    path: '/purchase',
    component: '',
    openKeys: ['purchase'],
    children: [
      {
        path: pagesRouter.PurchaseOrderList,
        component: PurchaseOrderList,
      },
      {
        path: pagesRouter.PurchaseOrderListCreate,
        component: AddNewPO,
      },
      {
        path: pagesRouter.PurchaseOrderListView,
        component: AddNewPO,
      },
      {
        path: pagesRouter.PurchaseOrderListEdit,
        component: AddNewPO,
      },
      {
        path: pagesRouter.PurchaseOrderListInStorage,
        component: POInStorage,
      },
      {
        path: pagesRouter.PurchaseSupplier,
        component: PurchaseSuppliers,
      },
    ],
  },
  {
    path: '/warehouse',
    component: '',
    openKeys: ['warehouse'],
    children: [
      {
        path: pagesRouter.WarehouseOutboundlist,
        component: GoodsOutbound,
      },
      {
        path: pagesRouter.WarehouseOutboundlistCreate,
        component: AddNewOutbound,
      },
      {
        path: pagesRouter.WarehouseOutboundlistView,
        component: AddNewOutbound,
      },
      {
        path: pagesRouter.WarehouseCountlist,
        component: StockCount
      },
      {
        path: pagesRouter.WarehouseCountlistCreate,
        component: AddNewStockCount
      },
      {
        path: pagesRouter.WarehouseCountlistView,
        component: AddNewStockCount
      },
      {
        path: pagesRouter.WarehouseCountlistInventory,
        component: AddNewStockCount
      },
      {
        path: pagesRouter.WarehouseInventorylist,
        component: WarehouseInventory
      },
    ],
  },
]

export default routes
