import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Wand2, Image as ImageIcon, PenLine, SlidersHorizontal, } from "lucide-react";
import { useForm } from "antd/lib/form/Form";
import { Button, Form, message, Tooltip, Spin, Card, Slider, Switch } from "antd";
import { useRouter } from "next/router";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { facebook, GoogleReview, instagram, LocationExample, OthersIcon, redNote, TooltipImageCategory, TooltipImageProduct, } from "../../../../public/assets/index";
import { useFormRules } from "@/constant/formRules";
import images from "@/pages/api/upload/images";
import videos from "@/pages/api/upload/videos";
import getCategory from "@/pages/api/category/getCategory";
import NumberInput from "@/components/general/input/NumberInput";
import DropdownInput from "@/components/general/input/DropdownInput";
import TextAreaInput from "@/components/general/input/TextAreaInput";
import StringInput from "@/components/general/input/StringInput";
import ImageUploadWithPreview from "@/components/general/components/ImageUploadWithPreview";
import VideoUploadWithPreview from "@/components/general/components/VideoUploadWithPreview";
import SwitchInput from "@/components/general/input/SwitchInput";
import { MEDIA_TYPE, isVideoMedia } from "@/constants/mediaType";
import startChunkGeneration from "@/pages/api/contentGeneration/startChunkGeneration";
import getPresetContent from "@/pages/api/contentPreset/getPresetContent";
import editPresetContent from "@/pages/api/contentPreset/editPresetContent";
import getOutletListingsByMasterHQ from "@/pages/api/user/getOutletListingsByMasterHQ";
import { PRESET_STATUS, USER_STATUS } from "@/constants/user";
import { connect, useDispatch } from "react-redux";
import { CONTENT_STATUS } from "@/constant/template";
import { InfoCircleOutlined } from "@ant-design/icons";
import { trimIfString } from "@/utility/common-functions";
import { mapOutletOptions } from "@/utility/option-mappers";
import getImagePoolByPresetId from "@/pages/api/contentPreset/getImagePoolFromPresetId";
import getVideoPoolByPresetId from "@/pages/api/contentPreset/getVideoPoolFromPresetId";
import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import getImagePool from "@/pages/api/imagePool/getImagePool";
import { isArray } from "lodash";
import { useRefreshCreditBalance } from "@/hooks/useCreditBalance";
import useIsCollapsed from "@/components/useIsCollapsed";
import AutoModeRulesModal from "./AutoModeRulesModal";
import createAutoMode from "@/pages/api/content/createAutoMode";
import getAutoModeList from "@/pages/api/content/getAutoModeList";
import updateSpecialRemark from "@/pages/api/user/updateSpecialRemark";
import getGenerationConfig from "@/pages/api/generationConfiguration/getConfig";
import { updateBusinessInfo } from "@/redux/actions/user-actions";
import {
  AUTO_MODE_DEFAULT_LANGUAGE,
  AUTO_MODE_DEFAULT_ROLE,
  GEN_LIMIT,
  getLanguageOptions,
  getRoleOptions,
} from "@/constants/autoGenMode";

const AIAssistantForm = ({ currentTab, user }) => {
  const [form] = useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const userId = user?.user?._id;
  const isCollapsed = useIsCollapsed();
  const refreshCreditBalance = useRefreshCreditBalance();

  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [presetTemplates, setPresetTemplates] = useState([]);
  const [flashActive, setFlashActive] = useState(false);
  const flashTimeoutRef = useRef(null);
  const FLASH_DURATION_MS = 2500;

  // Progress tracking states
  const [categoryOption, setCategoryOption] = useState(null);
  const [outletOption, setOutletOption] = useState(null);
  const formRules = useFormRules(t, sourceKey);

  // Get current form values to calculate required images
  const [currentVariations, setCurrentVariations] = useState(GEN_LIMIT.MIN);
  const [visualMode, setVisualMode] = useState("manual");
  const [mediaType, setMediaType] = useState(MEDIA_TYPE.IMAGE);
  const visualCardMinHeight = 520;
  const [selectedImages, setSelectedImages] = useState([]);
  const [randomImagePoolFromPreset, setRandomImagePoolFromPreset] = useState(
    []
  );
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [randomVideoPoolFromPreset, setRandomVideoPoolFromPreset] = useState(
    []
  );
  const requiredImages = currentVariations * 4;
  const [categoryImageUrls, setCategoryImageUrls] = useState([]);
  const userIdentity = user?.user?.role;
  const presetTemplateValue = Form.useWatch("presetTemplate", form);
  const [visualPoolOpen, setVisualPoolOpen] = useState(false);
  const [visualPoolImage, setVisualPoolImage] = useState(null);
  const [selectedPresetImagePool, setSelectedPresetImagePool] = useState(null);
  const [selectedPesetName, setSelectedPesetName] = useState(null)
  const [updatePresetModalOpen, setUpdatePresetModalOpen] = useState(false);
  const [pendingGenerationValues, setPendingGenerationValues] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [autoModeModalOpen, setAutoModeModalOpen] = useState(false);
  const [autoModeLoading, setAutoModeLoading] = useState(false);
  const [pendingAutoModeData, setPendingAutoModeData] = useState(null);
  const [videoRandomLimit, setVideoRandomLimit] = useState(3);
  const [selectedPresetImageCount, setSelectedPresetImageCount] = useState(5);
  //for image pool slots calculation
  const TOTAL_SLOTS = selectedPresetImageCount;
  const filledSlots = randomImagePoolFromPreset.length;
  const emptySlots = TOTAL_SLOTS - filledSlots;
  // Platform options matching TemplatesPage tabItems
  const platformOptions = [
    // {
    //   title: (
    //     <div className="flex items-center">
    //       {/* <img src={GoogleReview} className="w-4 h-4 mr-2" alt="Google Review" /> */}
    //       <span>{t("All", sourceKey.user)}</span>
    //     </div>
    //   ),
    //   value: "all"
    // },
    {
      title: (
        <div className="flex items-center">
          <img
            src={GoogleReview}
            className="w-4 h-4 mr-2"
            alt="Google Review"
          />
          <span>{t("googleReview", sourceKey.user)}</span>
        </div>
      ),
      value: "googleReview",
    },
    {
      title: (
        <div className="flex items-center">
          <img src={OthersIcon} className="w-4 h-4 mr-2" alt="Others" />
          <span>{t("others", sourceKey.user)}</span>
        </div>
      ),
      value: "others",
    },
  ];

  const roleOptions = getRoleOptions(t);
  const languageOptions = getLanguageOptions(t);

  // Watch for changes in variationsPerPlatform using form onValuesChange
  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.variationsPerPlatform !== undefined) {
      setCurrentVariations(
        parseInt(changedValues.variationsPerPlatform) || GEN_LIMIT.MIN
      );
    }

    // Handle preset template selection
    if (changedValues.presetTemplate !== undefined) {
      handlePresetTemplateChange(changedValues.presetTemplate);
    }

    // When outlet changes, update specialRemark to the selected outlet's value
    if (changedValues.outletUserId !== undefined) {
      const selected = outletOption?.find((o) => o.value === changedValues.outletUserId);
      form.setFieldsValue({
        specialRemark: selected?.specialRemark || selected?.address || "",
      });
    }
  };

  // Load preset templates on component mount
  const loadPresetTemplates = async () => {
    try {
      const response = await getPresetContent("all", 0, {
        status: PRESET_STATUS.ACTIVE,
      });
      if (response?.success && response?.data) {
        setPresetTemplates(response?.data);
      }

      // if (response?.success && response?.data) {
      //   const options = response?.data?.map((presetTemplate) => ({
      //     title: presetTemplate?.productName,
      //     value: presetTemplate.productName,
      //   }));
      //   setProductNameOptions(options);
      // }
    } catch (error) {
      console.error("Error loading preset templates:", error);
    }
  };

  const handleNavigateWithConfirm = (path) => {
    const leave = window.confirm(
      "Your unsaved data will be lost. Do you still want to proceed?"
    );
    if (leave) {
      // window.location.href = path; // full page reload
      // OR for Next.js client-side navigation:
      router.push(path);
    }
  };

  // Load Image Pool from preset templates
  const loadImagePoolFromPreset = async (selectedPresetId) => {
    try {
      const response = await getImagePoolByPresetId("all", 0, {
        presetId: selectedPresetId,
      });
      if (response?.success && response?.data) {
        // setPresetTemplates(response?.data);
        setRandomImagePoolFromPreset(
          response?.data?.map((item) => item.imageUrl)
        );
      }
    } catch (error) {
      console.error("Error loading image pool from preset templates:", error);
    }
  };

  // Load Video Pool from preset templates
  const loadVideoPoolFromPreset = async (selectedPresetId) => {
    try {
      const response = await getVideoPoolByPresetId("all", 0, {
        presetId: selectedPresetId,
      });
      if (response?.success && response?.data) {
        setRandomVideoPoolFromPreset(
          response.data.map((item) => item.videoUrl).filter(Boolean)
        );
      } else {
        setRandomVideoPoolFromPreset([]);
      }
    } catch (error) {
      console.error("Error loading video pool from preset templates:", error);
      setRandomVideoPoolFromPreset([]);
    }
  };

  // Load category options on component mount
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
        setOutletOption(
          mapOutletOptions(response?.data, {
            includeAddress: true,
            includeBusinessInfo: true,
          })
        );
      }
    } catch (error) {
      console.error("Error loading outlet options:", error);
    }
  };

  // Handle preset template selection
  const handlePresetTemplateChange = (selectedValue) => {
    if (selectedValue === "CREATE_NEW") {
      router.push("/templates/preset?openDrawer=1");
      form.setFieldsValue({ presetTemplate: null }); // Reset selection
      return;
    }

    if (!selectedValue || selectedValue === "") {
      // Reset all form fields when empty option is selected
      form.resetFields();
      setRandomImagePoolFromPreset([]);
      setRandomVideoPoolFromPreset([]);
      setSelectedPresetImageCount(5);
      setMediaType(MEDIA_TYPE.IMAGE);
      form.setFieldsValue({ mediaTypeSwitch: false });
      setCurrentVariations(GEN_LIMIT.MIN);

      // Restore outlet specific fields if not masterHQ
      if (userIdentity !== "masterHQ") {
        form.setFieldsValue({
          outletUserId: user?.user?.businessInfo?.businessName,
          specialRemark:
            user?.user?.businessInfo?.specialRemark ||
            user?.user?.businessInfo?.businessAddress?.address ||
            "",
          targetAudience: "Everyone",
          style: "friendly",
        });
      }
      return;
    }
    // Find the selected preset template
    const selectedPreset = presetTemplates.find(
      (preset) => preset._id === selectedValue
    );
    if (selectedPreset) {
      // Set form fields with flat structure preset data
      form.setFieldsValue({
        // productName: selectedPreset.presetName || '',
        // promotional: selectedPreset.promotional || '',
        // sellingPoint: selectedPreset.sellingPoint || '',
        // targetAudience: selectedPreset.targetAudience || '',
        // style: selectedPreset.style || '',
        // language: selectedPreset.language || '',
        // contentLength: selectedPreset.contentLength || '',
        // hashtag: selectedPreset.hashtags || ''
        // language: selectedPreset?.language || "english",
        // platform: selectedPreset.platform || currentTab,
        // writingStyle: selectedPreset?.writingStyle || "friendly",
        // contentLength: selectedPreset?.contentLength || "short",
        productName: selectedPreset.productName,
        promotional: selectedPreset.promotion,
        sellingPoint: selectedPreset.sellingHighlight,
        targetAudience: selectedPreset?.targetAudience || "Everyone",
        location: user?.user?.businessInfo?.businessAddress?.address || "Worldwide",
        hashtags: selectedPreset?.hashtags,
        chunkSize:
          parseInt(selectedPreset?.variationsPerPlatform) || GEN_LIMIT.MIN,
        categoryId: selectedPreset?.categoryId || "",
      });
      setSelectedPesetName(selectedPreset.presetName);
      setSelectedPresetImagePool(selectedPreset?.productId);
      setSelectedPresetImageCount(selectedPreset?.imageCount || 5);
      triggerFlash();

      // Adopt the preset's preferred media type (user can still override per generation)
      const newMediaType = isVideoMedia(selectedPreset?.mediaType) ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE;
      setMediaType(newMediaType);
      form.setFieldsValue({ mediaTypeSwitch: newMediaType === MEDIA_TYPE.VIDEO });

      // Load the matching pool for the preset
      if (selectedPreset._id) {
        loadImagePoolFromPreset(selectedPreset._id);
        loadVideoPoolFromPreset(selectedPreset._id);
      } else {
        setRandomImagePoolFromPreset([]);
        setRandomVideoPoolFromPreset([]);
      }
    }
  };

  useEffect(() => {
    getGenerationConfig()
      .then((res) => {
        const limit = res?.data?.videoRandomLimit;
        if (limit && limit > 0) setVideoRandomLimit(limit);
      })
      .catch((err) => console.error('Failed to load generation config:', err));
  }, []);

  const triggerFlash = () => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    setFlashActive(false);
    if (typeof window === "undefined") {
      return;
    }
    window.requestAnimationFrame(() => {
      setFlashActive(true);
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashActive(false);
        flashTimeoutRef.current = null;
      }, FLASH_DURATION_MS);
    });
  };

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  // useEffect to load preset templates and set default platform
  useEffect(() => {
    loadPresetTemplates();

    loadCategoryOptions();
    if (userIdentity === "masterHQ") {
      loadOutletOption();
    }
    if (userIdentity !== "masterHQ") {
      form.setFieldsValue({

        outletUserId: user?.user?.businessInfo?.businessName,
        specialRemark:
          user?.user?.businessInfo?.specialRemark ||
          user?.user?.businessInfo?.businessAddress?.address ||
          "",
      });
    }

    // Only set default platform if NOT coming from preset template
    // if (currentTab && !router.query.presetTemplateId) {
    //   form.setFieldsValue({
    //     platform: currentTab,
    //   });
    // }
  }, [currentTab, router.query.presetTemplateId]);

  // useEffect to handle preset template from query parameter
  useEffect(() => {
    if (router.query.presetTemplateId && presetTemplates.length > 0) {
      const selectedPreset = presetTemplates.find(
        (preset) => preset._id === router.query.presetTemplateId
      );
      if (selectedPreset) {
        // Auto-select the preset template from query parameter
        form.setFieldsValue({
          presetTemplate: router.query.presetTemplateId,
          style: "friendly",
          // Do NOT set platform - let user choose manually
        });
        // Trigger the preset template change handler
        handlePresetTemplateChange(router.query.presetTemplateId);
      }
    } else if (!router.query.presetTemplateId) {
      form.resetFields();
      const defaultValues = {
        targetAudience: "Everyone",
        style: "friendly",
        variationsPerPlatform: GEN_LIMIT.MIN,
      };

      if (userIdentity !== "masterHQ") {
        defaultValues.outletUserId = user?.user?.businessInfo?.businessName;
        defaultValues.specialRemark =
          user?.user?.businessInfo?.specialRemark ||
          user?.user?.businessInfo?.businessAddress?.address ||
          "";
      }

      form.setFieldsValue(defaultValues);
    }
  }, [router.query.presetTemplateId, presetTemplates, userIdentity, user]);

  // If not
  useEffect(() => {
    presetTemplateValue === undefined
      ? setVisualMode("manual")
      : setVisualMode("pool");
  }, [presetTemplateValue]);

  const getSelectedPresetFromValues = (values = {}) => {
    const selectedPresetId = values?.presetTemplate || router.query.presetTemplateId;
    return presetTemplates.find((preset) => preset._id === selectedPresetId);
  };

  const hasPresetChanges = (values = {}, selectedPreset, currentMediaType) => {
    if (!selectedPreset) {
      return false;
    }

    const presetMediaType = isVideoMedia(selectedPreset?.mediaType) ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE;

    return (
      trimIfString(values.sellingPoint) !== trimIfString(selectedPreset.sellingHighlight) ||
      trimIfString(values.promotional) !== trimIfString(selectedPreset.promotion) ||
      trimIfString(values.hashtags) !== trimIfString(selectedPreset.hashtags) ||
      values.categoryId !== selectedPreset.categoryId ||
      (currentMediaType !== undefined && currentMediaType !== presetMediaType)
    );
  };

  const handleAutoModeToggle = (checked) => {
    setAutoModeEnabled(checked);
    setShowDuplicateWarning(false);
    form.setFieldsValue({ variationsPerPlatform: GEN_LIMIT.MIN });
    setCurrentVariations(GEN_LIMIT.MIN);
  };

  const handleAutoModePresetDecision = async (shouldUpdatePreset) => {
    if (!pendingAutoModeData) {
      setUpdatePresetModalOpen(false);
      setPendingActionType(null);
      return;
    }

    try {
      if (shouldUpdatePreset) {
        setAutoModeLoading(true);
        const { values, selectedPreset } = pendingAutoModeData;
        const response = await editPresetContent({
          presetId: selectedPreset?._id,
          sellingHighlight: trimIfString(values.sellingPoint),
          promotion: trimIfString(values.promotional),
          hashtags: trimIfString(values.hashtags),
          categoryId: values.categoryId || "",
          mediaType,
        });

        if (response?.data?.success === false || response?.success === false) {
          throw new Error(response?.data?.message || "Failed to update preset template.");
        }
        message.success(response?.data?.message || "Preset template updated.");
      }

      setUpdatePresetModalOpen(false);
      setPendingActionType(null);
      setAutoModeModalOpen(true);
    } catch (error) {
      console.error("Auto mode preset update failed:", error);
      message.error(error?.message || "Failed to update preset template.");
    } finally {
      setAutoModeLoading(false);
    }
  };

  const prepareAutoMode = async () => {
    try {
      const values = await form.validateFields();
      const selectedPreset = getSelectedPresetFromValues(values);

      if (!selectedPreset?._id || !selectedPreset?.productId) {
        message.error("Please select a preset template to activate auto mode.");
        return;
      }

      const autoModeData = { values, selectedPreset };
      const isOwner = user?.user?._id === selectedPreset?.userId;
      if (hasPresetChanges(values, selectedPreset, mediaType) && isOwner) {
        setPendingAutoModeData(autoModeData);
        setPendingActionType("autoMode");
        setUpdatePresetModalOpen(true);
        return;
      }

      setPendingAutoModeData(autoModeData);
      setAutoModeModalOpen(true);
    } catch (error) {
      console.error("Auto mode setup validation failed:", error);
    }
  };

  const handleAutoModeModalClose = () => {
    if (autoModeLoading) {
      return;
    }
    setAutoModeModalOpen(false);
  };

  const getGenerationImageUrls = async () => {
    let imageUrls = [];
    if (randomImagePoolFromPreset.length > 0 && visualMode === "pool") {
      imageUrls = randomImagePoolFromPreset;
    }

    if (selectedImages.length > 0) {
      const imageRes = await images({ images: selectedImages });

      if (imageRes?.error || !imageRes?.data?.success) {
        const errorMessage =
          imageRes?.error?.message ||
          imageRes?.data?.message ||
          "Failed to upload images";
        throw new Error(errorMessage);
      }

      imageUrls = imageRes?.data?.data?.imageUrls || [];
      if (imageUrls.length === 0) {
        throw new Error("No image URLs returned from upload");
      }

      setCategoryImageUrls(imageUrls);
    }

    return imageUrls;
  };

  const getGenerationVideoUrls = async () => {
    let videoUrls = [];
    if (randomVideoPoolFromPreset.length > 0 && visualMode === "pool") {
      videoUrls = randomVideoPoolFromPreset;
    }

    if (selectedVideos.length > 0) {
      const videoRes = await videos({ videos: selectedVideos });

      if (videoRes?.error || !videoRes?.data?.success) {
        const errorMessage =
          videoRes?.error?.message ||
          videoRes?.data?.message ||
          "Failed to upload videos";
        throw new Error(errorMessage);
      }

      videoUrls = videoRes?.data?.data?.videoUrls || [];
      if (videoUrls.length === 0) {
        throw new Error("No video URLs returned from upload");
      }
    }

    return videoUrls;
  };

  const getGenerationBusinessContext = (values) => {
    if (userIdentity === "masterHQ" && values.outletUserId) {
      const selectedOutlet = outletOption?.find(
        (outlet) => outlet.value === values.outletUserId
      );

      return {
        location:
          values.specialRemark ||
          selectedOutlet?.specialRemark ||
          selectedOutlet?.address ||
          "Worldwide",
        companyIntro:
          selectedOutlet?.businessInfo?.businessDescription ||
          user?.user?.businessInfo?.businessDescription ||
          "",
        industry:
          selectedOutlet?.businessInfo?.industry ||
          user?.user?.businessInfo?.industry ||
          "",
      };
    }

    return {
      location:
        values.specialRemark ||
        user?.user?.businessInfo?.specialRemark ||
        user?.user?.businessInfo?.businessAddress?.address ||
        "Worldwide",
      companyIntro: user?.user?.businessInfo?.businessDescription || "",
      industry: user?.user?.businessInfo?.industry || "",
    };
  };

  const buildGenerationPayload = async ({
    values,
    selectedPreset,
    chunkSizeOverride,
  }) => {
    // Upload media after form validation, based on the active mediaType.
    const imageUrls =
      mediaType === MEDIA_TYPE.IMAGE ? await getGenerationImageUrls() : [];
    const videoUrls =
      mediaType === MEDIA_TYPE.VIDEO ? await getGenerationVideoUrls() : [];

    // Get location and company info based on user identity.
    const { location, companyIntro, industry } =
      getGenerationBusinessContext(values);

    // Debugging aid when presets are empty or not matching.
    if (presetTemplates.length === 0) {
      console.warn("No presetTemplates loaded when generating content");
    }

    const parsedChunkOverride = Number.parseInt(chunkSizeOverride, 10);
    const chunkSize = Number.isFinite(parsedChunkOverride)
      ? parsedChunkOverride
      : Number.parseInt(values.variationsPerPlatform, 10) || GEN_LIMIT.MIN;

    return {
      productName: trimIfString(values.productName),
      promotion: trimIfString(values.promotional),
      sellingHighlight: trimIfString(values.sellingPoint),
      targetAudience: values.targetAudience,
      contentLength: values.contentLength,
      writingStyle: values.style || "friendly",
      companyIntro,
      location,
      languageOption: values.language || AUTO_MODE_DEFAULT_LANGUAGE,
      hashtags: values.hashtags,
      chunkSize,
      // platform: values?.platform || currentTab,
      role: values?.role || AUTO_MODE_DEFAULT_ROLE,
      mediaType,
      imageUrls,
      videoUrls,
      industry,
      outletUserId:
        userIdentity === "masterHQ" ? values.outletUserId : user?.user?._id,
      categoryId: values.categoryId || "",
      productId: selectedPreset?.productId,
      uploadMode: visualMode,

      // // If not found by id, and productName provided, try to match by presetName (trimmed)
      // // const trimmedProductName = trimIfString(values.productName);
      // // const fallbackPreset = presetTemplates.find((p) => p.presetName === trimmedProductName);
      // // const computedProductId = fallbackPreset?.productId || null;
    };
  };

  const handleAutoModeSubmit = async ({ threshold, generationCount }) => {
    if (!pendingAutoModeData?.selectedPreset) {
      message.error("Preset template is missing.");
      return;
    }

    try {
      setAutoModeLoading(true);
      const { values, selectedPreset } = pendingAutoModeData;
      const outletUserId =
        userIdentity === "masterHQ" ? values.outletUserId : user?.user?._id;
      const payload = {
        contentPresetId: selectedPreset._id,
        productId: selectedPreset.productId,
        threshold,
        generationCount,
        language: values.language || AUTO_MODE_DEFAULT_LANGUAGE,
        outletUserId,
        roleWriter: values?.role || AUTO_MODE_DEFAULT_ROLE,
      };

      const response = await createAutoMode(payload);
      if (response?.data?.success === false || response?.success === false) {
        throw new Error(response?.data?.message || "Failed to activate auto mode.");
      }

      // Auto Mode flow:
      // 1) activate auto mode config
      // 2) trigger first generation immediately
      try {
        const generationPayload = await buildGenerationPayload({
          values,
          selectedPreset,
          chunkSizeOverride: generationCount,
        });
        await executeGeneration(generationPayload);
      } catch (generationError) {
        console.error(
          "Initial generation failed after auto mode activation:",
          generationError
        );
        const generationErrorMessage = generationError?.message
          ? `: ${generationError.message}`
          : ".";
        message.warning(
          `Auto mode activated, but initial generation failed${generationErrorMessage}`
        );
        setAutoModeModalOpen(false);
        setPendingAutoModeData(null);
        setPendingActionType(null);
        setAutoModeEnabled(false);
        return;
      }

      message.success(response?.data?.message || "Auto mode activated successfully.");
      setAutoModeModalOpen(false);
      setPendingAutoModeData(null);
      setPendingActionType(null);
      setAutoModeEnabled(false);
      form.resetFields();
      form.setFieldsValue({
        targetAudience: "Everyone",
        style: "friendly",
        variationsPerPlatform: GEN_LIMIT.MIN,
      });
      setCurrentVariations(GEN_LIMIT.MIN);
    } catch (error) {
      console.error("Auto mode activation failed:", error);
      message.error(error?.message || "Failed to activate auto mode.");
    } finally {
      setAutoModeLoading(false);
    }
  };

  const handleGenerateButtonClick = async () => {
    if (autoModeEnabled) {
      // Check for existing non-deleted auto mode before opening the modal
      try {
        const values = await form.validateFields();
        const selectedPreset = getSelectedPresetFromValues(values);
        const outletUserId =
          userIdentity === "masterHQ" ? values.outletUserId : user?.user?._id;
        const language = values.language || AUTO_MODE_DEFAULT_LANGUAGE;
        const roleWriter = values.role || AUTO_MODE_DEFAULT_ROLE;

        if (selectedPreset) {
          const checkRes = await getAutoModeList(1, 0, {
            contentPresetId: selectedPreset._id,
            outletUserId,
            language,
            roleWriter,
            statusNe: 0, // exclude INACTIVE — matches ACTIVE (1) or PAUSED (2)
          });

          const count = checkRes?.total || 0;
          if (count > 0) {
            setShowDuplicateWarning(true);
            message.warning(
              "Same setting is managed by Auto Mode. Switch it off to generate manually this turn."
            );
            return;
          }
          setShowDuplicateWarning(false);
        }
      } catch (validationError) {
        if (validationError?.errorFields) return; // antd form validation failed
        // API error — let prepareAutoMode surface it
      }
      await prepareAutoMode();
      return;
    }
    await generateAIContent();
  };

  const generateAIContent = async () => {
    try {
      setLoading(true);
      // Validate form fields.
      const values = await form.validateFields();

      // Validate platform selection.
      // if (!values.platform && !currentTab) {
      //   message.error("Please select a platform");
      //   setLoading(false);
      //   return;
      // }

      // Prepare correct values for content generation.
      const selectedPreset = getSelectedPresetFromValues(values);
      const generationPayload = await buildGenerationPayload({
        values,
        selectedPreset,
      });

      if (selectedPreset) {
        const hasChanges = hasPresetChanges(values, selectedPreset, mediaType);
        const isOwner = user?.user?._id === selectedPreset?.userId;

        if (hasChanges && isOwner) {
          setPendingGenerationValues(generationPayload);
          setPendingActionType("generation");
          setUpdatePresetModalOpen(true);
          setLoading(false);
          return;
        }
      }

      // Use await and handle errors with try/catch.
      await executeGeneration(generationPayload);
    } catch (error) {
      console.error("Content generation failed:", error);
      message.error(error?.message || "Content generation failed. Please try again.");
      setLoading(false);
    }
  };

  async function handleImageLibrary() {
    try {
      const data = {
        productId: selectedPresetImagePool,
        status: 1,
        imageUrlNe: false,
      };
      const res = await getImagePool("all", 0, data);
      const items = isArray(res?.data)
        ? res.data.map((item) => ({
          ...item,
          url: item?.imageUrl,
        }))
        : [];
      setVisualPoolImage({ items, loading: false });
      setVisualPoolOpen(true);
    } catch (error) {
      message.error(error?.message || "Failed to load image pool");
    }
  }

  //Flash after selected Preset Template
  const flashClassName = flashActive ? "flash-active" : "";
  const flashInputClassName = flashClassName
    ? `assistant-mobile-input ${flashClassName}`
    : "assistant-mobile-input";
  const flashSelectClassName = flashClassName
    ? `assistant-mobile-select ${flashClassName}`
    : "assistant-mobile-select";

  const renderSectionHeader = (title, tone, icon) => (
    <div
      className={`assistant-mobile-section-title assistant-mobile-section-title--${tone}`}
    >
      {icon}
      <span>{title}</span>
    </div>
  );

  //Mobile Layout
  const renderCollapsedLayout = () => (
    <div className="assistant-mobile-wrapper">
      <Card className="assistant-mobile-card" bodyStyle={{ padding: 16 }}>
        {renderSectionHeader(
          t("nTchooseStartingPoint", sourceKey.user) || "Starting Point",
          "blue",
          <Wand2 className="assistant-mobile-section-icon" />
        )}
        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("presetTemplate", sourceKey.user)}
          </Label>
          <Tooltip
            title={
              <>
                <span className="small-text-size ">
                  {t("nTpresetTemplateToolTip", sourceKey.user)}
                </span>
              </>
            }
          >
            <InfoCircleOutlined className="pl-2" />
          </Tooltip>
          <DropdownInput
            fieldName="presetTemplate"
            options={[
              {
                title: "+ " + (t("nTcreatePresetTemplate", sourceKey.user)),
                value: "CREATE_NEW",
              },
              ...presetTemplates.map((preset) => ({
                title: preset.presetName,
                value: preset._id,
              })),
            ]}
            placeholder={t("selectTemplate", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div>

        <div className="assistant-mobile-divider">
          <span className="assistant-mobile-divider-line" />
          <span className="assistant-mobile-divider-text">
            Or customize
          </span>
          <span className="assistant-mobile-divider-line" />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("productName", sourceKey.user) || "Product Name"}
          </Label>
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
          {/* <DropdownInput
            rules={formRules.productName}
            fieldName="productName"
            placeholder={t("title", sourceKey.user)}
            options={productNameOptions}
            selectClassName={flashClassName}
            mode="tags"
            allowCustom={true}
          /> */}
          <TextAreaInput
            rules={formRules.productName}
            fieldName="productName"
            placeholder={t("title", sourceKey.user)}
            inputClassName={flashClassName}
          />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("categoryType", sourceKey.user) || "Knowledge Type"}
          </Label>
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
          <DropdownInput
            fieldName="categoryId"
            rules={formRules.category}
            options={categoryOption}
            placeholder={t("category", sourceKey.user)}
            selectClassName={flashSelectClassName}
          />
        </div>
      </Card>

      <Card className="assistant-mobile-card" bodyStyle={{ padding: 16 }}>
        {renderSectionHeader(
          ("Creative Details"),
          "purple",
          <PenLine className="assistant-mobile-section-icon" />
        )}

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("sellingHighlight", sourceKey.user)}
          </Label>
          <TextAreaInput
            fieldName="sellingPoint"
            rules={formRules.sellingHighlight}
            placeholder={t("sellingPoint", sourceKey.user)}
            inputClassName={flashInputClassName}
            rows={3}
          />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("promotionalMessage", sourceKey.user)}
          </Label>
          <TextAreaInput
            fieldName="promotional"
            rules={formRules.promotionalMessage}
            placeholder={t("promotional", sourceKey.user)}
            inputClassName={flashInputClassName}
            rows={2}
          />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("targetAudience", sourceKey.user)}
          </Label>
          <StringInput
            fieldName="targetAudience"
            rules={formRules.targetAudience}
            placeholder={t("targetAudience", sourceKey.user)}
            inputClassName={flashInputClassName}
          />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("hashtag", sourceKey.user) || "Hashtags"}
          </Label>
          <StringInput
            fieldName="hashtags"
            placeholder="#Hashtag"
            inputClassName={flashInputClassName}
          />
        </div>
      </Card>

      <Card className="assistant-mobile-card" bodyStyle={{ padding: 16 }}>
        {renderSectionHeader(
          t("imagePool", sourceKey.user) || "Image Pool",
          "green",
          <ImageIcon className="assistant-mobile-section-icon" />
        )}

        <div className="assistant-mobile-toggle">
          <button
            type="button"
            className={`assistant-mobile-toggle-button ${visualMode === "pool"
              ? "assistant-mobile-toggle-button--active"
              : ""
              }`}
            onClick={() => {
              presetTemplateValue === undefined
                ? message.error(
                  "Please select a preset template to choose Random From Pool"
                )
                : setVisualMode("pool");
            }}
          >
            Random From Pool
          </button>
          <button
            type="button"
            className={`assistant-mobile-toggle-button ${visualMode === "manual"
              ? "assistant-mobile-toggle-button--active"
              : ""
              }`}
            onClick={() => setVisualMode("manual")}
          >
            Manual Upload
          </button>
        </div>

        {visualMode === "pool" ? (
          <div className="assistant-mobile-pool">
            <div className="assistant-mobile-pool-title">
              {t("imagePool", sourceKey.user) || "Image Pool"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {randomImagePoolFromPreset.map((img, index) => (
                <img
                  key={`mobile-real-${index}`}
                  src={img}
                  alt=""
                  className="assistant-mobile-pool-image"
                />
              ))}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <div
                  key={`mobile-empty-${index}`}
                  className="assistant-mobile-pool-empty"
                />
              ))}
            </div>
            <div className="assistant-mobile-pool-actions">
              <Button onClick={handleImageLibrary}>
                View Image Library
              </Button>
              <Button
                onClick={() => handleNavigateWithConfirm(`/image-pool/image-pool-details?poolId=${selectedPresetImagePool}&productName=${selectedPesetName}`)}
                type="link"
              >
                Add Image to Pool
              </Button>
            </div>
          </div>
        ) : (
          <div className="assistant-mobile-upload">
            <div className="assistant-mobile-field">
              <Label className="assistant-mobile-label">
                {t("mediaUpload", sourceKey.user)}
              </Label>
            </div>
            <ImageUploadWithPreview
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              maxRequiredImages={5}
              maxFileSize={10}
              showCounter
              gridCols="grid-cols-3"
              imageHeight={120}
            />
          </div>
        )}
      </Card>

      <Card className="assistant-mobile-card" bodyStyle={{ padding: 16 }}>
        {renderSectionHeader(
          t("outputSettings", sourceKey.user) || "Output Settings",
          "gray",
          <SlidersHorizontal className="assistant-mobile-section-icon" />
        )}

        {userIdentity === "masterHQ" ? (
          <div className="assistant-mobile-field">
            <Label className="assistant-mobile-label">
              {t("outlet", sourceKey.user)}
            </Label>
            <DropdownInput
              fieldName="outletUserId"
              rules={formRules.outlet}
              options={outletOption}
              disabled={userIdentity !== "masterHQ"}
              placeholder={t("outlet", sourceKey.user)}
              selectClassName="assistant-mobile-select"
            />
          </div>
        ) : null}

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("specialRemark", sourceKey.user) || "Special Remark"}
          </Label>
          <StringInput
            fieldName="specialRemark"
            placeholder={t("enterSpecialRemark", sourceKey.user) || "e.g. near KLCC, Level 2 Pavilion"}
            inputClassName="assistant-mobile-select"
            onBlur={(e) => {
              const targetUserId =
                userIdentity === "masterHQ"
                  ? form.getFieldValue("outletUserId")
                  : undefined;
              updateSpecialRemark({
                specialRemark: e.target.value,
                ...(targetUserId ? { targetUserId } : {}),
              });

              if (userIdentity === "outlet" || (userIdentity === "masterHQ" && !targetUserId)) {
                dispatch(updateBusinessInfo({ specialRemark: e.target.value }));
              }
            }}
          />
        </div>

        {/* <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("platform", sourceKey.user) || "Platform"}
          </Label>
          <DropdownInput
            fieldName="platform"
            rules={formRules.platform}
            options={platformOptions}
            placeholder={t("selectPlatform", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div> */}

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("nTrole", sourceKey.user)}
          </Label>
          <DropdownInput
            fieldName="role"
            rules={formRules.role}
            options={roleOptions}
            placeholder={t("nTselectRole", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div>

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("language", sourceKey.user)}
          </Label>
          <DropdownInput
            fieldName="language"
            rules={formRules.language}
            options={languageOptions}
            placeholder={t("language", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div>

        {/* <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("writingStyle", sourceKey.user)}
          </Label>
          <DropdownInput
            fieldName="style"
            rules={formRules.writingStyle}
            disabled={true}
            options={[
              // { title: t("pro", sourceKey.user), value: "pro" },
              // { title: t("cute", sourceKey.user), value: "cute" },
              // { title: t("joke", sourceKey.user), value: "joke" },
              { title: t("friendly", sourceKey.user), value: "friendly" },
            ]}
            placeholder={t("style", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div> */}

        <div className="assistant-mobile-field">
          <Label className="assistant-mobile-label">
            {t("wording", sourceKey.user)}
          </Label>
          <DropdownInput
            fieldName="contentLength"
            rules={formRules.wording}
            options={[
              { title: "Long (120-150)", value: "long" },
              { title: "Short (40-60)", value: "short" },
            ]}
            placeholder={t("select", sourceKey.user)}
            selectClassName="assistant-mobile-select"
          />
        </div>

        <div className="assistant-mobile-field">
          <div className="assistant-mobile-range-header">
            <Label className="assistant-mobile-label">
              {t("numberOfPosts", sourceKey.user)}
            </Label>
            <span className="assistant-mobile-range-value">
              {currentVariations || GEN_LIMIT.MIN}{" "}
              Variations
            </span>
          </div>
          <Form.Item
            name="variationsPerPlatform"
            rules={formRules.numberOfPosts}
          >
            <Slider
              min={GEN_LIMIT.MIN}
              max={GEN_LIMIT.MAX}
              className="assistant-mobile-slider"
              disabled={autoModeEnabled}
            />
          </Form.Item>
        </div>

        <div className="assistant-mobile-field">
          <div className="flex items-center justify-between">
            <Label className="assistant-mobile-label !mb-0">Auto Mode</Label>
            <Switch
              checked={autoModeEnabled}
              onChange={handleAutoModeToggle}
            />
          </div>
          {showDuplicateWarning && (
            <p className="text-red-500 text-xs mt-1">Turn off to proceed with manual generation</p>
          )}
        </div>
      </Card>
    </div>
  );

  //Default Layout
  const renderDefaultLayout = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 pb-6 h-full">
        {/* Card A  */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <span>
                {t("nTchooseStartingPoint", sourceKey.user) ||
                  "Choose Starting Point"}
              </span>

              <span
                onClick={() => router.push("/templates/preset?openDrawer=1")}
                className="text-xs text-blue-600 cursor-pointer hover:underline"
              >
                + Create New Template
              </span>
            </div>
          }
          className="md:col-span-2 h-full"
          bodyStyle={{ padding: 20 }}
          style={{ height: "100%" }}
        >
          {/* ================== Preset Template ================== */}

          <div className="space-y-2">
            <div className="flex flex-row gap-2">
              <Label htmlFor="presetTemplate">
                {t("presetTemplate", sourceKey.user)}
              </Label>
              <Tooltip
                title={
                  <span className="small-text-size">
                    {t("nTpresetTemplateToolTip", sourceKey.user)}
                  </span>
                }
              >
                <InfoCircleOutlined />
              </Tooltip>
            </div>
            <DropdownInput
              fieldName="presetTemplate"
              options={[
                {
                  title: "+ " + (t("nTcreatePresetTemplate", sourceKey.user)),
                  value: "CREATE_NEW",
                },
                ...presetTemplates.map((preset) => ({
                  title: preset.presetName,
                  value: preset._id,
                })),
              ]}
              placeholder={t("selectTemplate", sourceKey.user)}
            />
          </div>
          <div className="space-y-4">
            {/* ================== SELLING ================== */}

            <div className="space-y-2">
              <Label>{t("sellingHighlight", sourceKey.user)}</Label>
              <TextAreaInput
                fieldName="sellingPoint"
                rules={formRules.sellingHighlight}
                placeholder={t("sellingPoint", sourceKey.user)}
                inputClassName={flashClassName}
              />
            </div>

            {/* ================== PROMO ================== */}

            <div className="space-y-2">
              <Label>{t("promotionalMessage", sourceKey.user)}</Label>
              <TextAreaInput
                fieldName="promotional"
                rules={formRules.promotionalMessage}
                placeholder={t("promotional", sourceKey.user)}
                inputClassName={flashClassName}
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <div className="flex items-center gap-1">
                <Label htmlFor="productName">
                  {t("productName", sourceKey.user)}
                </Label>
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
              </div>
              <TextAreaInput
                rules={formRules.productName}
                fieldName="productName"
                placeholder={t("title", sourceKey.user)}
                inputClassName={flashClassName}
                disabled={true}
              />
              {/* <DropdownInput
                rules={formRules.productName}
                fieldName="productName"
                placeholder={t("title", sourceKey.user)}
                options={productNameOptions}
                selectClassName={flashClassName}
                mode="tags"
                allowCustom={true}
              /> */}
            </div>

            {/* ================== Category ================== */}

            <div className="space-y-2">
              <Label>{t("categoryType", sourceKey.user)}</Label>
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
              <DropdownInput
                fieldName="categoryId"
                rules={formRules.category}
                options={categoryOption}
                placeholder={t("category", sourceKey.user)}
                selectClassName={flashClassName}
              />
            </div>

            {/* ================== AUDIENCE  ================== */}

            <div className="space-y-2">
              <Label>{t("targetAudience", sourceKey.user)}</Label>
              <StringInput
                fieldName="targetAudience"
                rules={formRules.targetAudience}
                placeholder={t("targetAudience", sourceKey.user)}
                inputClassName={flashClassName}
              />
            </div>
            {/* ==================  HASHTAG ================== */}

            <div className="space-y-2">
              <Label>{t("hashtag", sourceKey.user)}</Label>
              <StringInput
                fieldName="hashtags"
                placeholder="#Hashtag"
                inputClassName={flashClassName}
              />
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-4 h-full">
          {/* CARD B */}
          <Card
            title="Visual Pairing"
            className="flex-1"
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 10,
            }}
            style={{ minHeight: 430 }}
          >
            {/* MEDIA TYPE SWITCH (Image ↔ Video) */}
            <div className="flex items-center justify-end gap-3 w-full mb-1">
              <span
                className={`text-sm transition-colors ${mediaType === MEDIA_TYPE.IMAGE
                  ? "font-semibold text-green-500"
                  : "text-gray-400"
                  }`}
              >
                Image
              </span>
              <div className="-mb-6">
                <SwitchInput
                  label=""
                  fieldName="mediaTypeSwitch"
                  required={false}
                  checked={mediaType === MEDIA_TYPE.VIDEO}
                  onChange={(checked) => {
                    setMediaType(checked ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE);
                    setVisualMode("manual");
                  }}
                  switchStyle={{ backgroundColor: mediaType === MEDIA_TYPE.VIDEO ? '#3b82f6' : '#22c55e' }}
                />
              </div>
              <span
                className={`text-sm transition-colors ${mediaType === MEDIA_TYPE.VIDEO
                  ? "font-semibold text-blue-500"
                  : "text-gray-400"
                  }`}
              >
                Video
              </span>
            </div>

            {/* FLIP-CARD container — flips when mediaType changes */}
            <div style={{ perspective: 1500, width: "100%", flex: 1 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: 360,
                  transformStyle: "preserve-3d",
                  transition:
                    "transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)",
                  transform:
                    mediaType === MEDIA_TYPE.VIDEO
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                }}
              >
                {/* IMAGE FACE */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    pointerEvents: mediaType === MEDIA_TYPE.IMAGE ? "auto" : "none",
                  }}
                  aria-hidden={mediaType !== MEDIA_TYPE.IMAGE}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center w-full">
                      <div className="flex gap-2 bg-gray-100 rounded-md p-1 w-full max-w-md">
                        <button
                          type="button"
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded ${visualMode === "pool"
                            ? "bg-white shadow-sm"
                            : "text-gray-500"
                            }`}
                          onClick={() => {
                            presetTemplateValue === undefined
                              ? message.error(
                                "Please select a preset template to choose Random From Pool"
                              )
                              : setVisualMode("pool");
                          }}
                        >
                          Random From Pool
                        </button>
                        <button
                          type="button"
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded ${visualMode === "manual"
                            ? "bg-white shadow-sm"
                            : "text-gray-500"
                            }`}
                          onClick={() => setVisualMode("manual")}
                        >
                          Manual Upload
                        </button>
                      </div>
                    </div>

                    {visualMode === "pool" ? (
                      <div className="border border-dashed border-gray-300 rounded-lg px-4 flex flex-col">
                        <div className="text-sm font-medium text-gray-700">
                          Image Pool
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {randomImagePoolFromPreset.map((img, index) => (
                            <img
                              key={`real-${index}`}
                              src={img}
                              alt=""
                              className="h-24 w-full object-cover rounded-md border border-gray-200"
                            />
                          ))}

                          {Array.from({ length: emptySlots }).map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="h-24 rounded-md bg-gray-100 border border-gray-200"
                            />
                          ))}
                        </div>

                        <div className="flex-grow flex items-center justify-center mt-2">
                          <div className="flex flex-col items-center gap-2">
                            <Button onClick={handleImageLibrary}>
                              View Image Library
                            </Button>
                            <Button
                              onClick={() =>
                                handleNavigateWithConfirm(`/image-pool/image-pool-details?poolId=${selectedPresetImagePool}&productName=${selectedPesetName}`)
                              }
                              type="link"
                            >
                              Add Image to Pool
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-row gap-2">
                          <Label>{t("mediaUpload", sourceKey.user)}</Label>
                          <Tooltip
                            title={
                              <span className="small-text-size">
                                {t("mediaUploadDesc", sourceKey.user)}
                              </span>
                            }
                          >
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <ImageUploadWithPreview
                          selectedImages={selectedImages}
                          setSelectedImages={setSelectedImages}
                          imagePreviews={imagePreviews}
                          setImagePreviews={setImagePreviews}
                          maxRequiredImages={5}
                          maxFileSize={100}
                          showCounter
                          gridCols="grid-cols-5 md:grid-cols-5"
                          imageHeight={180}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* VIDEO FACE */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    pointerEvents: mediaType === MEDIA_TYPE.VIDEO ? "auto" : "none",
                  }}
                  aria-hidden={mediaType !== MEDIA_TYPE.VIDEO}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center w-full">
                      <div className="flex gap-2 bg-gray-100 rounded-md p-1 w-full max-w-md">
                        <button
                          type="button"
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded ${visualMode === "pool"
                            ? "bg-white shadow-sm"
                            : "text-gray-500"
                            }`}
                          onClick={() => {
                            presetTemplateValue === undefined
                              ? message.error(
                                "Please select a preset template to choose Random From Pool"
                              )
                              : setVisualMode("pool");
                          }}
                        >
                          Random From Pool
                        </button>
                        <button
                          type="button"
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded ${visualMode === "manual"
                            ? "bg-white shadow-sm"
                            : "text-gray-500"
                            }`}
                          onClick={() => setVisualMode("manual")}
                        >
                          Manual Upload
                        </button>
                      </div>
                    </div>

                    {visualMode === "pool" ? (
                      <div className="border border-dashed border-gray-300 rounded-lg px-4 py-3 flex flex-col">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Video Pool
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {randomVideoPoolFromPreset.length > 0 ? (
                            randomVideoPoolFromPreset.map((url, index) => (
                              <video
                                key={`vidpool-${index}`}
                                src={url}
                                controls
                                preload="metadata"
                                className="h-24 w-full object-cover rounded-md border border-gray-200 bg-black"
                              />
                            ))
                          ) : (
                            Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={`vid-empty-${index}`}
                                className="h-24 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs"
                              >
                                No video yet
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex-grow flex items-center justify-center mt-3">
                          <Button
                            onClick={() =>
                              handleNavigateWithConfirm(`/video-pool/video-pool-details?poolId=${selectedPresetImagePool}&productName=${selectedPesetName}`)
                            }
                            type="link"
                          >
                            Add Video to Pool
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-row gap-2">
                          <Label>Video Upload</Label>
                          <Tooltip
                            title={
                              <span className="small-text-size">
                                Upload up to 3 short videos (MP4, MOV, or WebM, max 100MB each).
                              </span>
                            }
                          >
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <VideoUploadWithPreview
                          selectedVideos={selectedVideos}
                          setSelectedVideos={setSelectedVideos}
                          videoPreviews={videoPreviews}
                          setVideoPreviews={setVideoPreviews}
                          maxRequiredVideos={videoRandomLimit}
                          maxFileSize={100}
                          showCounter
                          gridCols="grid-cols-3 md:grid-cols-3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD C */}
          <Card
            title="Content Generation"
            className="flex-1"
            bodyStyle={{ padding: 10 }}
          >
            <div className="mt-4">

              {/* ================== AUTO GEN MODE  ================== */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1">
                  <Label className="!mb-0">Auto Mode</Label>
                </div>
                <Switch checked={autoModeEnabled} onChange={handleAutoModeToggle} />
                {showDuplicateWarning && (
                  <p className="text-red-500 text-xs mt-1">Turn off to proceed with manual generation</p>
                )}
              </div>

              {/* ================== NUMBER OF POST  ================== */}
              <div className="space-y-2">
                <Label className={autoModeEnabled ? "text-[#D0D5DD]" : ""}>
                  {t("numberOfPosts", sourceKey.user)}
                </Label>
                <NumberInput
                  fieldName="variationsPerPlatform"
                  rules={formRules.numberOfPosts}
                  placeholder={1}
                  disabled={autoModeEnabled}
                />
              </div>

              {/* ================== PLATFORM SELECTION ================== */}

              {/* <div className="space-y-2">
                <Label htmlFor="platform">
                  {t("platform", sourceKey.user) || "Platform"}
                </Label>
                <DropdownInput
                  fieldName="platform"
                  rules={formRules.platform}
                  options={platformOptions}
                  placeholder={t("selectPlatform", sourceKey.user)}
                />
              </div> */}

              {/* ================== OUTLET SELECTION ================== */}

              {userIdentity === "outlet" ? null : userIdentity ===
                "masterHQ" ? (
                <div className="space-y-2">
                  <Label>{t("outlet", sourceKey.user)}</Label>
                  <DropdownInput
                    fieldName="outletUserId"
                    rules={formRules.outlet}
                    options={outletOption}
                    disabled={userIdentity !== "masterHQ"}
                    placeholder={t("outlet", sourceKey.user)}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>{t("specialRemark", sourceKey.user)}{" "}
                  <Tooltip title={
                    <div>
                      <img src={LocationExample} ></img>
                      <p>{t("pinnedLocationTooltip", sourceKey.user)}</p>
                    </div>}>
                    <InfoCircleOutlined style={{ color: "#8c8c8c", cursor: "pointer" }} />
                  </Tooltip>
                </Label>
                <StringInput
                  fieldName="specialRemark"
                  placeholder={t("enterSpecialRemark", sourceKey.user)}
                  onBlur={(e) => {
                    const targetUserId =
                      userIdentity === "masterHQ"
                        ? form.getFieldValue("outletUserId")
                        : undefined;
                    updateSpecialRemark({
                      specialRemark: e.target.value,
                      ...(targetUserId ? { targetUserId } : {}),
                    });

                    if (userIdentity === "outlet" || (userIdentity === "masterHQ" && !targetUserId)) {
                      dispatch(updateBusinessInfo({ specialRemark: e.target.value }));
                    }
                  }}
                />
              </div>

              {/* ================== ROLE SELECTION ================== */}

              <div className="space-y-2">
                <Label>{t("nTrole", sourceKey.user)}</Label>
                <DropdownInput
                  fieldName="role"
                  rules={formRules.role}
                  options={roleOptions}
                  placeholder={t("nTselectRole", sourceKey.user)}
                />
              </div>

              {/* ================== LANGUAGE SELECTION ================== */}

              <div className="space-y-2">
                <Label>{t("language", sourceKey.user)}</Label>
                <DropdownInput
                  fieldName="language"
                  rules={formRules.language}
                  options={languageOptions}
                  placeholder={t("language", sourceKey.user)}
                />
              </div>

              {/* ================== STYLE  ================== */}

              {/* <div className="space-y-2">
                <Label>{t("writingStyle", sourceKey.user)}</Label>
                <DropdownInput
                  fieldName="style"
                  rules={formRules.writingStyle}
                  disabled={true}
                  options={[
                    // { title: t("pro", sourceKey.user), value: "pro" },
                    // { title: t("cute", sourceKey.user), value: "cute" },
                    // { title: t("joke", sourceKey.user), value: "joke" },
                    {
                      title: t("friendly", sourceKey.user),
                      value: "friendly",
                    },
                  ]}
                  placeholder={t("style", sourceKey.user)}
                />
              </div> */}

              {/* ================== WORDING  ================== */}

              <div className="space-y-2">
                <Label>{t("wording", sourceKey.user)}</Label>
                <DropdownInput
                  fieldName="contentLength"
                  rules={formRules.wording}
                  options={[
                    { title: "Long (120-150)", value: "long" },
                    { title: "Short (40-60)", value: "short" },
                  ]}
                  placeholder={t("select", sourceKey.user)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ================== GENERATE BUTTON ================== */}

      <div className="mt-2">
        <Button
          type="button"
          loading={loading}
          onClick={handleGenerateButtonClick}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {t("generateContent", sourceKey.user)}
        </Button>
      </div>
    </>
  );

  const handleUpdatePresetConfirm = async () => {
    if (pendingActionType === "autoMode") {
      await handleAutoModePresetDecision(true);
      return;
    }

    try {
      setUpdatePresetModalOpen(false);
      setPendingActionType(null);
      setLoading(true);
      const finalValues = { ...pendingGenerationValues, needUpdate: true };
      await executeGeneration(finalValues);
    } catch (error) {
      console.error("Update preset confirm error", error);
      message.error(error?.message || "Content generation failed. Please try again.");
      setLoading(false);
    }
  };

  const handleUpdatePresetCancel = async () => {
    if (pendingActionType === "autoMode") {
      await handleAutoModePresetDecision(false);
      return;
    }

    try {
      setUpdatePresetModalOpen(false);
      setPendingActionType(null);
      setLoading(true);
      const finalValues = { ...pendingGenerationValues, needUpdate: false };
      await executeGeneration(finalValues);
    } catch (error) {
      console.error("Update preset cancel error", error);
      message.error(error?.message || "Content generation failed. Please try again.");
      setLoading(false);
    }
  };

  const executeGeneration = async (correctValues) => {
    const res = await startChunkGeneration(correctValues);

    if (!res) {
      throw new Error("Content generation failed. Please try again.");
    }

    await refreshCreditBalance();
    document
      .getElementById("app-scroll-container")
      ?.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to Top of Upload Area
    setTimeout(() => {
      router.push({
        pathname: "/templates/pending-review",
      });
    }, 3000);
  };

  return (
    <Spin
      spinning={loading}
      tip={t("generatingContent", sourceKey.user) || "Generating content..."}
      size="large"
    >
      <Form form={form} onValuesChange={handleFormValuesChange}>
        {isCollapsed ? (
          <>
            {renderCollapsedLayout()}
            <div className="assistant-mobile-footer">
              <Button
                type="button"
                loading={loading}
                onClick={handleGenerateButtonClick}
                className="assistant-mobile-footer-button"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {t("generateContent", sourceKey.user)}
              </Button>
            </div>
          </>
        ) : (
          <>
            {renderDefaultLayout()}
          </>
        )}
      </Form>
      <SinglePopUpModal
        type="VisualPool"
        open={visualPoolOpen}
        onClose={() => setVisualPoolOpen(false)}
        closeable
        extraData={visualPoolImage}
      />
      <SinglePopUpModal
        type="updatePreset"
        open={updatePresetModalOpen}
        onClose={() => {
          setUpdatePresetModalOpen(false);
          setPendingActionType(null);
          setPendingGenerationValues(null);
          setPendingAutoModeData(null);
        }}
        confirmBtn1={handleUpdatePresetCancel}
        confirmBtn2={handleUpdatePresetConfirm}
        closeable={true}
        zIndex={2000}
      />
      <AutoModeRulesModal
        open={autoModeModalOpen}
        loading={autoModeLoading}
        onClose={handleAutoModeModalClose}
        onSubmit={handleAutoModeSubmit}
        modalWidth={isCollapsed ? "92vw" : 880}
        collapsed={isCollapsed}
      />
    </Spin>

    // PREVIOUS VERSION
    //  <Spin spinning={loading} tip={t('generatingContent', sourceKey.user) || 'Generating content...'} size="large">
    //   <Form form={form} onValuesChange={handleFormValuesChange}>
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    //       <div className="space-y-2">
    //         <Label htmlFor="presetTemplate">{t("presetTemplate", sourceKey.user)}</Label>
    //         <Tooltip title={<>
    //           <span className="small-text-size">{t("presetTemplateDesc2", sourceKey.user)}</span>
    //         </>}>
    //           <InfoCircleOutlined />
    //         </Tooltip>
    //         <DropdownInput
    //           fieldName="presetTemplate"
    //           options={[
    //             { title: "-- " + (t("noPresetTemplate", sourceKey.user) || "No Preset Template") + " --", value: "" },
    //             ...presetTemplates.map(preset => ({
    //               title: preset.presetName,
    //               value: preset._id
    //             }))
    //           ]}
    //           placeholder={t("selectTemplate", sourceKey.user)}
    //         />
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="platform">{t("platform", sourceKey.user) || "Platform"}</Label>

    //         <DropdownInput
    //           fieldName="platform"
    //           rules={formRules.platform}
    //           options={platformOptions}

    //           placeholder={t("selectPlatform", sourceKey.user) || "Select Platform"}
    //         />
    //       </div>
    //     </div>
    //     <div className="space-y-4">
    //       <Label htmlFor="style">{t("mediaUpload", sourceKey.user)}</Label>
    //       <Tooltip title={<>
    //         <span className="small-text-size">{t("mediaUploadDesc", sourceKey.user)}</span>
    //       </>}>
    //         <InfoCircleOutlined />
    //       </Tooltip>
    //       <ImageUploadWithPreview
    //         selectedImages={selectedImages}
    //         setSelectedImages={setSelectedImages}
    //         imagePreviews={imagePreviews}
    //         setImagePreviews={setImagePreviews}
    //         maxRequiredImages={30}
    //         maxFileSize={100}
    //         // containerHeight='calc(100vh - 70px)'
    //         showCounter={true}
    //         gridCols='grid-cols-5 md:grid-cols-5'
    //         imageHeight={180}
    //       />

    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="productName">{t("productName", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("titleDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <TextAreaInput
    //             rules={formRules.productName}
    //             fieldName="productName"
    //             placeholder={t("title", sourceKey.user)}
    //           />
    //         </div>
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="sellingPoint">{t("sellingHighlight", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("sellingPointDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <TextAreaInput
    //             fieldName="sellingPoint"
    //             rules={formRules.sellingHighlight}
    //             placeholder={t("sellingPoint", sourceKey.user)}
    //           />
    //         </div>

    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="promotional">{t("promotionalMessage", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("promotionalDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <TextAreaInput
    //             fieldName="promotional"
    //             rules={formRules.promotionalMessage}
    //             placeholder={t("promotional", sourceKey.user)}
    //           />
    //         </div>
    //       </div>
    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="category">{t("categoryType", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("categoryDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <DropdownInput
    //             fieldName="categoryId"
    //             options={categoryOption}
    //             rules={formRules.category}
    //             placeholder={t("category", sourceKey.user)}
    //           />
    //         </div>
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="outlet">{t("outlet", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("outletDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <DropdownInput
    //             fieldName="outletUserId"
    //             options={outletOption}
    //             rules={formRules.outlet}
    //             placeholder={t("outlet", sourceKey.user)}
    //             disabled={userIdentity !== 'masterHQ' ? true : false}
    //           />
    //         </div>
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="style">{t("language", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("languageDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <DropdownInput
    //             fieldName="language"
    //             options={[
    //               { title: "English", value: "english" },
    //               { title: "Chinese", value: "chinese" },
    //               // { title: "Malay", value: "malay" },
    //             ]}
    //             rules={formRules.language}
    //             placeholder={t("language", sourceKey.user)}
    //           />
    //         </div>
    //       </div>
    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="audience">{t("targetAudience", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("targetAudienceDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <StringInput
    //             fieldName="targetAudience"
    //             rules={formRules.targetAudience}
    //             placeholder={t("targetAudience", sourceKey.user)}
    //           />
    //         </div>

    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="style">{t("writingStyle", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("writingStyleDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <DropdownInput
    //             fieldName="style"
    //             options={[
    //               { title: t("pro", sourceKey.user), value: "pro" },
    //               { title: t("cute", sourceKey.user), value: "cute" },
    //               { title: t("joke", sourceKey.user), value: "joke" },
    //               { title: t("friendly", sourceKey.user), value: "friendly" },
    //             ]}
    //             placeholder={t("style", sourceKey.user)}
    //             rules={formRules.writingStyle}
    //           />
    //         </div>
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="style">{t("hashtag", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("hashtagDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <StringInput
    //             fieldName="hashtags"
    //             placeholder="#Hashtag"
    //           // rules={formRules.hashtag}
    //           />
    //         </div>
    //       </div>
    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="promotion">{t("wording", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("-", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <DropdownInput
    //             fieldName="contentLength"
    //             rules={formRules.wording}
    //             options={[
    //               { title: "Long (120-150)", value: "long" },
    //               { title: "Short (40-60)", value: "short" },
    //             ]}
    //             placeholder={t("select", sourceKey.user)}
    //           />
    //         </div>

    //         <div className="space-y-2 flex flex-col">
    //           <div className="flex items-center gap-1">
    //             <Label htmlFor="numberOfPost">{t("numberOfPosts", sourceKey.user)}</Label>
    //             <Tooltip title={<>
    //               <span className="small-text-size">{t("aiTextGenerationDesc", sourceKey.user)}</span>
    //             </>}>
    //               <InfoCircleOutlined />
    //             </Tooltip>
    //           </div>
    //           <NumberInput
    //             rules={formRules.numberOfPosts}
    //             fieldName="variationsPerPlatform"
    //             placeholder={0}
    //           />
    //         </div>
    //       </div>

    //       {/* Generation Buttons */}
    //       <div className="space-y-3">

    //         {/* Progress Tracking Button */}
    //         <Button
    //           type="button"
    //           loading={loading}
    //           onClick={generateAIContent}
    //           // disabled={loading || selectedImages.length !== requiredImages || isGenerating}
    //           // onClick={generateAIContentWithProgress}
    //           className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    //         >
    //           <Wand2 className="h-4 w-4 mr-2" />
    //           {t("generateContent", sourceKey.user)}
    //         </Button>
    //       </div>
    //     </div >
    //   </Form>
    // </Spin>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(AIAssistantForm);
