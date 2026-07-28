import React from "react";
import { Form, Input } from "antd";
const NumberInput = ({
  label,
  fieldName,
  placeholder,
  maxLength,
  onBlur,
  rules,
  style,
  prefix,
  suffix,
  onChange,
  required = true,
  extraLabel,
  decimalNumber = false,
  disabled,
  addonBefore,
  reserveSpace = false,
}) => {
  return (
    <div>
      <label
        htmlFor={fieldName}
        className={`mb-1 ${required && "required-label"} small-text-size`}
        style={{ color: "#37333480" }}
      >
        {label}
      </label>

      {(extraLabel || reserveSpace) && (
        <div
          className={`mb-1 blue-text xsmall-text-size ${
            reserveSpace ? "" : "mb-1"
          }`}
          style={
            reserveSpace
              ? { minHeight: "3rem", display: "flex", alignItems: "start" }
              : {}
          }
        >
          {extraLabel || (reserveSpace ? "\u00A0" : "")}
        </div>
      )}

      <Form.Item name={fieldName} rules={rules} style={style}>
        <Input
          id={fieldName}
          placeholder={placeholder}
          className={"input-border"}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          onChange={onChange}
          addonBefore={addonBefore}
          suffix={suffix}
          prefix={prefix}
          onKeyDown={(e) => {
            // Allow: backspace, delete, tab, escape, enter
            if (
              ["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(
                e.key
              ) ||
              // Allow: Ctrl+A/Ctrl+C/Ctrl+V/Ctrl+X
              (e.key === "a" && (e.ctrlKey || e.metaKey) === true) ||
              (e.key === "c" && (e.ctrlKey || e.metaKey) === true) ||
              (e.key === "v" && (e.ctrlKey || e.metaKey) === true) ||
              (e.key === "x" && (e.ctrlKey || e.metaKey) === true) ||
              // Allow: home, end, left, right, down, up
              e.key === "Home" ||
              e.key === "End" ||
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight" ||
              e.key === "ArrowDown" ||
              e.key === "ArrowUp"
            ) {
              // Let it happen, don't do anything
              return;
            }
            // Allow decimal point if props.decimalNumber is true
            if (decimalNumber) {
              if (e.key === "." && e.target.value.includes(".")) {
                // Prevent more than one decimal point
                e.preventDefault();
              }
            }
            // Ensure that it is a number (with or without decimal) and stop the keypress
            if (
              (e.key === "Shift" || e.key < "0" || e.key > "9") &&
              (e.code < "Numpad0" || e.code > "Numpad9") &&
              e.key !== "."
            ) {
              e.preventDefault();
            }
          }}
        />
      </Form.Item>
    </div>
  );
};

export default NumberInput;
