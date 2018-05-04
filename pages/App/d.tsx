export interface RouteItem {
  path?: string
  component: string
}

/* tslint:disable */
export interface Routes {
  readonly path: string
  openKeys: string[]
  children: any[]
  component: string
}
