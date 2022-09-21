"use strict";
/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchemaTable = void 0;
const lodash_1 = require("lodash");
const createDescription_1 = require("./createDescription");
const createFullWidthTable_1 = require("./createFullWidthTable");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
function resolveAllOf(allOf) {
  // TODO: naive implementation (only supports objects, no directly nested allOf)
  const properties = allOf.reduce((acc, cur) => {
    if (cur.properties !== undefined) {
      const next = { ...acc, ...cur.properties };
      return next;
    }
    return acc;
  }, {});
  const required = allOf.reduce((acc, cur) => {
    if (Array.isArray(cur.required)) {
      const next = [...acc, ...cur.required];
      return next;
    }
    return acc;
  }, []);
  return { properties, required };
}
function createRow({ name, schema, required }) {
  return (0, utils_1.create)("tr", {
    children: (0, utils_1.create)("td", {
      children: [
        (0, utils_1.create)("code", { children: (0, lodash_1.escape)(name) }),
        (0, utils_1.create)("span", {
          style: { opacity: "0.6" },
          children: ` ${(0, schema_1.getSchemaName)(schema, true)}`,
        }),
        (0, utils_1.guard)(required, () => [
          (0, utils_1.create)("span", {
            style: { opacity: "0.6" },
            children: " — ",
          }),
          (0, utils_1.create)("strong", {
            style: {
              fontSize: "var(--ifm-code-font-size)",
              color: "var(--openapi-required)",
            },
            children: " REQUIRED",
          }),
        ]),
        (0, utils_1.guard)(
          (0, schema_1.getQualifierMessage)(schema),
          (message) =>
            (0, utils_1.create)("div", {
              style: { marginTop: "var(--ifm-table-cell-padding)" },
              children: (0, createDescription_1.createDescription)(message),
            })
        ),
        (0, utils_1.guard)(schema.description, (description) =>
          (0, utils_1.create)("div", {
            style: { marginTop: "var(--ifm-table-cell-padding)" },
            children: (0, createDescription_1.createDescription)(description),
          })
        ),
        createRows({ schema: schema }),
      ],
    }),
  });
}
function createRows({ schema }) {
  // object
  if (schema.properties !== undefined) {
    return (0, createFullWidthTable_1.createFullWidthTable)({
      style: {
        marginTop: "var(--ifm-table-cell-padding)",
        marginBottom: "0px",
      },
      children: (0, utils_1.create)("tbody", {
        children: Object.entries(schema.properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false,
          })
        ),
      }),
    });
  }
  // TODO: This can be a bit complicated types can be missmatched and there can be nested allOfs which need to be resolved before merging properties
  if (schema.allOf !== undefined) {
    const { properties, required } = resolveAllOf(schema.allOf);
    return (0, createFullWidthTable_1.createFullWidthTable)({
      style: {
        marginTop: "var(--ifm-table-cell-padding)",
        marginBottom: "0px",
      },
      children: (0, utils_1.create)("tbody", {
        children: Object.entries(properties).map(([key, val]) =>
          createRow({
            name: key,
            schema: val,
            required: Array.isArray(required) ? required.includes(key) : false,
          })
        ),
      }),
    });
  }
  // array
  if (schema.items !== undefined) {
    return createRows({ schema: schema.items });
  }
  // primitive
  return undefined;
}
function createRowsRoot({ schema }) {
  // object
  if (schema.properties !== undefined) {
    return Object.entries(schema.properties).map(([key, val]) =>
      createRow({
        name: key,
        schema: val,
        required: Array.isArray(schema.required)
          ? schema.required.includes(key)
          : false,
      })
    );
  }
  // TODO: This can be a bit complicated types can be missmatched and there can be nested allOfs which need to be resolved before merging properties
  if (schema.allOf !== undefined) {
    const { properties, required } = resolveAllOf(schema.allOf);
    return Object.entries(properties).map(([key, val]) =>
      createRow({
        name: key,
        schema: val,
        required: Array.isArray(required) ? required.includes(key) : false,
      })
    );
  }
  // array
  if (schema.items !== undefined) {
    return (0, utils_1.create)("tr", {
      children: (0, utils_1.create)("td", {
        children: [
          (0, utils_1.create)("span", {
            style: { opacity: "0.6" },
            children: ` ${(0, schema_1.getSchemaName)(schema, true)}`,
          }),
          createRows({ schema: schema.items }),
        ],
      }),
    });
  }
  // primitive
  return (0, utils_1.create)("tr", {
    children: (0, utils_1.create)("td", {
      children: [
        (0, utils_1.create)("span", {
          style: { opacity: "0.6" },
          children: ` ${schema.type}`,
        }),
        (0, utils_1.guard)(
          (0, schema_1.getQualifierMessage)(schema),
          (message) =>
            (0, utils_1.create)("div", {
              style: { marginTop: "var(--ifm-table-cell-padding)" },
              children: (0, createDescription_1.createDescription)(message),
            })
        ),
        (0, utils_1.guard)(schema.description, (description) =>
          (0, utils_1.create)("div", {
            style: { marginTop: "var(--ifm-table-cell-padding)" },
            children: (0, createDescription_1.createDescription)(description),
          })
        ),
      ],
    }),
  });
}
function createSchemaTable({ title, body, ...rest }) {
  if (body === undefined || body.content === undefined) {
    return undefined;
  }
  // TODO:
  // NOTE: We just pick a random content-type.
  // How common is it to have multiple?
  const randomFirstKey = Object.keys(body.content)[0];
  const firstBody = body.content[randomFirstKey].schema;
  if (firstBody === undefined) {
    return undefined;
  }
  // we don't show the table if there is no properties to show
  if (firstBody.properties !== undefined) {
    if (Object.keys(firstBody.properties).length === 0) {
      return undefined;
    }
  }
  return (0, createFullWidthTable_1.createFullWidthTable)({
    ...rest,
    children: [
      (0, utils_1.create)("thead", {
        children: (0, utils_1.create)("tr", {
          children: (0, utils_1.create)("th", {
            style: { textAlign: "left" },
            children: [
              `${title} `,
              (0, utils_1.guard)(body.required, () => [
                (0, utils_1.create)("span", {
                  style: { opacity: "0.6" },
                  children: " — ",
                }),
                (0, utils_1.create)("strong", {
                  style: {
                    fontSize: "var(--ifm-code-font-size)",
                    color: "var(--openapi-required)",
                  },
                  children: " REQUIRED",
                }),
              ]),
              (0, utils_1.create)("div", {
                children: (0, createDescription_1.createDescription)(
                  body.description
                ),
              }),
            ],
          }),
        }),
      }),
      (0, utils_1.create)("tbody", {
        children: createRowsRoot({ schema: firstBody }),
      }),
    ],
  });
}
exports.createSchemaTable = createSchemaTable;
