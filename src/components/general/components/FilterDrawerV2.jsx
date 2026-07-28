import { Button, Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { map } from 'lodash';
import { useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import MobileFormDrawer from './MobileFormDrawer';
import { useTranslation } from '@/locales/useTranslation';
import FlexiInput from './FlexiInput';
import { sourceKey } from '@/locales/config';
import moment from 'moment';

const FilterDrawerV2 = (props) => {
    const { setFilterGroup, dataSource, filterGroup } = props;
    const [form] = useForm();
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 650 });

    // Sync form fields with filterGroup changes (e.g., when tags are closed)
    useEffect(() => {
        // Get all field names from dataSource
        const allFieldNames = [];
        dataSource.forEach(item => {
            if (item?.children) {
                item.children.forEach(child => {
                    allFieldNames.push(child.dataIndex);
                });
            } else {
                allFieldNames.push(item.dataIndex);
            }
        });

        // Create form values object - start with all fields as undefined
        const formValues = {};
        allFieldNames.forEach(fieldName => {
            formValues[fieldName] = undefined;
        });

        // Then populate with actual filterGroup values
        if (filterGroup) {
            Object.keys(filterGroup).forEach(key => {
                // Handle createdAtFrom/createdAtTo - convert to array for date picker
                if (key === 'createdAtFrom' && filterGroup.createdAtTo) {
                    formValues.createdAt = [
                        moment(filterGroup.createdAtFrom),
                        moment(filterGroup.createdAtTo)
                    ];
                } else if (key === 'createdDateFrom' && filterGroup.createdDateTo) {
                    formValues.createdDate = [
                        moment(filterGroup.createdDateFrom),
                        moment(filterGroup.createdDateTo)
                    ];
                } else if (key !== 'createdAtFrom' && key !== 'createdAtTo' &&
                    key !== 'createdDateFrom' && key !== 'createdDateTo') {
                    // Regular field - just copy the value
                    formValues[key] = filterGroup[key];
                }
            });
        }

        // Reset form with the new values (this will clear removed fields)
        form.setFieldsValue(formValues);
    }, [filterGroup, dataSource, form]);

    const _renderContent = (
        <Form form={form}>
            <div className="flex flex-col gap-4">
                {map(dataSource, (item, index) => {

                    if (item?.children) {
                        return map(item?.children, (child, childIndex) => (
                            <div key={childIndex}>
                                <div className="mb-1 small-text-size break-words">
                                    {typeof child?.title === 'string' ? child?.title : child?.placeholder}
                                </div>

                                <Form.Item
                                    name={child?.dataIndex}
                                    style={{ margin: 0 }}
                                >
                                    <FlexiInput
                                        inputType={child?.type}
                                        selections={child?.selections || []}
                                        placeholder={typeof child?.title === 'string' ? child?.title : child?.placeholder}
                                        {...child?.filterProps}
                                    />
                                </Form.Item>
                            </div>
                        ));

                    } else {
                        return (
                            <div key={index}>
                                <div className="mb-1 small-text-size break-words">
                                    {typeof item?.title === 'string' ? item?.title : item?.placeholder}
                                </div>

                                <Form.Item
                                    name={item.dataIndex}
                                    style={{ margin: 0 }}
                                >
                                    <FlexiInput
                                        inputType={item?.type}
                                        selections={item?.selections || []}
                                        placeholder={typeof item?.title === 'string' ? item?.title : item?.placeholder}
                                        {...item?.filterProps}
                                    />
                                </Form.Item>
                            </div>
                        )
                    }
                })}
            </div>
        </Form>
    )


    const _renderBottomNavBar = (
        <div className="flex justify between w-full gap-2">
            <Button
                className="grey-btn w-full"
                size="large"
                onClick={() => {
                    form.resetFields();
                    setFilterGroup({});
                    close();
                }}
            >
                {t("reset", sourceKey.user)}
            </Button>
            <Button
                className="blue-btn w-full"
                size="large"
                onClick={() => {
                    handleFilter();
                    close();
                }}
            >
                {t("filter", sourceKey.user)}
            </Button>
        </div>
    )

    function close() {
        if (props.onClose) {
            props.onClose();
        }
    }


    function handleFilter() {
        form.validateFields()
            .then((values) => {
                let updatedValues = Object.fromEntries(
                    Object.entries(values).filter(([_, v]) => v !== undefined && v !== null && v !== '')
                );

                // Handle createdAt date range - convert to createdAtFrom and createdAtTo
                if (
                    updatedValues.createdAt &&
                    Array.isArray(updatedValues.createdAt) &&
                    updatedValues.createdAt.length === 2
                ) {
                    const [startDate, endDate] = updatedValues.createdAt;
                    updatedValues.createdAtFrom = startDate.startOf('day').toDate();
                    updatedValues.createdAtTo = endDate.endOf('day').toDate();
                    delete updatedValues.createdAt; // Remove array format
                }

                // Handle createdDate date range - convert to createdDateFrom and createdDateTo
                if (
                    updatedValues.createdDate &&
                    Array.isArray(updatedValues.createdDate) &&
                    updatedValues.createdDate.length === 2
                ) {
                    const [startDate, endDate] = updatedValues.createdDate;
                    updatedValues.createdDateFrom = startDate.startOf('day').toDate();
                    updatedValues.createdDateTo = endDate.endOf('day').toDate();
                    delete updatedValues.createdDate;
                }
                if (
                    updatedValues.shareAt &&
                    Array.isArray(updatedValues.shareAt) &&
                    updatedValues.shareAt.length === 2
                ) {
                    const [startDate, endDate] = updatedValues.shareAt;
                    updatedValues.shareAtFrom = startDate.startOf('day').toDate();
                    updatedValues.shareAtTo = endDate.endOf('day').toDate();
                    delete updatedValues.shareAt;
                }
                setFilterGroup(updatedValues);
                close();
            })
            .catch((error) => {
                console.error('Validation failed:', error);
            });
    }



    return (
        <>
            <MobileFormDrawer
                closable
                open={props.open}
                onClose={() => close()}
                width={isMobile ? "100%" : "400px"}
                title={t("filter", sourceKey.user)}
                footer={_renderBottomNavBar}
                content={_renderContent}
            />
        </>
    )
}

export default FilterDrawerV2;