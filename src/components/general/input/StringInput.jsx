import React from 'react';
import { Form, Input } from "antd";
import { isEmpty } from 'lodash';

const StringInput = ({
    label,
    fieldName,
    placeholder,
    maxLength,
    onBlur,
    onChange,
    rules,
    disabled,
    suffix,
    required = true,
    hidden = false,
    extraLabel,
    readOnly,
    style,
    lightgrey,
    onKeyPress,
    reserveSpace = false,
    inputClassName,
    value
}) => {
    return (
        <div style={{ display: hidden ? 'none' : 'block' }}>
            {!hidden && (
                <>
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
                </>
            )}
            <Form.Item
                name={fieldName}
                // initialValue=""
                rules={rules}
                style={style}
            >
                <Input
                    id={fieldName}
                    placeholder={placeholder}
                    className={`${lightgrey ? "input-border lightgrey-input" : "input-border"}${inputClassName ? ` ${inputClassName}` : ""}`}
                    autoComplete="off"
                    onBlur={onBlur}
                    maxLength={maxLength}
                    onChange={onChange}
                    disabled={disabled}
                    suffix={suffix}
                    hidden={hidden}
                    readOnly={readOnly}
                    onKeyUp={onKeyPress}
                    value={value}
                />
            </Form.Item>
        </div>
    );
};

export default StringInput;
