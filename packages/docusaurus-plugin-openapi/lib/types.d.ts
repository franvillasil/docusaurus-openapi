import type { MDXOptions } from "@docusaurus/mdx-loader";
import type { Request } from "postman-collection";
import {
  InfoObject,
  OperationObject,
  SecuritySchemeObject,
} from "./openapi/types";
export type {
  PropSidebarItemCategory,
  SidebarItemLink,
  PropSidebar,
  PropSidebarItem,
} from "@docusaurus/plugin-content-docs-types";
export interface PluginOptions extends MDXOptions {
  id: string;
  path: string;
  routeBasePath: string;
  apiLayoutComponent: string;
  apiItemComponent: string;
  admonitions:
    | boolean
    | {
        tag: string;
        keywords: string[];
      };
  sidebarCollapsible: boolean;
  sidebarCollapsed: boolean;
}
export interface LoadedContent {
  loadedApi: ApiMetadata[];
}
export declare type ApiMetadata =
  | ApiPageMetadata
  | InfoPageMetadata
  | MdxPageMetadata;
export interface ApiMetadataBase {
  sidebar?: string;
  previous?: ApiNavLink;
  next?: ApiNavLink;
  id: string;
  unversionedId: string;
  title: string;
  description: string;
  source: string;
  sourceDirName: string;
  slug: string;
  permalink: string;
  sidebarPosition?: number;
  frontMatter: Record<string, unknown>;
}
export interface ApiPageMetadata extends ApiMetadataBase {
  type: "api";
  api: ApiItem;
}
export interface ApiItem extends OperationObject {
  method: string;
  path: string;
  jsonRequestBodyExample: string;
  securitySchemes?: {
    [key: string]: SecuritySchemeObject;
  };
  postman?: Request;
  info: InfoObject;
}
export interface InfoPageMetadata extends ApiMetadataBase {
  type: "info";
  info: ApiInfo;
}
export interface MdxPageMetadata extends ApiMetadataBase {
  type: "mdx";
}
export declare type ApiInfo = InfoObject;
export interface ApiNavLink {
  title: string;
  permalink: string;
}
