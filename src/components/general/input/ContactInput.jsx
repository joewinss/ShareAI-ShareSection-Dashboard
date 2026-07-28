import React, { useEffect, useState } from 'react';
import { Form, Input, Select } from "antd";
import countryCodes from "country-codes-list";
import { useTranslation } from '@/locales/useTranslation';


const ContactInput = ({
    label,
    fieldName,
    placeholder,
    placeholderInput,
    onBlur,
    rules,
    rulesCode,
    extraLabel
}) => {
    const { t } = useTranslation();
    const [isWindows, setIsWindows] = useState(false);
    const { Option } = Select;

    const countryCodesList = Object.entries(countryCodes.customList("countryNameEn", "[{countryCode}] {flag} +{countryCallingCode}")).map(([code, label]) => {
        const parts = label.split(" ");
        const countryCode = parts[0].slice(1, -1);
        const flag = parts[1];
        const name = code;
        const countryCallingCode = `+${parts[2].slice(1)}`;
        const combinedValue = `${name} ${countryCallingCode}`;

        return {
            code,
            countryCode,
            flag,
            name,
            countryCallingCode,
            combinedValue

        };
    });

    const countryCodesList2 = Object.entries(countryCodes.customList("countryNameEn", "[{countryCode}] {countryNameEn} +{countryCallingCode}")).map(([code, label]) => {
        const parts = label.split(" ");
        const countryCode = parts[0].slice(1, -1);
        const name = code;
        const countryCallingCode = `+${parts[parts.length - 1].slice(1)}`;;
        const combinedValue = `${name} ${countryCallingCode}`;
        return {
            code,
            countryCode,
            name,
            countryCallingCode,
            combinedValue
        };
    });


    useEffect(() => {
        setIsWindows(navigator.platform.toUpperCase().includes("WIN"));
    }, []);

    return (
        <div>
            <label
                htmlFor={fieldName}
                className="mb-1 required-label small-text-size"
                style={{ color: "#37333480" }}
            >
                {label}
            </label>

            {extraLabel && (
                <div className="mb-1 blue-text xsmall-text-size">
                    {extraLabel}
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1">
                    <Form.Item
                        name={`${fieldName}CountryCode`}
                        rules={rulesCode}
                    >
                        <Select
                            className="lightgrey-select"
                            autoComplete="off"
                            showSearch
                            placeholder={placeholder}
                            filterOption={(input, option) => {
                                const { value, key, children } = option;
                                const searchValue = input.toLowerCase();
                                const optionValue = value?.toString().toLowerCase();
                                const optionKey = key?.toString().toLowerCase();
                                const optionLabel = children?.toString().toLowerCase();

                                return (
                                    optionValue.includes(searchValue) ||
                                    optionKey.includes(searchValue) ||
                                    optionLabel.includes(searchValue)
                                );
                            }}
                        >
                            {isWindows ? (
                                countryCodesList2.map(({ code, countryCode, name, countryCallingCode, combinedValue }) => (
                                    <Option key={code} value={countryCallingCode}>
                                        [{countryCode}] {name} {countryCallingCode}
                                    </Option>
                                ))
                            ) : (
                                countryCodesList.map(({ code, countryCode, flag, name, countryCallingCode, combinedValue }) => (
                                    <Option key={code} value={countryCallingCode}>
                                        [{countryCode}] {flag} {countryCallingCode}
                                    </Option>
                                ))
                            )}
                        </Select>
                    </Form.Item>
                </div>
                <div className="col-span-1">
                    <Form.Item
                        name={fieldName}
                        rules={rules}
                    >
                        <Input
                            placeholder={placeholderInput}
                            className={"input-border"}
                            onBlur={onBlur}
                            onKeyDown={(e) => {
                                // Allow: backspace, delete, tab, escape, enter
                                if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) ||
                                    // Allow: Ctrl+A/Ctrl+C/Ctrl+V/Ctrl+X
                                    (e.key === "a" && e.ctrlKey === true) ||
                                    (e.key === "c" && e.ctrlKey === true) ||
                                    (e.key === "v" && e.ctrlKey === true) ||
                                    (e.key === "x" && e.ctrlKey === true) ||
                                    // Allow: home, end, left, right, down, up
                                    (e.key === "Home" || e.key === "End" || e.key === "ArrowLeft" || e.key === "ArrowRight" ||
                                        e.key === "ArrowDown" || e.key === "ArrowUp")) {
                                    // Let it happen, don't do anything
                                    return;
                                }
                                // Ensure that it is a number and stop the keypress
                                if ((e.key === "Shift" || (e.key < "0" || e.key > "9")) &&
                                    (e.code < "Numpad0" || e.code > "Numpad9")) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                </div>
            </div>
        </div >
    );
};

export default ContactInput;