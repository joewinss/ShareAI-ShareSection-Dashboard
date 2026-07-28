import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, message } from "antd";
import { isEmpty } from "lodash";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import DropdownInput from "@/components/general/input/DropdownInput";
import updateAutoMode from "@/pages/api/content/updateAutoMode";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import {
  getLanguageOptions,
  getRoleOptions,
} from "@/constants/autoGenMode";

const EDITABLE_NUMBER_OPTIONS = [10, 20];

const AutoModeEditDrawer = (props) => {
  const { selectedRecord, onRefreshData } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const languageOptions = useMemo(() => getLanguageOptions(t), [t]);
  const roleOptions = useMemo(() => getRoleOptions(t), [t]);
  const numberOptions = useMemo(
    () =>
      EDITABLE_NUMBER_OPTIONS.map((value) => ({
        title: String(value),
        value,
      })),
    []
  );

  useEffect(() => {
    const isOpen = props?.open === true;
    setOpen(isOpen);

    if (isOpen && !isEmpty(selectedRecord)) {
      form.setFieldsValue({
        threshold: Number(selectedRecord?.threshold),
        generationCount: Number(selectedRecord?.generationCount),
        language: selectedRecord?.language,
        roleWriter: selectedRecord?.roleWriter,
      });
      return;
    }

    if (isOpen) {
      form.resetFields();
    }
  }, [props?.open, selectedRecord, form]);

  const normalizeString = (value) =>
    typeof value === "string" ? value.trim() : value;

  const normalizeOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  function onClose() {
    setOpen(false);
    form.resetFields();
    if (props.onClose) {
      props.onClose();
    }
  }

  async function handleSave() {
    if (isEmpty(selectedRecord) || !selectedRecord?._id) {
      return;
    }

    setLoading(true);
    try {
      const values = await form.validateFields();
      const updates = {};

      const threshold = normalizeOptionalNumber(values?.threshold);
      const generationCount = normalizeOptionalNumber(values?.generationCount);
      const language = normalizeString(values?.language);
      const roleWriter = normalizeString(values?.roleWriter);

      if (
        threshold !== undefined &&
        threshold !== Number(selectedRecord?.threshold)
      ) {
        updates.threshold = threshold;
      }

      if (
        generationCount !== undefined &&
        generationCount !== Number(selectedRecord?.generationCount)
      ) {
        updates.generationCount = generationCount;
      }

      if (language !== selectedRecord?.language) {
        updates.language = language;
      }

      if (roleWriter !== selectedRecord?.roleWriter) {
        updates.roleWriter = roleWriter;
      }

      if (Object.keys(updates).length === 0) {
        message.info(t("noAutoModeChanges", sourceKey.user));
        return;
      }

      const response = await updateAutoMode({
        autoModeId: selectedRecord?._id,
        ...updates,
      });

      message.success(
        response?.data?.message || t("editAutoModeSuccess", sourceKey.user)
      );
      onClose();
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      if (Array.isArray(err?.errorFields)) {
        return;
      }
      console.error(err);
      message.error(err?.message || t("editAutoModeFailed", sourceKey.user));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileFormDrawer
      closable={true}
      onClose={onClose}
      open={open}
      width={"360px"}
      zIndex={1300}
      loading={loading}
      title={t("editAutoMode", sourceKey.user)}
      footer={
        <div className="flex flex-col">
          <Button
            loading={loading}
            className="w-full blue-btn"
            size="large"
            onClick={handleSave}
          >
            {t("confirm", sourceKey.user)}
          </Button>
        </div>
      }
    >
      <Form form={form}>
        <DropdownInput
          label="Trigger Threshold"
          fieldName="threshold"
          required={false}
          options={numberOptions}
          placeholder="10 / 20"
        />

        <DropdownInput
          label="Auto-Gen Count"
          fieldName="generationCount"
          required={false}
          options={numberOptions}
          placeholder="10 / 20"
        />

        <DropdownInput
          label={t("language", sourceKey.user)}
          fieldName="language"
          required={false}
          options={languageOptions}
          placeholder={t("language", sourceKey.user)}
        />

        <DropdownInput
          label="Role"
          fieldName="roleWriter"
          required={false}
          options={roleOptions}
          placeholder="Role"
        />
      </Form>
    </MobileFormDrawer>
  );
};

export default AutoModeEditDrawer;
