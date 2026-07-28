import { Select } from "antd";
import { LucideIcon, LUCIDE_ICON_OPTIONS } from "@/lib/iconLibrary/lucideDynamicIcon";

const IconPickerInput = ({
    value,
    onChange,
    disabled,
    size,
    style,
    placeholder = "Icon",
    allowClear = true,
    options = LUCIDE_ICON_OPTIONS,
}) => {
    const selectOptions = options.map((option) => ({ value: option.value, label: option.title }));

    return (
        <Select
            placeholder={placeholder}
            value={value || undefined}
            onChange={onChange}
            disabled={disabled}
            size={size}
            allowClear={allowClear}
            style={style}
            showSearch
            optionFilterProp="label"
            options={selectOptions}
            optionRender={(option) => (
                <div className="flex items-center gap-2">
                    <LucideIcon name={option.data.value} size={14} />
                    <span>{option.data.label}</span>
                </div>
            )}
            labelRender={(props) =>
                props.value ? (
                    <div className="flex items-center gap-2">
                        <LucideIcon name={props.value} size={14} />
                        <span>{props.label}</span>
                    </div>
                ) : (
                    props.label
                )
            }
        />
    );
};

export default IconPickerInput;
