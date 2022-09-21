import type { DeepPartial } from "utility-types";
import type { InfoPageMetadata, MdxPageMetadata, PropSidebar } from "../types";
import { ApiPageMetadata } from "../types";
interface Options {
  contentPath: string;
  sidebarCollapsible: boolean;
  sidebarCollapsed: boolean;
}
declare type keys =
  | "type"
  | "title"
  | "permalink"
  | "id"
  | "source"
  | "sourceDirName";
declare type InfoItem = Pick<InfoPageMetadata, keys>;
declare type ApiItem = Pick<ApiPageMetadata, keys> & {
  api: DeepPartial<ApiPageMetadata["api"]>;
};
declare type MdxItem = Pick<MdxPageMetadata, keys | "frontMatter">;
declare type Item = InfoItem | ApiItem | MdxItem;
export declare function generateSidebar(
  items: Item[],
  options: Options
): Promise<PropSidebar>;
export {};
