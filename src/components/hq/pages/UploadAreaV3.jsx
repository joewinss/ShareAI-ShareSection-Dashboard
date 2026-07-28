import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { message } from "antd";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import startVisualGenerationAndQueue from "@/pages/api/visualCategory/startVisualGenerationAndQueue";
import { useRefreshCreditBalance } from "@/hooks/useCreditBalance";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { VISUAL_CATEGORY_STATUS } from "@/constants/image";
import {
  StepKey,
  UICONFIG_NEEDED_TO_HAVE_MULTISELCTION,
  VISUAL_INDUSTRY_CODES,
} from "@/constants/visualMode";
import {
  VISUAL_INPUT_FIELDS,
  getPayloadFieldEntries,
} from "@/constants/visualInputFields";
import VisualDynamicInputV2 from "../components/uploadArea/VisualDynamicInputV2";

const VALID_VISUAL_INDUSTRY_CODES = VISUAL_INDUSTRY_CODES;
const defaultGradient = "bg-gradient-to-r from-green-500 to-blue-500";

const normalizeIndustryCode = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const resolvePreview = (candidate) => {
  if (!candidate) return null;
  if (typeof candidate === "string") return candidate;
  if (typeof candidate === "object" && candidate.url) return candidate.url;
  return null;
};

const findConfigByKey = (selectedRecord, stepKey) => {
  const list = Array.isArray(selectedRecord?.uiConfig)
    ? selectedRecord.uiConfig
    : [];
  return (
    list.find((item) => {
      const key = typeof item?.key === "string" ? item.key.trim() : "";
      return key === stepKey;
    }) || null
  );
};

