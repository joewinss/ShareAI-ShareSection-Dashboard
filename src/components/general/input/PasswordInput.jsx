import React, { useState, useEffect } from 'react';
import { Form, Input, Space } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';


const PasswordInput = (props) => {
    const {
        label,
        fieldName,
        placeholder,
        maxLength,
        rules,
        iconRender,
        showValidationIndicators,
        onValid,
        onChange,
        style,
        resetTrigger,
    } = props;
    const { t } = useTranslation();
    const [passwordRules, setPasswordRules] = useState({
        hasMinLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    // Reset validation when resetTrigger changes (drawer closes/opens)
    useEffect(() => {
        setPasswordRules({
            hasMinLength: false,
            hasUppercase: false,
            hasNumber: false,
            hasSpecialChar: false
        });

        // Also call onValid with false to reset parent state
        if (onValid) {
            onValid(false);
        }
    }, [resetTrigger]);

    function validatePassword(value) {
        const hasMinLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

        const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

        setPasswordRules({
            hasMinLength: hasMinLength,
            hasUppercase: hasUppercase,
            hasNumber: hasNumber,
            hasSpecialChar: hasSpecialChar
        });

        if (onValid) {
            onValid(isValid)
        }

        return {
            hasMinLength,
            hasUppercase,
            hasNumber,
            hasSpecialChar
        };
    };

    function renderValidationIcon(isValid) {
        return isValid ?
            <CheckCircleFilled className="mr-1" style={{ color: "#52C41A", fontSize: "10px" }} />
            : <CheckCircleFilled className="mr-1" style={{ color: "#CCCCCC", fontSize: "10px" }} />;
    };

    function handlePasswordChange(e) {
        const value = e.target.value;
        validatePassword(value);

        // Call parent onChange if provided
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div>
            <label
                htmlFor={fieldName}
                className="mb-1 required-label small-text-size"
                style={{ color: "#4B5563" }}
            >
                {label}
            </label>
            <Form.Item
                name={fieldName}
                initialValue=""
                rules={rules}
                style={{ margin: 0 }}
            >
                <Input.Password
                    id={fieldName}
                    placeholder={placeholder}
                    className={`input-border lightgrey-input`}
                    autoComplete="new-password"
                    maxLength={maxLength}
                    iconRender={iconRender}
                    onChange={handlePasswordChange}
                />
            </Form.Item>
            {showValidationIndicators && (
                <Space className="font-extralight w-full second-grey-text small-text-size">
                    <div className="grid grid-cols-2 gap-2">
                        <span className="flex items-center">
                            {renderValidationIcon(passwordRules.hasMinLength)}
                            {t("hasMinLength", sourceKey.user)}
                        </span>
                        <span className="flex items-center">
                            {renderValidationIcon(passwordRules.hasUppercase)}
                            {t("hasUppercase", sourceKey.user)}
                        </span>
                        <span className="flex items-center">
                            {renderValidationIcon(passwordRules.hasNumber)}
                            {t("hasNumber", sourceKey.user)}
                        </span>
                        <span className="flex items-center">
                            {renderValidationIcon(passwordRules.hasSpecialChar)}
                            {t("hasSpecialChar", sourceKey.user)}
                        </span>
                    </div>
                </Space>
            )}
        </div >
    );
};

export default PasswordInput;