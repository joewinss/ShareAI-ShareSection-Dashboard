import React from 'react';
import { Form, Switch } from "antd";
import { isEmpty } from 'lodash';

const SwitchInput = ({
    label,
    fieldName,
    onBlur,
    onChange,
    rules,
    disabled,
    required = true,
    hidden = false,
    extraLabel,
    readOnly,
    checked,
    switchStyle
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
                    {extraLabel && (
                        <div className={`mb-1 blue-text xsmall-text-size ${reserveSpace ? '' : 'mb-1'}`}>
                            {extraLabel}
                        </div>
                    )}
                </>
            )}
            <Form.Item
                name={fieldName}
                initialValue={checked}
                rules={rules}
                valuePropName="checked"
            >
                <Switch
                    id={fieldName}
                    onBlur={onBlur}
                    onChange={onChange}
                    disabled={disabled}
                    checked={checked}
                    readOnly={readOnly}
                    style={switchStyle}
                />
            </Form.Item>
        </div>
    );
};

export default SwitchInput;
