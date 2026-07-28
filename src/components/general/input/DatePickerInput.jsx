import React from "react";
import { DatePicker, Form } from "antd";

const DatePickerInput = ({
  label,
  fieldName,
  onChange,
  rules,
  required,
  disabledDate,
}) => {
  function handleInputChange(dates, dateStrings) {
    if (onChange) {
      onChange(dates, dateStrings);
    }
  }

  return (
    <div>
      <label
        htmlFor={fieldName}
        className={`mb-1 ${required && "required-label"} `}
        style={{ color: "#00000080", fontSize: "11px" }}
      >
        {label}
      </label>
      <Form.Item name={fieldName} rules={rules}>
        <DatePicker
          id={fieldName}
          style={{ width: "100%" }}
          className={`lightgrey-picker`}
          onChange={handleInputChange}
          disabledDate={disabledDate}
        />
      </Form.Item>
    </div>
  );
};

export default DatePickerInput;
