import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, message, Radio, Rate, Row, Select, Slider, Switch, TimePicker, Upload } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { filter, forEach, get, isArray, isNil, isObject, isString, map, omitBy, set } from 'lodash';
import React, { useEffect, useState } from 'react';
import { inputTypes } from '@/utility/config';


const ICON_SIZE = 18
//Able to filter, display, sort, custom action
function FlexiInput(props) {

    function defaultInput(propsToProcess) {

        let { name, title, inputType = 'text', selections, ...inputProps } = propsToProcess

        let input = null;
        if (isArray(selections)) {
            selections = map(selections, (selection) => {
                let value = !isObject(selection) ? selection : get(selection, 'value');
                let title = !isObject(selection) ? selection : get(selection, 'title');
                return {
                    ...selection,
                    value,
                    title,
                }
            })
        }
        switch (inputType) {
            case inputTypes.text:
                input = <Input placeholder={title} {...inputProps} />
                break;
            case inputTypes.textarea:
                input = <TextArea placeholder={title} {...inputProps} />
                break;
            case inputTypes.password:
                input = <Input.Password placeholder={title} {...inputProps} />
                break;
            case inputTypes.number:
                input = <InputNumber style={{ width: '100%' }} placeholder={title} defaultValue={get(inputProps, 'defaultValue')} {...inputProps} />
                break;
            case inputTypes.rate:
                input = <Rate {...inputProps} />
                break;
            case inputTypes.slider:
                if (isArray(selections)) {
                    let marks = {};
                    forEach(selections, (selection, index) => {
                        marks[index * (100 / selections.length)] = {
                            label: get(selection, 'title')
                        };
                    })
                    input = (
                        <Slider marks={marks} {...inputProps}>
                        </Slider>
                    )
                }
                break;
            case inputTypes.radio:
                if (isArray(selections)) {
                    input = (
                        <Radio.Group {...inputProps}>
                            <div className="flex justify-start items-center flex-wrap">
                                {
                                    map(selections, (selection) => {
                                        return <Radio value={get(selection, 'value')} className="shrink-0" {...(get(selection, 'selectionProps'))} >{get(selection, 'title') || get(selection, 'value')}</Radio>
                                    })
                                }
                            </div>
                        </Radio.Group>
                    )
                }
                break;
            case inputTypes.radioButton:
                if (isArray(selections)) {
                    input = (
                        <Radio.Group {...inputProps}>
                            {
                                map(selections, (selection) => {
                                    return <Radio.Button value={get(selection, 'value')} className="shrink-0" {...(get(selection, 'selectionProps'))} >{get(selection, 'title') || get(selection, 'value')}</Radio.Button>
                                })
                            }
                        </Radio.Group>
                    )
                }
                break;
            case inputTypes.checkbox:
                if (isArray(selections)) {
                    input = (
                        <Checkbox.Group {...inputProps}>
                            <div className="flex justify-start items-center flex-wrap">
                                {
                                    map(selections, (selection) => {
                                        return <Checkbox value={get(selection, 'value')} className="shrink-0" {...(get(selection, 'selectionProps'))} >{get(selection, 'title') || get(selection, 'value')}</Checkbox>
                                    })
                                }
                            </div>
                        </Checkbox.Group>
                    )
                }
                break;
            case inputTypes.dropdown:
                if (isArray(selections)) {
                    input = (
                        <Select
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            {...inputProps}
                        >
                            {
                                map(selections, (selection) => {
                                    return <Select.Option value={get(selection, 'value')} className="shrink-0" {...(get(selection, 'selectionProps'))} >{get(selection, 'title') || get(selection, 'value')}</Select.Option>
                                })
                            }
                        </Select>
                    )
                }
                break;
            case inputTypes.switch:
                input = <Switch {...inputProps} />
                break;
            case inputTypes.date:
                input = <DatePicker {...inputProps} />
                break;
            case inputTypes.dateTime:
                input = <DatePicker style={{ width: '100%' }} showTime  {...inputProps} />
                break;
            case inputTypes.month:
                input = <DatePicker picker="month"  {...inputProps} />
                break;
            case inputTypes.dateRange:
                delete inputProps.placeholder
                input = <DatePicker.RangePicker style={{ width: '100%' }} {...inputProps} />
                break;
            case inputTypes.time:
                input = <TimePicker style={{ width: '100%' }}   {...inputProps} />
                break;
            case inputTypes.timeRange:
                delete inputProps.placeholder
                input = <TimePicker.RangePicker style={{ width: '100%' }}  {...inputProps} />
                break;
            case inputTypes.upload:
                input = <Upload {...inputProps} >
                    <Button icon={<UploadOutlined />}>{t('uploadText')}</Button>
                </Upload>
                break;
            case inputTypes.dragUpload:
                input = <Upload.Dragger {...inputProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t('dragUploadText')}</p>
                </Upload.Dragger>
                break;
            default:
                input = <Input placeholder={title} {...inputProps} />
                break;
        }

        return input
    }

    return defaultInput(props)
}

export default FlexiInput;