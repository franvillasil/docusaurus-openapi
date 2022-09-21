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
exports.validateOptions =
  exports.OptionsSchema =
  exports.DEFAULT_OPTIONS =
    void 0;
const utils_validation_1 = require("@docusaurus/utils-validation");
const chalk_1 = __importDefault(require("chalk"));
const remark_admonitions_1 = __importDefault(require("remark-admonitions"));
exports.DEFAULT_OPTIONS = {
  path: "openapi.json",
  routeBasePath: "api",
  apiLayoutComponent: "@theme/ApiPage",
  apiItemComponent: "@theme/ApiItem",
  remarkPlugins: [],
  rehypePlugins: [],
  beforeDefaultRemarkPlugins: [],
  beforeDefaultRehypePlugins: [],
  admonitions: true,
  sidebarCollapsible: true,
  sidebarCollapsed: true,
};
exports.OptionsSchema = utils_validation_1.Joi.object({
  path: utils_validation_1.Joi.string().default(exports.DEFAULT_OPTIONS.path),
  routeBasePath: utils_validation_1.Joi.string()
    // '' not allowed, see https://github.com/facebook/docusaurus/issues/3374
    // .allow('') ""
    .default(exports.DEFAULT_OPTIONS.routeBasePath),
  sidebarCollapsible: utils_validation_1.Joi.boolean().default(
    exports.DEFAULT_OPTIONS.sidebarCollapsible
  ),
  sidebarCollapsed: utils_validation_1.Joi.boolean().default(
    exports.DEFAULT_OPTIONS.sidebarCollapsed
  ),
  apiLayoutComponent: utils_validation_1.Joi.string().default(
    exports.DEFAULT_OPTIONS.apiLayoutComponent
  ),
  apiItemComponent: utils_validation_1.Joi.string().default(
    exports.DEFAULT_OPTIONS.apiItemComponent
  ),
  remarkPlugins: utils_validation_1.RemarkPluginsSchema.default(
    exports.DEFAULT_OPTIONS.remarkPlugins
  ),
  rehypePlugins: utils_validation_1.RehypePluginsSchema.default(
    exports.DEFAULT_OPTIONS.rehypePlugins
  ),
  beforeDefaultRemarkPlugins: utils_validation_1.RemarkPluginsSchema.default(
    exports.DEFAULT_OPTIONS.beforeDefaultRemarkPlugins
  ),
  beforeDefaultRehypePlugins: utils_validation_1.RehypePluginsSchema.default(
    exports.DEFAULT_OPTIONS.beforeDefaultRehypePlugins
  ),
  admonitions: utils_validation_1.Joi.alternatives()
    .try(
      utils_validation_1.AdmonitionsSchema,
      utils_validation_1.Joi.boolean().invalid(true)
    )
    .default(exports.DEFAULT_OPTIONS.admonitions),
});
function validateOptions({ validate, options: userOptions }) {
  let options = userOptions;
  if (options.sidebarCollapsible === false) {
    // When sidebarCollapsible=false and sidebarCollapsed=undefined, we don't want to have the inconsistency warning
    // We let options.sidebarCollapsible become the default value for options.sidebarCollapsed
    if (typeof options.sidebarCollapsed === "undefined") {
      options = {
        ...options,
        sidebarCollapsed: false,
      };
    }
    if (options.sidebarCollapsed) {
      console.warn(
        chalk_1.default.yellow(
          "The docs plugin config is inconsistent. It does not make sense to use sidebarCollapsible=false and sidebarCollapsed=true at the same time. sidebarCollapsed=false will be ignored."
        )
      );
      options = {
        ...options,
        sidebarCollapsed: false,
      };
    }
  }
  const normalizedOptions = validate(exports.OptionsSchema, options);
  if (normalizedOptions.admonitions) {
    normalizedOptions.remarkPlugins = normalizedOptions.remarkPlugins.concat([
      [remark_admonitions_1.default, normalizedOptions.admonitions],
    ]);
  }
  return normalizedOptions;
}
exports.validateOptions = validateOptions;
