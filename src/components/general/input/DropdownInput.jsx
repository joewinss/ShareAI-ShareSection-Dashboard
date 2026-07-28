import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { Form, Select } from "antd";
import { map } from "lodash";
import React, { useState } from 'react';

const getNodeText = (node) => {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getNodeText).join('');
    if (React.isValidElement(node)) return getNodeText(node.props?.children);
    return '';
};

const DropdownInput = ({
    label,
    fieldName,
    placeholder,
    options,
    rules,
    onChange,
    disabled,
    required = true,
    style,
    mode,
    onSearch,
    extraLabel,
    reserveSpace = false,
    selectClassName,
    multipleAll = false,
    allowCustom = false,
    isSort = false
}) => {
    const { Option } = Select;
    const form = Form.useFormInstance();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(null);

    // Internal change handler to manage "Select All" logic
    const handleChange = (value) => {
        let finalValue = value;

        // If allowCustom is true, we use 'tags' mode. 
        // We take the last item in the array to ensure it acts as a single-select.
        if (allowCustom && Array.isArray(value)) {
            // Pick the latest value only
            finalValue = value.length > 0 ? value[value.length - 1] : undefined;
            form.setFieldsValue({ [fieldName]: finalValue });

            // Force the dropdown to close after selection
            setIsOpen(false);
        }
        // Logic for "Select All" (only applies if mode is multiple)
        if (multipleAll && mode === 'multiple' && Array.isArray(finalValue) && finalValue.includes('ALL_OPTIONS')) {
            const allValues = options.map(opt => opt.value);
            form.setFieldsValue({ [fieldName]: allValues });
            if (onChange) onChange(allValues);
        } else if (multipleAll && mode === 'multiple' && Array.isArray(finalValue) && finalValue.includes('DESELECT_ALL')) {
            form.setFieldsValue({ [fieldName]: [] });
            if (onChange) onChange([]);
            return;
        } else {
            if (onChange) onChange(finalValue);
        }
    };

    // Prepare options: Add "All" at the top if multipleAll is true
    const processedOptions = isSort
        ? [...(options || [])].sort((a, b) => {
            const titleA = typeof a.title === 'string' ? a.title : (String(a.value) || '');
            const titleB = typeof b.title === 'string' ? b.title : (String(b.value) || '');
            return titleA.localeCompare(titleB);
        })
        : (options || []);

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
                rules={rules}
                style={style}
            >
                <Select
                    className={`lightgrey-select${selectClassName ? ` ${selectClassName}` : ""}`}
                    autoComplete="off"
                    showSearch
                    placeholder={placeholder}
                    onChange={handleChange} // Use internal handler
                    disabled={disabled}
                    mode={mode}
                    onSearch={onSearch}
                    open={isOpen}
                    onDropdownVisibleChange={(open) => setIsOpen(open)}
                    maxTagCount={allowCustom ? 1 : undefined}
                    filterOption={(input, option) =>
                        getNodeText(option?.children || option?.value)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                >
                    {/* Render "All" option at the top if enabled */}
                    {multipleAll && mode === 'multiple' && (
                        <Option key="all" value="ALL_OPTIONS" style={{ borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>
                            {t("nTselectAll", sourceKey.user)}
                        </Option>
                    )}

                    {/* Render "Deselect All" option */}
                    {multipleAll && mode === 'multiple' && (
                        <Option key="deselect-all" value="DESELECT_ALL" style={{ borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>
                            {t("nTdeselectAll", sourceKey.user)}
                        </Option>
                    )}

                    {map(processedOptions, (item, i) => (
                        <Option key={i} value={item.value}>
                            {item.title}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </div>
    );
};

export default DropdownInput;