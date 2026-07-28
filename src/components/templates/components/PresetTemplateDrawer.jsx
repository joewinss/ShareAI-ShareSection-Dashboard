import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Tooltip,
} from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { useForm } from "antd/lib/form/Form";
import { isEmpty } from "lodash";
import { connect } from "react-redux";
import { useRouter, withRouter } from "next/router";
import { useFormRules } from "@/constant/formRules";
import DropdownInput from "@/components/general/input/DropdownInput";
import StringInput from "@/components/general/input/StringInput";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import createPresetContent from "@/pages/api/contentPreset/createPresetContent";
import editPresetContent from "@/pages/api/contentPreset/editPresetContent";
import SwitchInput from "@/components/general/input/SwitchInput";
import NumberInput from "@/components/general/input/NumberInput";
import { PRESET_STATUS, USER_STATUS } from "@/constants/user";
import { MEDIA_TYPE, isVideoMedia } from "@/constants/mediaType";
import { trimIfString } from "@/utility/common-functions";
import { mapOutletOptions } from "@/utility/option-mappers";
import getCategory from "@/pages/api/category/getCategory";
import { CONTENT_STATUS } from "@/constant/template";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TooltipImageCategory, TooltipImageProduct } from "../../../../public/assets";

const PresetTemplateDrawer = (props) => {
  const { selectedRecord, user } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const formRules = useFormRules(t, sourceKey);
  const [categoryOption, setCategoryOption] = useState([]);
  const [outletOption, setOutletOption] = useState([]);
  const isEditing = !isEmpty(selectedRecord);
  const isVideo = Form.useWatch('mediaTypeSwitch', form);

  function handleSave() {
    setLoading(true);

    form
      .validateFields()
      .then((values) => {
        const mediaType = values.mediaTypeSwitch ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE;
        if (isEditing) {
          const apiData = {
            ...values,
            // location: user?.user?.businessInfo?.businessAddress?.address || "Worldwide",
            presetId: selectedRecord._id,
            presetName: trimIfString(values.presetName),
            productName: trimIfString(values.productName),
            promotion: trimIfString(values.promotion),
            sellingHighlight: trimIfString(values.sellingHighlight),
            status: values.status ? PRESET_STATUS.ACTIVE : PRESET_STATUS.INACTIVE,
            mediaType,
          };
          delete apiData.mediaTypeSwitch;

          return editPresetContent(apiData);
        } else {
          const apiData = {
            ...values,
            // location: user?.user?.businessInfo?.businessAddress?.address || "Worldwide",
            presetName: trimIfString(values.presetName),
            promotion: trimIfString(values.promotion),
            productName: trimIfString(values.productName),
            sellingHighlight: trimIfString(values.sellingHighlight),
            status: values.status
              ? PRESET_STATUS.ACTIVE
              : PRESET_STATUS.INACTIVE,
            mediaType,
          };
          delete apiData.mediaTypeSwitch;
          return createPresetContent(apiData);
        }
      })
      .then((response) => {
        if (response) {
          message.success(
            response.data?.message || t("success", sourceKey.user)
          );
        }
        setLoading(false);
        onClose();
        props.onRefreshData();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
      });
  }

  function handleSaveAndAddImage() {
    if (isEditing) return;
    let submittedValues = null;
    setLoading(true);

    form
      .validateFields()
      .then((values) => {
        submittedValues = values;
        const apiData = {
          ...values,
          // location: user?.user?.businessInfo?.businessAddress?.address || "Worldwide",
          presetName: trimIfString(values.presetName),
          promotion: trimIfString(values.promotion),
          productName: trimIfString(values.productName),
          sellingHighlight: trimIfString(values.sellingHighlight),
          status: values.status
            ? PRESET_STATUS.ACTIVE
            : PRESET_STATUS.INACTIVE,
          mediaType: values.mediaTypeSwitch ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE,
        };
        delete apiData.mediaTypeSwitch;
        return createPresetContent(apiData);
      })
      .then((response) => {
        if (response) {
          message.success(
            response.data?.message || t("success", sourceKey.user)
          );
        }
        setLoading(false);
        onClose();
        props.onRefreshData();
        const createdPreset = response?.data?.data || response?.data;
        const presetId = createdPreset?.productId;
        const productName = createdPreset?.productName;
        if (!presetId) {
          message.error("Unable to open image pool. Please try again.");
          return;
        }
        router.push({
          pathname: "/image-pool/image-pool-details",
          query: {
            poolId: presetId,
            productName: productName,
          },
        });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        message.error(err?.message || t("pleaseFillRequired", sourceKey.user));
      });
  }

  const loadCategoryOptions = async () => {
    try {
      const response = await getCategory("all", 0, {
        status: CONTENT_STATUS.ACTIVE,
      });
      if (response?.data) {
        const options = response?.data?.map((category) => ({
          title: category.title,
          value: category._id,
        }));
        setCategoryOption(options);
      }
    } catch (error) {
      console.error("Error loading category options:", error);
    }
  };

  const loadOutletOption = async () => {
    try {
      const response = await getOutletListingsByMasterHQ("all", 0, {
        status: USER_STATUS.ACTIVE,
      });
      if (response?.success && response?.data) {
        setOutletOption(mapOutletOptions(response?.data));
      }
    } catch (error) {
      console.error("Error loading outlet options:", error);
    }
  };

  function onClose() {
    setOpen(false);
    if (props.onClose) {
      props.onClose();
    }
  }

  useEffect(() => {
    setOpen(props?.open === true);
    if (!isEmpty(selectedRecord)) {
      form.setFieldsValue({
        status: selectedRecord?.status,
        presetName: selectedRecord?.presetName,
        productName: selectedRecord?.productName,
        sellingHighlight: selectedRecord?.sellingHighlight,
        style: selectedRecord?.style,
        language: selectedRecord?.language,
        targetAudience: selectedRecord?.targetAudience,
        hashtags: selectedRecord?.hashtags,
        promotion: selectedRecord?.promotion,
        industry: selectedRecord?.industry,
        contentLength: selectedRecord?.contentLength,
        categoryId: selectedRecord?.categoryId,
        writingStyle: selectedRecord?.writingStyle,
        applicableOutletId: selectedRecord?.applicableOutletId || [],
        imageCount: selectedRecord?.imageCount || 5,
        mediaTypeSwitch: isVideoMedia(selectedRecord?.mediaType),
        imageCount: selectedRecord?.imageCount ?? 5,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true })
      form.setFieldsValue({
        status: PRESET_STATUS.ACTIVE,
        mediaTypeSwitch: false,
        imageCount: 5,
      });
    }
    loadCategoryOptions();
    if (user?.user?.role === "masterHQ") {
      loadOutletOption();
    }
  }, [props?.open, selectedRecord, form]);

  return (
    <>
      <MobileFormDrawer
        closable={true}
        onClose={onClose}
        open={open}
        width={"360px"}
        zIndex={1200}
        title={
          !isEmpty(selectedRecord)
            ? t("editPresetTemplate", sourceKey.user)
            : t("addPresetTemplate", sourceKey.user)
        }
        footer={
          <div className="flex flex-col gap-2">
            <Button
              loading={loading}
              className="ant-btn-default bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              size="large"
              onClick={() => handleSave()}
            >
              {t("confirm", sourceKey.user)}
            </Button>
            {!isEditing && (
              <Button
                loading={loading}
                size="large"
                onClick={() => handleSaveAndAddImage()}
              >
                Confirm and Add image now
              </Button>
            )}
          </div>
        }
      >
        <Form form={form}>
          <SwitchInput
            label={t("status", sourceKey.user)}
            fieldName={"status"}
          />

          {!isVideo && (
            <DropdownInput
              label="Attached Image Count"
              fieldName="imageCount"
              placeholder="Select image count"
              required={false}
              options={[
                { title: "0", value: 0 },
                { title: "1", value: 1 },
                { title: "2", value: 2 },
                { title: "3", value: 3 },
                { title: "4", value: 4 },
                { title: "5", value: 5 },
              ]}
            />
          )}

          <div>
            <div className="flex items-center gap-1 mb-1 small-text-size" style={{ color: "#37333480" }}>
              Media Type
              <Tooltip
                title={
                  <span className="small-text-size">
                    Off = Image template (default). On = Video template — content generated by this preset will pull from the product&apos;s Video Pool when shared.
                  </span>
                }
              >
                <InfoCircleOutlined className="pl-1" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors ${!isVideo ? 'font-semibold text-green-500' : 'text-gray-400'}`}>
                Image
              </span>
              <div className="-mb-6">
                <SwitchInput
                  label=""
                  fieldName={"mediaTypeSwitch"}
                  required={false}
                  switchStyle={{ backgroundColor: isVideo ? '#3b82f6' : '#22c55e' }}
                />
              </div>
              <span className={`text-sm transition-colors ${isVideo ? 'font-semibold text-blue-500' : 'text-gray-400'}`}>
                Video
              </span>
            </div>
          </div>

          <StringInput
            label={
              <>
                {t("nTpresetName", sourceKey.user)}
                <Tooltip
                  title={
                    <span className="small-text-size ">
                      {t("nTpresetTemplateToolTip", sourceKey.user)}
                    </span>
                  }
                >
                  <InfoCircleOutlined className="pl-2" />
                </Tooltip>
              </>
            }
            fieldName="presetName"
            rules={formRules.presetName}
            placeholder={t("nTpresetName", sourceKey.user)}
          />

          <StringInput
            label={
              <>{t("productName", sourceKey.user)}
                <Tooltip
                  title={
                    <>
                      <img src={TooltipImageProduct} />
                      <span className="small-text-size ">
                        {t("nTproductNameToolTip", sourceKey.user)}
                      </span>
                    </>
                  }
                >
                  <InfoCircleOutlined className="pl-2" />
                </Tooltip>
              </>
            }
            fieldName="productName"
            rules={formRules.productName}
            placeholder={t("productName", sourceKey.user)}
          />

          <div className={`mb-5 required-label small-text-size`} style={{ color: "#37333480" }}>
            {t("sellingHighlight", sourceKey.user)}
            <Form.Item name="sellingHighlight">
              <Input.TextArea
                rows={4}
                // rules={formRules.sellingHighlight}
                placeholder={t("sellingHighlight", sourceKey.user)}
              />
            </Form.Item>
          </div>

          <div className={`mb-5 required-label small-text-size`} style={{ color: "#37333480" }}>
            {t("promotionalMessage", sourceKey.user)}
            <Form.Item name="promotion">
              <Input.TextArea
                rows={4}
                // rules={formRules.promotionalMessage}
                placeholder={t("promotionalMessage", sourceKey.user)}
              />
            </Form.Item>
          </div>

          {/* <DropdownInput
            label={t("language", sourceKey.user)}
            fieldName="language"
            // rules={formRules.language}
            options={[
              { title: "English", value: "english" },
              { title: "Chinese", value: "chinese" },
              // { title: "Malay", value: "Malay" },
            ]}
            placeholder={t("language", sourceKey.user)}
          /> */}
          {/* 
                    <StringInput
                        fieldName="targetAudience"
                        label={t("targetAudience", sourceKey.user)}
                        placeholder={t("targetAudience", sourceKey.user)}
                    /> */}
          {/* 
          <StringInput
            fieldName="targetAudience"
            // rules={formRules.targetAudience}
            label={t("targetAudience", sourceKey.user)}
            placeholder={t("targetAudience", sourceKey.user)}
          /> */}

          <DropdownInput
            fieldName="categoryId"
            label={
              <>
                {t("category", sourceKey.user)}
                <Tooltip
                  title={
                    <>
                      <img src={TooltipImageCategory} />
                      <span className="small-text-size ">
                        {t("nTcategoryToolTip", sourceKey.user)}
                      </span>
                    </>
                  }
                >
                  <InfoCircleOutlined className="pl-2" />
                </Tooltip>
              </>
            }
            options={categoryOption}
            // rules={formRules.category}
            placeholder={t("category", sourceKey.user)}
          />

          {/* <DropdownInput
            label={t("writingStyle", sourceKey.user)}
            fieldName="writingStyle"
            // rules={formRules.writingStyle}
            options={[
              { title: t("pro", sourceKey.user), value: "pro" },
              { title: t("cute", sourceKey.user), value: "cute" },
              { title: t("joke", sourceKey.user), value: "joke" },
              { title: t("friendly", sourceKey.user), value: "friendly" },
            ]}
            placeholder={t("style", sourceKey.user)}
          /> */}

          <StringInput
            label={t("hashtag", sourceKey.user)}
            fieldName="hashtags"
            placeholder="#Hashtag"
          />

          {/* <DropdownInput
            label={t("wording", sourceKey.user)}
            // fieldName="contentLength"
            rules={formRules.wording}
            options={[
              { title: "Long", value: "long" },
              { title: "Short", value: "short" },
            ]}
            placeholder={t("select", sourceKey.user)}
          /> */}
          {user?.user?.role === "masterHQ" &&
            <DropdownInput
              label={t("assignTo", sourceKey.user)}
              fieldName="applicableOutletId"
              options={outletOption}
              mode="multiple"
              multipleAll={true}
              placeholder={t("outlet", sourceKey.user)}
            />
          }
        </Form>
      </MobileFormDrawer >
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PresetTemplateDrawer));
