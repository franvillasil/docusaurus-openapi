"use strict";
/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
describe("getQualifierMessage", () => {
  it("should render nothing", () => {
    const actual = (0, schema_1.getQualifierMessage)({});
    expect(actual).toBeUndefined();
  });
  //
  // minLength + maxLength
  //
  it("should render minLength", () => {
    const expected = "**Possible values:** 1 ≤ length";
    const actual = (0, schema_1.getQualifierMessage)({ minLength: 1 });
    expect(actual).toBe(expected);
  });
  it("should render maxLength", () => {
    const expected = "**Possible values:** length ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({ maxLength: 40 });
    expect(actual).toBe(expected);
  });
  it("should render minLength and maxLength", () => {
    const expected = "**Possible values:** 1 ≤ length ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({
      minLength: 1,
      maxLength: 40,
    });
    expect(actual).toBe(expected);
  });
  //
  // pattern
  //
  it("should render pattern", () => {
    const expected =
      "**Possible values:** Value must match regular expression `^[a-zA-Z0-9_-]*$`";
    const actual = (0, schema_1.getQualifierMessage)({
      pattern: "^[a-zA-Z0-9_-]*$",
    });
    expect(actual).toBe(expected);
  });
  it("should render multiple string qualifiers", () => {
    const expected =
      "**Possible values:** 1 ≤ length ≤ 40, Value must match regular expression `^[a-zA-Z0-9_-]*$`";
    const actual = (0, schema_1.getQualifierMessage)({
      minLength: 1,
      maxLength: 40,
      pattern: "^[a-zA-Z0-9_-]*$",
    });
    expect(actual).toBe(expected);
  });
  //
  // enum
  //
  it("should render enum", () => {
    const expected = "**Possible values:** [`cat`, `dog`, `mouse`]";
    const actual = (0, schema_1.getQualifierMessage)({
      enum: ["cat", "dog", "mouse"],
    });
    expect(actual).toBe(expected);
  });
  //
  // minimum + maximum + exclusiveMinimum + exclusiveMaximum
  //
  it("should render minimum", () => {
    const expected = "**Possible values:** 1 ≤ value";
    const actual = (0, schema_1.getQualifierMessage)({ minimum: 1 });
    expect(actual).toBe(expected);
  });
  it("should render maximum", () => {
    const expected = "**Possible values:** value ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({ maximum: 40 });
    expect(actual).toBe(expected);
  });
  it("should render numeric exclusiveMinimum", () => {
    const expected = "**Possible values:** 1 < value";
    const actual = (0, schema_1.getQualifierMessage)({ exclusiveMinimum: 1 });
    expect(actual).toBe(expected);
  });
  it("should render numeric exclusiveMaximum", () => {
    const expected = "**Possible values:** value < 40";
    const actual = (0, schema_1.getQualifierMessage)({ exclusiveMaximum: 40 });
    expect(actual).toBe(expected);
  });
  it("should render boolean exclusiveMinimum", () => {
    const expected = "**Possible values:** 1 < value";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      exclusiveMinimum: true,
    });
    expect(actual).toBe(expected);
  });
  it("should render boolean exclusiveMaximum", () => {
    const expected = "**Possible values:** value < 40";
    const actual = (0, schema_1.getQualifierMessage)({
      maximum: 40,
      exclusiveMaximum: true,
    });
    expect(actual).toBe(expected);
  });
  it("should render minimum when exclusiveMinimum is false", () => {
    const expected = "**Possible values:** 1 ≤ value";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      exclusiveMinimum: false,
    });
    expect(actual).toBe(expected);
  });
  it("should render maximum when exclusiveMaximum is false", () => {
    const expected = "**Possible values:** value ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({
      maximum: 40,
      exclusiveMaximum: false,
    });
    expect(actual).toBe(expected);
  });
  it("should render minimum and maximum", () => {
    const expected = "**Possible values:** 1 ≤ value ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      maximum: 40,
    });
    expect(actual).toBe(expected);
  });
  it("should render boolean exclusiveMinimum and maximum", () => {
    const expected = "**Possible values:** 1 < value ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      maximum: 40,
      exclusiveMinimum: true,
    });
    expect(actual).toBe(expected);
  });
  it("should render minimum and boolean exclusiveMaximum", () => {
    const expected = "**Possible values:** 1 ≤ value < 40";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      maximum: 40,
      exclusiveMaximum: true,
    });
    expect(actual).toBe(expected);
  });
  it("should render numeric exclusiveMinimum and maximum", () => {
    const expected = "**Possible values:** 1 < value ≤ 40";
    const actual = (0, schema_1.getQualifierMessage)({
      exclusiveMinimum: 1,
      maximum: 40,
    });
    expect(actual).toBe(expected);
  });
  it("should render minimum and numeric exclusiveMaximum", () => {
    const expected = "**Possible values:** 1 ≤ value < 40";
    const actual = (0, schema_1.getQualifierMessage)({
      minimum: 1,
      exclusiveMaximum: 40,
    });
    expect(actual).toBe(expected);
  });
  it("should render numeric exclusiveMinimum and boolean exclusiveMaximum", () => {
    const expected = "**Possible values:** 1 < value < 40";
    const actual = (0, schema_1.getQualifierMessage)({
      exclusiveMinimum: 1,
      maximum: 40,
      exclusiveMaximum: true,
    });
    expect(actual).toBe(expected);
  });
  it("should render nothing with empty boolean exclusiveMinimum", () => {
    const actual = (0, schema_1.getQualifierMessage)({
      exclusiveMinimum: true,
    });
    expect(actual).toBeUndefined();
  });
  it("should render nothing with empty boolean exclusiveMaximum", () => {
    const actual = (0, schema_1.getQualifierMessage)({
      exclusiveMaximum: true,
    });
    expect(actual).toBeUndefined();
  });
  it("should render nothing with empty boolean exclusiveMinimum and exclusiveMaximum", () => {
    const actual = (0, schema_1.getQualifierMessage)({
      exclusiveMinimum: true,
      exclusiveMaximum: true,
    });
    expect(actual).toBeUndefined();
  });
});
