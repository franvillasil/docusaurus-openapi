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
exports.processOpenapiFile =
  exports.processOpenapiFiles =
  exports.readOpenapiFiles =
    void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("@docusaurus/utils");
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const json_refs_1 = __importDefault(require("json-refs"));
const json_schema_resolve_allof_1 = __importDefault(
  require("json-schema-resolve-allof")
);
const lodash_1 = require("lodash");
const openapi_to_postmanv2_1 = __importDefault(require("openapi-to-postmanv2"));
const postman_collection_1 = __importDefault(require("postman-collection"));
const util_1 = require("../util");
const createExample_1 = require("./createExample");
/**
 * Finds any reference objects in the OpenAPI definition and resolves them to a finalized value.
 */
async function resolveRefs(openapiData) {
  const { resolved } = await json_refs_1.default.resolveRefs(openapiData);
  return (0, json_schema_resolve_allof_1.default)(resolved);
}
/**
 * Convenience function for converting raw JSON to a Postman Collection object.
 */
function jsonToCollection(data) {
  return new Promise((resolve, reject) => {
    openapi_to_postmanv2_1.default.convert(
      { type: "json", data },
      {},
      (_err, conversionResult) => {
        if (!conversionResult.result) {
          return reject(conversionResult.reason);
        }
        return resolve(
          new postman_collection_1.default.Collection(
            conversionResult.output[0].data
          )
        );
      }
    );
  });
}
/**
 * Creates a Postman Collection object from an OpenAPI definition.
 */
async function createPostmanCollection(openapiData) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const data = JSON.parse(JSON.stringify(openapiData));
  // Including `servers` breaks postman, so delete all of them.
  delete data.servers;
  for (let pathItemObject of Object.values(data.paths)) {
    delete pathItemObject.servers;
    (_a = pathItemObject.get) === null || _a === void 0
      ? true
      : delete _a.servers;
    (_b = pathItemObject.put) === null || _b === void 0
      ? true
      : delete _b.servers;
    (_c = pathItemObject.post) === null || _c === void 0
      ? true
      : delete _c.servers;
    (_d = pathItemObject.delete) === null || _d === void 0
      ? true
      : delete _d.servers;
    (_e = pathItemObject.options) === null || _e === void 0
      ? true
      : delete _e.servers;
    (_f = pathItemObject.head) === null || _f === void 0
      ? true
      : delete _f.servers;
    (_g = pathItemObject.patch) === null || _g === void 0
      ? true
      : delete _g.servers;
    (_h = pathItemObject.trace) === null || _h === void 0
      ? true
      : delete _h.servers;
  }
  return await jsonToCollection(data);
}
function createItems(openapiData) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
  // TODO: Find a better way to handle this
  let items = [];
  // Only create an info page if we have a description.
  if (openapiData.info.description) {
    const infoPage = {
      type: "info",
      id: "introduction",
      unversionedId: "introduction",
      title: "Introduction",
      description: openapiData.info.description,
      slug: "/introduction",
      frontMatter: {},
      info: {
        ...openapiData.info,
        title:
          (_a = openapiData.info.title) !== null && _a !== void 0
            ? _a
            : "Introduction",
      },
    };
    items.push(infoPage);
  }
  for (let [path, pathObject] of Object.entries(openapiData.paths)) {
    const { $ref, description, parameters, servers, summary, ...rest } =
      pathObject;
    for (let [method, operationObject] of Object.entries({ ...rest })) {
      const title =
        (_c =
          (_b = operationObject.summary) !== null && _b !== void 0
            ? _b
            : operationObject.operationId) !== null && _c !== void 0
          ? _c
          : "Missing summary";
      if (operationObject.description === undefined) {
        operationObject.description =
          (_e =
            (_d = operationObject.summary) !== null && _d !== void 0
              ? _d
              : operationObject.operationId) !== null && _e !== void 0
            ? _e
            : "";
      }
      const baseId = (0, lodash_1.kebabCase)(title);
      const servers =
        (_g =
          (_f = operationObject.servers) !== null && _f !== void 0
            ? _f
            : pathObject.servers) !== null && _g !== void 0
          ? _g
          : openapiData.servers;
      const security =
        (_h = operationObject.security) !== null && _h !== void 0
          ? _h
          : openapiData.security;
      // Add security schemes so we know how to handle security.
      const securitySchemes =
        (_k =
          (_j = openapiData.components) === null || _j === void 0
            ? void 0
            : _j.securitySchemes) !== null && _k !== void 0
          ? _k
          : openapiData.securityDefinitions;
      // Make sure schemes are lowercase. See: https://github.com/cloud-annotations/docusaurus-plugin-openapi/issues/79
      if (securitySchemes) {
        for (let securityScheme of Object.values(securitySchemes)) {
          if (securityScheme.type === "http") {
            securityScheme.scheme = securityScheme.scheme.toLowerCase();
          }
        }
      }
      let jsonRequestBodyExample;
      const body =
        (_m =
          (_l = operationObject.requestBody) === null || _l === void 0
            ? void 0
            : _l.content) === null || _m === void 0
          ? void 0
          : _m["application/json"];
      if (body === null || body === void 0 ? void 0 : body.schema) {
        jsonRequestBodyExample = (0, createExample_1.sampleFromSchema)(
          body.schema
        );
      }
      // TODO: Don't include summary temporarilly
      const { summary, ...defaults } = operationObject;
      const apiPage = {
        type: "api",
        id: baseId,
        unversionedId: baseId,
        title: title,
        description:
          description !== null && description !== void 0 ? description : "",
        slug: "/" + baseId,
        frontMatter: {},
        api: {
          ...defaults,
          tags:
            (_o = operationObject.tags) === null || _o === void 0
              ? void 0
              : _o.map((tagName) => {
                  var _a;
                  return getTagDisplayName(
                    tagName,
                    (_a = openapiData.tags) !== null && _a !== void 0 ? _a : []
                  );
                }),
          method,
          path,
          servers,
          security,
          securitySchemes,
          jsonRequestBodyExample,
          info: openapiData.info,
        },
      };
      items.push(apiPage);
    }
  }
  return items;
}
/**
 * Attach Postman Request objects to the corresponding ApiItems.
 */
