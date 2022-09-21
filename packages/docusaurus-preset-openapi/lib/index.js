"use strict";
/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const preset_classic_1 = __importDefault(require("@docusaurus/preset-classic"));
function makePluginConfig(source, options) {
  if (options) {
    return [require.resolve(source), options];
  }
  return require.resolve(source);
}
function preset(context, options = {}) {
  const { proxy, api, ...rest } = options;
  const { themes = [], plugins = [] } = (0, preset_classic_1.default)(
    context,
    rest
  );
  themes.push(makePluginConfig("docusaurus-theme-openapi"));
  if (api !== false) {
    plugins.push(makePluginConfig("docusaurus-plugin-openapi", api));
  }
  if (proxy !== false) {
    plugins.push(makePluginConfig("docusaurus-plugin-proxy", proxy));
  }
  return { themes, plugins };
}
exports.default = preset;
