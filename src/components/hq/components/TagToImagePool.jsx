import React, { useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import getPresetContent from "@/pages/api/contentPreset/getPresetContent";
import editImagePool from "@/pages/api/imagePool/editImagePool";
import { PRESET_STATUS } from "@/constants/user";

const TagToImagePool = ({ selectedImage = [], onClose, onComplete }) => {
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [presetRecords, setPresetRecords] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const presetOptions = useMemo(
    () =>
      presetRecords.map((preset) => ({
        title: preset?.presetName,
        value: preset?.productId,
      })),
    [presetRecords]
  );

  useEffect(() => {
    if (selectedImage.length > 0) {
      setShowSelectedModal(true);
    } else {
      setShowSelectedModal(false);
    }
  }, [selectedImage.length]);

  useEffect(() => {
    if (showPresetModal) {
      setPresetLoading(true);
      getPresetContent("all", 0, { status: PRESET_STATUS.ACTIVE })
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          setPresetRecords(list);
        })
        .catch((err) => {
          console.error("Failed to load preset templates", err);
          message.error(err?.message || "Failed to load preset templates");
        })
        .finally(() => setPresetLoading(false));
    }
  }, [showPresetModal]);

  const handleCloseAll = () => {
    setShowSelectedModal(false);
    setShowPresetModal(false);
    if (onClose) onClose();
  };

  const handleAddMore = () => {
    setShowSelectedModal(false);
    if (onClose) onClose();
  };

  const handleOpenPresetModal = () => {
    setShowSelectedModal(false);
    setShowPresetModal(true);
  };

  const handlePresetChange = (value) => {
    setSelectedPresetId(value);
    form.setFieldsValue({ presetId: value });
    const record = presetRecords.find(
      (preset) => (preset?.productId) === value
    );
    setSelectedPreset(record || null);
  };

  const handleConfirmAdd = async () => {
    if (!selectedPreset) {
      message.error("Please select a preset template");
      return;
    }
    if (!selectedImage.length) {
      message.error("No images selected");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        action: "add",
        imageUrls: selectedImage,
        outletUserId: "",
        productId: selectedPreset?.productId,
        productName: selectedPreset?.productName,
      };
      const response = await editImagePool(payload);
      if (response?.data?.success) {
        message.success(response?.data?.message || "Images added to image pool");
        setSelectedPreset(null);
        setSelectedPresetId(null);
        handleCloseAll();
        if (onComplete) onComplete();
      } else {
        throw new Error(response?.data?.message || "Failed to add images");
      }
    } catch (err) {
      console.error("Failed to add images to image pool", err);
      message.error(err?.message || "Failed to add images");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SinglePopUpModal
        type="ShowSelectedVIsual"
        open={showSelectedModal}
        closeable
        extraData={{ items: selectedImage }}
        onClose={handleCloseAll}
        confirmBtn1={handleAddMore}
        confirmBtn2={handleOpenPresetModal}
      />
      <SinglePopUpModal
        type="AddVisualtoImagePool"
        open={showPresetModal}
        closeable
        modalLoading={saving}
        form={form}
        extraData={{
          options: presetOptions,
          loading: presetLoading,
          selectedPresetId,
          onPresetChange: handlePresetChange,
        }}
        onClose={handleCloseAll}
        confirmBtn1={handleConfirmAdd}
      />
    </>
  );
};

export default TagToImagePool;
