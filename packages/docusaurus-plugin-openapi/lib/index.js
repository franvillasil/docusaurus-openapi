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
exports.validateOptions = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("@docusaurus/utils");
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const docs_1 = require("./docs/docs");
const markdown_1 = require("./markdown");
const openapi_1 = require("./openapi");
const sidebars_1 = require("./sidebars");
const util_1 = require("./util");
function pluginOpenAPI(context, options) {
  var _a;
  const { baseUrl, generatedFilesDir, siteDir } = context;
  const pluginId =
    (_a = options.id) !== null && _a !== void 0
      ? _a
      : utils_1.DEFAULT_PLUGIN_ID;
  const pluginDataDirRoot = path_1.default.join(
    generatedFilesDir,
    "docusaurus-plugin-openapi"
  );
  const dataDir = path_1.default.join(pluginDataDirRoot, pluginId);
  const aliasedSource = (source) =>
    `~api/${(0, utils_1.posixPath)(
      path_1.default.relative(pluginDataDirRoot, source)
    )}`;
  const contentPath = (0, util_1.isURL)(options.path)
    ? options.path
    : path_1.default.resolve(context.siteDir, options.path);
  return {
    name: "docusaurus-plugin-openapi",
    getPathsToWatch() {
      if ((0, util_1.isURL)(contentPath)) return [];
      return [contentPath];
    },
    async loadContent() {
      const { routeBasePath } = options;
      async function toMetadata(
        /** E.g. "api/plugins/myDoc.mdx" */
        relativeSource
      ) {
        const source = path_1.default.join(contentPath, relativeSource);
        const content = await fs_extra_1.default.readFile(source, "utf-8");
        return {
          type: "mdx",
          ...(await (0, docs_1.processDocMetadata)({
            docFile: {
              contentPath: contentPath,
              filePath: source,
              source: relativeSource,
              content: content,
            },
            relativeSource: relativeSource,
            context: context,
            options: options,
            env: process.env.NODE_ENV,
          })),
        };
      }
      try {
        const openapiFiles = await (0, openapi_1.readOpenapiFiles)(
          contentPath,
          {}
        );
        const loadedApi = await (0, openapi_1.processOpenapiFiles)(
          openapiFiles,
          {
            baseUrl,
            routeBasePath,
            siteDir: context.siteDir,
          }
        );
        const pagesFiles = [];
        if (
          !contentPath.endsWith(".json") &&
          !contentPath.endsWith(".yaml") &&
          !contentPath.endsWith(".yml")
        ) {
          pagesFiles.push(
            ...(await (0, utils_1.Globby)(["**/*.{md,mdx}"], {
              cwd: contentPath,
              // ignore: options.exclude, // TODO
            }))
          );
        }
        loadedApi.push(...(await Promise.all(pagesFiles.map(toMetadata))));
        return { loadedApi };
      } catch (e) {
        console.error(
          chalk_1.default.red(`Loading of api failed for "${contentPath}"`)
        );
        throw e;
      }
    },
    async contentLoaded({ content, actions }) {
      const { loadedApi } = content;
      const {
        routeBasePath,
        apiLayoutComponent,
        apiItemComponent,
        sidebarCollapsed,
        sidebarCollapsible,
      } = options;
      const { addRoute, createData } = actions;
      const sidebarName = `openapi-sidebar-${pluginId}`;
      const sidebar = await (0, sidebars_1.generateSidebar)(loadedApi, {
        contentPath,
        sidebarCollapsible,
        sidebarCollapsed,
      });
      const promises = loadedApi.map(async (item) => {
        const pageId = `site-${routeBasePath}-${item.id}`;
        if (item.type === "api" || item.type === "info") {
          await createData(
            `${(0, utils_1.docuHash)(pageId)}.json`,
            JSON.stringify(item, null, 2)
          );
          // TODO: "-content" should be inside hash to prevent name too long errors.
          const markdown = await createData(
            `${(0, utils_1.docuHash)(pageId)}-content.mdx`,
            item.type === "api"
              ? (0, markdown_1.createApiPageMD)(item)
              : (0, markdown_1.createInfoPageMD)(item)
          );
          return {
            path: item.permalink,
            component: apiItemComponent,
            exact: true,
            modules: {
              content: markdown,
            },
            sidebar: sidebarName,
          };
        } else {
          await createData(
            // Note that this created data path must be in sync with
            // metadataPath provided to mdx-loader.
            `${(0, utils_1.docuHash)(item.source)}.json`,
            JSON.stringify(item, null, 2)
          );
          return {
            path: item.permalink,
            component: "@theme/MarkdownItem",
            exact: true,
            modules: {
              content: item.source,
            },
            sidebar: sidebarName,
          };
        }
      });
      // Important: the layout component should not end with /,
      // as it conflicts with the home doc
      // Workaround fix for https://github.com/facebook/docusaurus/issues/2917
      const apiBaseRoute = (0, utils_1.normalizeUrl)([baseUrl, routeBasePath]);
      const basePath = apiBaseRoute === "/" ? "" : apiBaseRoute;
      // Generates a new root route using the first api item.
      async function rootRoute() {
        const item = loadedApi[0];
        const pageId = `site-${routeBasePath}-${item.id}`;
        return {
          path: basePath,
          component: apiItemComponent,
          exact: true,
          modules: {
            // TODO: "-content" should be inside hash to prevent name too long errors.
            content: path_1.default.join(
              dataDir,
              `${(0, utils_1.docuHash)(pageId)}-content.mdx`
            ),
          },
          sidebar: sidebarName,
        };
      }
      // Whether we already have a document whose permalink falls on the root route.
      const hasRootRoute = (await Promise.all(promises)).find(
        (d) =>
          (0, utils_1.normalizeUrl)([d.path, "/"]) ===
          (0, utils_1.normalizeUrl)([basePath, "/"])
      );
      const routes = await Promise.all([
        ...promises,
        ...(hasRootRoute ? [] : [rootRoute()]),
      ]);
      const apiBaseMetadataPath = await createData(
        `${(0, utils_1.docuHash)(`api-metadata-prop`)}.json`,
        JSON.stringify(
          {
            apiSidebars: {
              [sidebarName]: sidebar,
            },
          },
          null,
          2
        )
      );
      addRoute({
        path: basePath,
        exact: false,
        component: apiLayoutComponent,
        routes,
        modules: {
          apiMetadata: aliasedSource(apiBaseMetadataPath),
        },
      });
      return;
    },
    configureWebpack(_config, isServer, { getJSLoader }) {
      const {
        rehypePlugins,
        remarkPlugins,
        beforeDefaultRehypePlugins,
        beforeDefaultRemarkPlugins,
      } = options;
      return {
        resolve: {
          alias: {
            "~api": pluginDataDirRoot,
          },
        },
        module: {
          rules: [
            {
              test: /(\.mdx?)$/,
              include: [dataDir, contentPath].map(
                utils_1.addTrailingPathSeparator
              ),
              use: [
                getJSLoader({ isServer }),
                {
                  loader: require.resolve("@docusaurus/mdx-loader"),
                  options: {
                    remarkPlugins,
                    rehypePlugins,
                    beforeDefaultRehypePlugins,
                    beforeDefaultRemarkPlugins,
                    metadataPath: (mdxPath) => {
                      if (mdxPath.startsWith(dataDir)) {
                        // The MDX file already lives in `dataDir`: this is an OpenAPI MDX
                        return mdxPath.replace(/(-content\.mdx?)$/, ".json");
                      } else {
                        // Standard resolution
                        const aliasedSource = (0, utils_1.aliasedSitePath)(
                          mdxPath,
                          siteDir
                        );
                        return path_1.default.join(
                          dataDir,
                          `${(0, utils_1.docuHash)(aliasedSource)}.json`
                        );
                      }
                    },
                  },
                },
              ].filter(Boolean),
            },
          ],
        },
      };
    },
  };
}
exports.default = pluginOpenAPI;
var options_1 = require("./options");
Object.defineProperty(exports, "validateOptions", {
  enumerable: true,
  get: function () {
    return options_1.validateOptions;
  },
});
