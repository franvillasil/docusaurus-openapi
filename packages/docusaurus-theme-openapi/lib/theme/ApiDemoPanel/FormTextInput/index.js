"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _stylesModule = _interopRequireDefault(require("./styles.module.css"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
function FormTextInput({ value, placeholder, password, onChange }) {
  return (
    <input
      className={_stylesModule.default.input}
      type={password ? "password" : "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

var _default = FormTextInput;
exports.default = _default;
