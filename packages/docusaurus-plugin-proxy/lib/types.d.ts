import type { Configuration } from "webpack-dev-server";
export interface PluginOptions {
  proxy: Configuration["proxy"];
}