const UploadAreaV3 = ({ mode, selectedGradient = defaultGradient }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentMode = Array.isArray(mode) ? mode[0] : mode || "";
  const rawPreloadUrl = router.query.preloadUrl;
  const preloadUrl = Array.isArray(rawPreloadUrl)
    ? rawPreloadUrl[0]
    : rawPreloadUrl || "";
  const refreshCreditBalance = useRefreshCreditBalance();

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [maxRequiredImages, setMaxRequiredImages] = useState(1);
  const [minRequiredImages, setMinRequiredImages] = useState(0);
  const [isFurnitureStyle, setIsFurnitureStyle] = useState(false);
  const [param, setParam] = useState("");
  const [availableModes, setAvailableModes] = useState([]);

  const requiredImages = minRequiredImages || 1;
  const hasMinImages = selectedImages.length >= requiredImages;

  const getFieldValue = useCallback(
    (key) => {
      const value = fieldValues[key];
      return typeof value === "string" ? value : "";
    },
    [fieldValues]
  );

  const updateFieldValue = useCallback((key, value) => {
    setFieldValues((prev) => {
      const config = VISUAL_INPUT_FIELDS[key];
      const next = { ...prev, [key]: value };
      (config?.cascadeReset || []).forEach((resetKey) => {
        next[resetKey] = "";
      });
      return next;
    });
  }, []);

  const selectedType = getFieldValue(StepKey.PARAM);
  const selectedAngle = getFieldValue(StepKey.CAMERA);
  const selectedInteriorStyle = getFieldValue(StepKey.STYLE);
  const selectedFlooring = getFieldValue(StepKey.FLOORING);
  const selectedView1 = getFieldValue(StepKey.VIEW1);
  const selectedView2 = getFieldValue(StepKey.VIEW2);
  const selectedView3 = getFieldValue(StepKey.VIEW3);
  const selectedView4 = getFieldValue(StepKey.VIEW4);
  const selectedContentMode = getFieldValue(StepKey.CONTENT);

  useEffect(() => {
    setSelectedImages([]);
    setImagePreviews([]);
    setFieldValues({});
    setSelectedRecord(null);
    setMaxRequiredImages(1);
    setMinRequiredImages(0);
    setIsFurnitureStyle(false);
    setParam("");
  }, [currentMode]);

  useEffect(() => {
    const decodedMode =
      typeof currentMode === "string"
        ? decodeURIComponent(currentMode)
        : currentMode;
    const query = { status: VISUAL_CATEGORY_STATUS.ACTIVE };
    if (decodedMode) {
      query.title = decodedMode;
    }

    setIsFetching(true);
    getVisualCategoryListings(decodedMode ? 1 : 100, 0, query)
      .then((res) => {
        const list = Array.isArray(res?.data)
          ? res.data.filter((entry) => entry && Object.keys(entry).length)
          : [];
        const normalized = list
          .map((record) => ({
            id: record?._id,
            title: record?.title || "",
            param: record?.param || [],
            uiConfig: Array.isArray(record?.uiConfig) ? record.uiConfig : [],
            modes: Array.isArray(record?.modes) ? record.modes : [],
            credits: record?.creditCost ?? record?.credits ?? 0,
            imageInputMaxCount: record?.imageInputMaxCount,
            imageInputMinCount: record?.imageInputMinCount,
            visualIndustry: record?.visualIndustry,
          }))
          .filter((item) => item.title);

        setAvailableModes(normalized.map((record) => record.title));

        const match =
          normalized.find((record) => record.title === decodedMode) ||
          normalized[0] ||
          null;

        setMaxRequiredImages(match?.imageInputMaxCount ?? 1);
        setMinRequiredImages(match?.imageInputMinCount ?? 0);
        setIsFurnitureStyle(
          !!(
            Array.isArray(match?.uiConfig) &&
            match.uiConfig.find(
              (item) =>
                typeof item?.key === "string" &&
                item.key.trim() === UICONFIG_NEEDED_TO_HAVE_MULTISELCTION.PARAM
            )
          )
        );
        setParam(match?.param?.[0]?.name || "");
        setSelectedRecord(match);
        updateFieldValue(StepKey.PARAM, "");
      })
      .catch((err) => {
        console.error("Failed to load visual categories:", err);
        message.error(err?.message || "Failed to load modes");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [currentMode, updateFieldValue]);

  const styleOptions = useMemo(
    () =>
      Array.isArray(selectedRecord?.param) && selectedRecord.param.length
        ? selectedRecord.param.map((style, idx) => {
            const sample = Array.isArray(style?.samplePhoto)
              ? style.samplePhoto[0]
              : style?.samplePhoto;
            const allSamples = Array.isArray(style?.samplePhoto)
              ? style.samplePhoto.map((item) => resolvePreview(item)).filter(Boolean)
              : [];
            return {
              id: style?.name || `style-${idx}`,
              label: style?.name || `Style ${idx + 1}`,
              previewImage: resolvePreview(sample),
              samplePhotos: allSamples,
            };
          })
        : [],
    [selectedRecord]
  );

  const selectedStyle = useMemo(
    () => styleOptions.find((option) => option.id === selectedType),
    [selectedType, styleOptions]
  );

  const angleOptions = useMemo(() => {
    const apiModes = Array.isArray(selectedRecord?.modes)
      ? selectedRecord.modes.filter((item) => item && (item.type || item.name))
      : [];
    if (!apiModes.length) return [];

    const samples = selectedStyle?.samplePhotos || [];
    return apiModes.map((item, idx) => {
      const modeName = item.type || item.name || `mode-${idx}`;
      return {
        id: modeName,
        label: t(modeName, sourceKey.user) || modeName,
        previewImage: resolvePreview(
          samples[idx] ||
            samples[0] ||
            (Array.isArray(item?.samplePhoto)
              ? item.samplePhoto[0]
              : item?.samplePhoto)
        ),
        creditCost: item?.creditCost,
      };
    });
  }, [selectedRecord, selectedStyle, t]);

  const ratioConfig = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.RATIO),
    [selectedRecord]
  );
  const unitConfig = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.UNIT),
    [selectedRecord]
  );
  const styleConfig = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.STYLE),
    [selectedRecord]
  );
  const flooringConfig = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.FLOORING),
    [selectedRecord]
  );
  const view1Config = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.VIEW1),
    [selectedRecord]
  );
  const view2Config = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.VIEW2),
    [selectedRecord]
  );
  const view3Config = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.VIEW3),
    [selectedRecord]
  );
  const view4Config = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.VIEW4),
    [selectedRecord]
  );
  const contentConfig = useMemo(
    () => findConfigByKey(selectedRecord, StepKey.CONTENT),
    [selectedRecord]
  );

  const contentOptions = useMemo(
    () => (Array.isArray(contentConfig?.options) ? contentConfig.options : []),
    [contentConfig]
  );
  const interiorStyleOptions = useMemo(
    () => (Array.isArray(styleConfig?.options) ? styleConfig.options : []),
    [styleConfig]
  );
  const flooringOptions = useMemo(
    () => (Array.isArray(flooringConfig?.options) ? flooringConfig.options : []),
    [flooringConfig]
  );
  const view1Options = useMemo(
    () => (Array.isArray(view1Config?.options) ? view1Config.options : []),
    [view1Config]
  );
  const view2Options = useMemo(
    () => (Array.isArray(view2Config?.options) ? view2Config.options : []),
    [view2Config]
  );
  const view3Options = useMemo(
    () => (Array.isArray(view3Config?.options) ? view3Config.options : []),
    [view3Config]
  );
  const view4Options = useMemo(
    () => (Array.isArray(view4Config?.options) ? view4Config.options : []),
    [view4Config]
  );

  useEffect(() => {
    if (!contentOptions.length) {
      updateFieldValue(StepKey.CONTENT, "");
      return;
    }
    setFieldValues((prev) => {
      const currentValue = prev[StepKey.CONTENT];
      if (contentOptions.includes(currentValue)) return prev;
      return { ...prev, [StepKey.CONTENT]: contentOptions[0] };
    });
  }, [contentOptions, updateFieldValue]);

  useEffect(() => {
    if (selectedContentMode !== "auto") return;
    setFieldValues((prev) => ({
      ...prev,
      [StepKey.TITLE]: "",
      [StepKey.SUBTITLE]: "",
    }));
  }, [selectedContentMode]);

  useEffect(() => {
    if (
      selectedInteriorStyle &&
      !interiorStyleOptions.includes(selectedInteriorStyle)
    ) {
      updateFieldValue(StepKey.STYLE, "");
    }
  }, [interiorStyleOptions, selectedInteriorStyle, updateFieldValue]);

  useEffect(() => {
    if (selectedFlooring && !flooringOptions.includes(selectedFlooring)) {
      updateFieldValue(StepKey.FLOORING, "");
    }
  }, [flooringOptions, selectedFlooring, updateFieldValue]);

  useEffect(() => {
    if (selectedView1 && !view1Options.includes(selectedView1)) {
      updateFieldValue(StepKey.VIEW1, "");
    }
  }, [selectedView1, updateFieldValue, view1Options]);

  useEffect(() => {
    if (selectedView2 && !view2Options.includes(selectedView2)) {
      updateFieldValue(StepKey.VIEW2, "");
    }
  }, [selectedView2, updateFieldValue, view2Options]);

  useEffect(() => {
    if (selectedView3 && !view3Options.includes(selectedView3)) {
      updateFieldValue(StepKey.VIEW3, "");
    }
  }, [selectedView3, updateFieldValue, view3Options]);

  useEffect(() => {
    if (selectedView4 && !view4Options.includes(selectedView4)) {
      updateFieldValue(StepKey.VIEW4, "");
    }
  }, [selectedView4, updateFieldValue, view4Options]);

  useEffect(() => {
    if (selectedAngle && !angleOptions.find((option) => option.id === selectedAngle)) {
      updateFieldValue(StepKey.CAMERA, "");
    }
  }, [angleOptions, selectedAngle, updateFieldValue]);

  const handleModeChange = useCallback(
    (newMode) => {
      if (newMode && newMode !== currentMode) {
        router.push({ pathname: "/hq/upload", query: { mode: newMode } });
      }
    },
    [currentMode, router]
  );

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/hq/upload");
  }, [router]);

  const generatePhoto = useCallback(async () => {
    try {
      const hasImageInputStep =
        Array.isArray(selectedRecord?.uiConfig) &&
        selectedRecord.uiConfig.some((item) => {
          const key = typeof item?.key === "string" ? item.key.trim() : "";
          return key === StepKey.UPLOAD || key === StepKey.SELECT_IMAGE;
        });
      const hasSelectImageStep =
        Array.isArray(selectedRecord?.uiConfig) &&
        selectedRecord.uiConfig.some((item) => {
          const key = typeof item?.key === "string" ? item.key.trim() : "";
          return key === StepKey.SELECT_IMAGE;
        });

      if (hasImageInputStep && !hasMinImages) {
        message.error(
          `Please ${hasSelectImageStep ? "select" : "upload"} at least ${requiredImages} image${requiredImages > 1 ? "s" : ""} to generate`
        );
        return false;
      }

      const visualIndustry = normalizeIndustryCode(
        selectedRecord?.visualIndustry?.industryCode
      );
      if (!visualIndustry) {
        message.error("Visual industry is missing for this mode.");
        return false;
      }
      if (!VALID_VISUAL_INDUSTRY_CODES.includes(visualIndustry)) {
        message.error("Visual industry is invalid for this mode.");
        return false;
      }

      const formData = new FormData();
      const appendValue = (payloadKey, value) => {
        const normalizedValue =
          typeof value === "string" ? value.trim() : value;
        if (
          normalizedValue !== undefined &&
          normalizedValue !== null &&
          normalizedValue !== ""
        ) {
          formData.append(payloadKey, String(normalizedValue));
        }
      };

      selectedImages.forEach((image) => {
        if (image !== undefined && image !== null && image !== "") {
          formData.append("images[]", image);
        }
      });

      appendValue("type", isFurnitureStyle ? selectedType : param);

      getPayloadFieldEntries().forEach(([key, config]) => {
        if (config.skipPayloadWhen) {
          const otherValue = getFieldValue(config.skipPayloadWhen.key);
          if (otherValue === config.skipPayloadWhen.value) return;
        }
        appendValue(config.payloadKey, getFieldValue(key));
      });

      await startVisualGenerationAndQueue(formData, visualIndustry, {
        requireImages: hasImageInputStep,
      });
      await refreshCreditBalance();
      message.success("Visual generation started successfully!");
      return true;
    } catch (error) {
      console.error("Content generation failed:", error);
      message.error(error?.message || "Failed to generate visuals");
      return false;
    }
  }, [
    getFieldValue,
    hasMinImages,
    isFurnitureStyle,
    param,
    refreshCreditBalance,
    requiredImages,
    selectedImages,
    selectedRecord,
    selectedType,
  ]);

  return (
    <VisualDynamicInputV2
      requiredUI={selectedRecord?.uiConfig}
      currentMode={selectedRecord?.title || currentMode}
      availableModes={availableModes}
      onModeChange={handleModeChange}
      onBack={handleBack}
      onGenerate={generatePhoto}
      isFetching={isFetching}
      hasMinImages={hasMinImages}
      selectedImages={selectedImages}
      setSelectedImages={setSelectedImages}
      imagePreviews={imagePreviews}
      setImagePreviews={setImagePreviews}
      maxRequiredImages={maxRequiredImages}
      minRequiredImages={minRequiredImages}
      styleOptions={styleOptions}
      angleOptions={angleOptions}
      ratioConfig={ratioConfig}
      unitConfig={unitConfig}
      styleConfig={styleConfig}
      flooringConfig={flooringConfig}
      view1Config={view1Config}
      view2Config={view2Config}
      view3Config={view3Config}
      view4Config={view4Config}
      contentConfig={contentConfig}
      selectedGradient={selectedGradient}
      t={t}
      preloadUrl={preloadUrl}
      fieldValues={fieldValues}
      onFieldChange={updateFieldValue}
    />
  );
};

export default UploadAreaV3;
