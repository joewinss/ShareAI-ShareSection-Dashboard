import React, { useEffect } from "react";
import { Form } from "antd";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";

const AUTO_MODE_OPTION_VALUES = [10, 20];

const AutoModeRulesModal = ({
  open = false,
  loading = false,
  onClose,
  onSubmit,
  modalWidth,
  collapsed = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        threshold: 10,
        generationCount: 20,
      });
    }
  }, [open, form]);

  const validateOptionValue = (label) => (_, value) => {
    if (value === undefined || value === null || value === "") {
      return Promise.reject(new Error(`${label} is required.`));
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue)) {
      return Promise.reject(new Error(`${label} must be a number.`));
    }

    if (!AUTO_MODE_OPTION_VALUES.includes(parsedValue)) {
      return Promise.reject(
        new Error(`${label} must be either 10 or 20.`)
      );
    }

    return Promise.resolve();
  };

  const thresholdRules = [
    {
      validator: validateOptionValue("Trigger threshold"),
    },
  ];

  const generationCountRules = [
    {
      validator: validateOptionValue("Generation count"),
    },
  ];

  const handleClose = () => {
    if (loading) {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(["threshold", "generationCount"]);

      if (onSubmit) {
        onSubmit({
          threshold: Number(values.threshold),
          generationCount: Number(values.generationCount),
        });
      }
    } catch (error) {
      console.error("Auto mode form validation failed", error);
    }
  };

  return (
    <SinglePopUpModal
      type="AutoModeSetup"
      open={open}
      closeable
      modalLoading={loading}
      modalWidth={modalWidth}
      form={form}
      extraData={{
        thresholdRules,
        generationCountRules,
        isCollapsed: collapsed,
      }}
      onClose={handleClose}
      confirmBtn1={handleClose}
      confirmBtn2={handleSubmit}
    />
  );
};

export default AutoModeRulesModal;