function bindCollectionToApiItems(items, postmanCollection) {
  postmanCollection.forEachItem((item) => {
    const method = item.request.method.toLowerCase();
    const path = item.request.url
      .getPath({ unresolved: true }) // unresolved returns "/:variableName" instead of "/<type>"
      .replace(/:([a-z0-9-_]+)/gi, "{$1}"); // replace "/:variableName" with "/{variableName}"
    const apiItem = items.find((item) => {
      if (item.type === "info" || item.type === "mdx") {
        return false;
      }
      return item.api.path === path && item.api.method === method;
    });
    if (
      (apiItem === null || apiItem === void 0 ? void 0 : apiItem.type) === "api"
    ) {
      apiItem.api.postman = item.request;
    }
  });
}
async function readOpenapiFiles(openapiPath, _options) {
  if ((0, util_1.isURL)(openapiPath)) {
    const { data } = await axios_1.default.get(openapiPath);
    if (!data) {
      throw Error(
        `Did not find an OpenAPI specification at URL ${openapiPath}`
      );
    }
    return [
      {
        source: openapiPath,
        sourceDirName: ".",
        data,
      },
    ];
  }
  const stat = await fs_extra_1.default.lstat(openapiPath);
  if (stat.isDirectory()) {
    console.warn(
      chalk_1.default.yellow(
        "WARNING: Loading a directory of OpenAPI definitions is experimental and subject to unannounced breaking changes."
      )
    );
    // TODO: Add config for inlcude/ignore
    const allFiles = await (0, utils_1.Globby)(["**/*.{json,yaml,yml}"], {
      cwd: openapiPath,
      ignore: utils_1.GlobExcludeDefault,
    });
    // Explicitly look for _spec_ files, which are excluded by default since they start with _
    allFiles.push(
      ...(await (0, utils_1.Globby)(["**/_spec_.{json,yaml,yml}"], {
        cwd: openapiPath,
      }))
    );
    const sources = allFiles.filter((x) => !x.includes("_category_")); // todo: regex exclude?
    return Promise.all(
      sources.map(async (source) => {
        // TODO: make a function for this
        const fullPath = path_1.default.join(openapiPath, source);
        const openapiString = await fs_extra_1.default.readFile(
          fullPath,
          "utf-8"
        );
        const data = js_yaml_1.default.load(openapiString);
        return {
          source: fullPath,
          sourceDirName: path_1.default.dirname(source),
          data,
        };
      })
    );
  }
  const openapiString = await fs_extra_1.default.readFile(openapiPath, "utf-8");
  const data = js_yaml_1.default.load(openapiString);
  return [
    {
      source: openapiPath,
      sourceDirName: ".",
      data,
    },
  ];
}
exports.readOpenapiFiles = readOpenapiFiles;
async function processOpenapiFiles(files, options) {
  const promises = files.map(async (file) => {
    const items = await processOpenapiFile(file.data);
    return items.map((item) => ({
      ...item,
      source: (0, utils_1.aliasedSitePath)(file.source, options.siteDir),
      sourceDirName: file.sourceDirName,
    }));
  });
  const metadata = await Promise.all(promises);
  const items = metadata.flat();
  let seen = {};
  for (let i = 0; i < items.length; i++) {
    const baseId = items[i].id;
    let count = seen[baseId];
    let id;
    if (count) {
      id = `${baseId}-${count}`;
      seen[baseId] = count + 1;
    } else {
      id = baseId;
      seen[baseId] = 1;
    }
    items[i].id = id;
    items[i].unversionedId = id;
    items[i].slug = "/" + id;
  }
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const prev = items[i - 1];
    const next = items[i + 1];
    current.permalink = (0, utils_1.normalizeUrl)([
      options.baseUrl,
      options.routeBasePath,
      current.id,
    ]);
    if (prev) {
      current.previous = {
        title: prev.title,
        permalink: (0, utils_1.normalizeUrl)([
          options.baseUrl,
          options.routeBasePath,
          prev.id,
        ]),
      };
    }
    if (next) {
      current.next = {
        title: next.title,
        permalink: (0, utils_1.normalizeUrl)([
          options.baseUrl,
          options.routeBasePath,
          next.id,
        ]),
      };
    }
  }
  return items;
}
exports.processOpenapiFiles = processOpenapiFiles;
async function processOpenapiFile(openapiDataWithRefs) {
  const openapiData = await resolveRefs(openapiDataWithRefs);
  const postmanCollection = await createPostmanCollection(openapiData);
  const items = createItems(openapiData);
  bindCollectionToApiItems(items, postmanCollection);
  return items;
}
exports.processOpenapiFile = processOpenapiFile;
// order for picking items as a display name of tags
const tagDisplayNameProperties = ["x-displayName", "name"];
function getTagDisplayName(tagName, tags) {
  var _a;
  // find the very own tagObject
  const tagObject =
    (_a = tags.find((tagObject) => tagObject.name === tagName)) !== null &&
    _a !== void 0
      ? _a
      : {
          // if none found, just fake one
          name: tagName,
        };
  // return the first found and filled value from the property list
  for (const property of tagDisplayNameProperties) {
    const displayName = tagObject[property];
    if (typeof displayName === "string") {
      return displayName;
    }
  }
  // always default to the tagName
  return tagName;
}
