import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, message, Pagination, Row, Switch, Tabs } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { useForm } from 'antd/lib/form/Form';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import TextAreaInput from '@/components/general/input/TextAreaInput';
import StringInput from '@/components/general/input/StringInput';
import editContent from '@/pages/api/contentGeneration/editContent';
import editContentStatus from '@/pages/api/contentGeneration/editContentStatus';

const EditContentDrawer = (props) => {
    const { selectedRecord, onSuccess, contentType } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = useForm();

    useEffect(() => {
        setOpen(props?.open === true);
        if (!isEmpty(selectedRecord)) {
            // Set form fields for content editing
            form.setFieldsValue({
                contentText: selectedRecord?.contentText || '',
                hashtags: selectedRecord?.hashtags || '',
                style: selectedRecord?.style || '',
                language: selectedRecord?.language || '',
                title: selectedRecord?.title || '',
                location: selectedRecord?.location || '',
            });

        } else {
            form.resetFields();
        }
    }, [props?.open, selectedRecord]);

    async function handleSave() {

        setLoading(true);

        try {
            const values = await form.validateFields();
            const apiData = {
                contentId: selectedRecord._id,
                contentText: values.contentText,
                hashtags: Array.isArray(values.hashtags) ? values.hashtags.join(",") : values.hashtags,
                style: values.style,
                title: values.title,
                location: values.location,
            };

            const isActiveEdit = contentType === "active" // IF is from active, Change to pending then edit then change back to active

            if (isActiveEdit) {
                try {
                    await editContentStatus({
                        contentId: selectedRecord._id,
                        action: "restore",
                    });
                } catch (err) {
                    message.error(err.message);
                }
            }

            const response = await editContent(apiData);
            if (response?.data?.success) {
                message.success(response.data?.message || 'Content updated successfully');
            }

            if (isActiveEdit) {
                try {
                    await editContentStatus({
                        contentId: selectedRecord._id,
                        action: "approve",
                        imageUrls: selectedRecord?.imageUrls,
                    });
                } catch (err) {
                    message.error(err.message);
                }
            }

            onClose();
            if (props.onRefreshData) {
                props.onRefreshData();
            }
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error('Error updating content:', err);
            message.error(err?.message || 'Error updating content');
        } finally {
            setLoading(false);
        }
    }

    function onClose() {
        setOpen(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    return (
        <>
            <MobileFormDrawer
                closable={true}
                onClose={onClose}
                open={open}
                width={"360px"}
                zIndex={1200}
                title={!isEmpty(selectedRecord)
                    ? t("editContent", sourceKey.user) || "Edit Content"
                    : t("addContent", sourceKey.user) || "Add Content"}
                footer={
                    <div className="flex flex-col">
                        <Button
                            loading={loading}
                            className={`w-full blue-btn `}
                            size="large"
                            onClick={() => handleSave()}
                        >
                            {t("confirm", sourceKey.user)}
                        </Button>
                    </div>
                }
            >
                <Form form={form}>
                    {/* Content Fields */}
                    <StringInput
                        label={t("title", sourceKey.user) || "Title"}
                        fieldName="title"
                        placeholder="title"
                    />

                    <TextAreaInput
                        label={t("content", sourceKey.user) || "Content"}
                        fieldName="contentText"
                        rows={6}
                        placeholder={t("content", sourceKey.user) || "Enter content text..."}
                    />

                    <StringInput
                        label={t("location", sourceKey.user) || "Location"}
                        fieldName="location"
                        placeholder="location"
                    />

                    <TextAreaInput
                        label={t("hashtags", sourceKey.user) || "Hashtags"}
                        fieldName="hashtags"
                        placeholder="#hashtag1 #hashtag2"
                    />


                    {/* <StringInput
                        label={t("hashtags", sourceKey.user) || "Hashtags"}
                        fieldName="hashtags"
                        placeholder="#hashtag1 #hashtag2"
                    />

                    <DropdownInput
                        label={t("style", sourceKey.user) || "Style"}
                        fieldName="style"
                        options={[
                            { title: t("pro", sourceKey.user) || "Pro", value: "pro" },
                            { title: t("cute", sourceKey.user) || "Cute", value: "cute" },
                            { title: t("joke", sourceKey.user) || "Joke", value: "joke" },
                            { title: t("friendly", sourceKey.user) || "Friendly", value: "friendly" },
                        ]}
                        placeholder={t("selectStyle", sourceKey.user) || "Select style"}
                    />

                    <DropdownInput
                        label={t("language", sourceKey.user) || "Language"}
                        fieldName="language"
                        options={[
                            { title: "English", value: "English" },
                            { title: "Chinese", value: "Chinese" },
                            { title: "Malay", value: "Malay" },
                        ]}
                        placeholder={t("selectLanguage", sourceKey.user) || "Select language"}
                    /> */}
                </Form>
            </MobileFormDrawer>
        </>
    );
};

const mapStateToProps = (state) => ({
})
const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditContentDrawer))