import React from 'react';
import { Form, Input } from "antd";

const { TextArea } = Input;

const TextAreaInput = ({
    label,
    fieldName,
    placeholder,
    maxLength,
    onBlur,
    onChange,
    rules,
    disabled,
    required = true,
    rows = 4,
    extraLabel,
    reserveSpace = false,
    inputClassName
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
                    className={`mb-1 blue-text xsmall-text-size ${reserveSpace ? '' : 'mb-1'}`}
                    style={reserveSpace ? { minHeight: '3rem', display: 'flex', alignItems: 'start' } : {}}
                >
                    {extraLabel || (reserveSpace ? '\u00A0' : '')}
                </div>
            )}

            <Form.Item
                name={fieldName}
                // initialValue=""
                rules={rules}
            >
                <TextArea
                    id={fieldName}
                    placeholder={placeholder}
                    className={`input-border${inputClassName ? ` ${inputClassName}` : ""}`}
                    autoComplete="off"
                    onBlur={onBlur}
                    maxLength={maxLength}
                    onChange={onChange}
                    disabled={disabled}
                    rows={rows}
                />
            </Form.Item>
        </div>
    );
};

export default TextAreaInput;
