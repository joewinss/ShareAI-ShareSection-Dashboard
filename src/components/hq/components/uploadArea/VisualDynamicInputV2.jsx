import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { message } from "antd";
import getGeneratedVisualContent from "@/pages/api/visualCategory/getGeneratedVisualContent";
import * as Assets from "../../../../../public/assets";
import {
  convertGeneratedImageUrlsToFiles,
  extractGeneratedVisualImageUrls,
} from "./selectImageUtils";
import {
  TEXT_INPUT_FALLBACKS,
  VISUAL_INPUT_TYPE,
  getVisualInputFieldConfig,
} from "@/constants/visualInputFields";
import {
  INPUT_RENDERERS,
  UnsupportedFieldRenderer,
} from "./visualInputRenderers";
import { sourceKey } from "@/locales/config";
import LeftPanel from "./LeftPanel";
import ModeTitleBar from "./ModeTitleBar";
import RightPanel from "./RightPanel";
import StepNavBar from "./StepNavBar";

const MODEL_IMG_DEFAULTS = { gender: "F", age: "21", hair: "L" };
const TEXT_LIKE_TYPES = [
  VISUAL_INPUT_TYPE.TEXT,
  VISUAL_INPUT_TYPE.TEXTAREA,
  VISUAL_INPUT_TYPE.COLOR,
];
const CHOICE_TYPES = [
  VISUAL_INPUT_TYPE.IMAGE_GRID_SQUARE,
  VISUAL_INPUT_TYPE.IMAGE_GRID_PORTRAIT,
  VISUAL_INPUT_TYPE.PILL_SELECT,
];

const normalizeRequiredUI = (requiredUI) => {
  if (!Array.isArray(requiredUI)) return [];

  return requiredUI
    .map((item) => {
      const rawKey = typeof item === "string" ? item : item?.key;
      if (!rawKey) return null;
      const key = String(rawKey).trim();
      const config = getVisualInputFieldConfig(key);

      return {
        ...(config || {}),
        id: key,
        key,
        input: key,
        inputType: config?.inputType,
        label:
          typeof item === "object" && item?.label
            ? item.label
            : config?.label,
        required:
          typeof item === "object" && typeof item?.required === "boolean"
            ? item.required
            : undefined,
        placeholder:
          typeof item === "object"
            ? item?.placeHolder || item?.placeholder || config?.placeholder
            : config?.placeholder,
        options:
          typeof item === "object" && Array.isArray(item?.options)
            ? item.options
            : [],
        industryCode:
          typeof item === "object" && typeof item?.industryCode === "string"
            ? item.industryCode.trim().toLowerCase()
            : "",
        isUnknown: !config,
      };
    })
    .filter(Boolean);
};

const buildModelImageUrl = (race, gender, age, hair) => {
  if (!race) return null;
  const g = gender || MODEL_IMG_DEFAULTS.gender;
  const a = age || MODEL_IMG_DEFAULTS.age;
  const h = hair || MODEL_IMG_DEFAULTS.hair;
  return Assets[`${race}_${g}_${a}_${h}`] ?? null;
};

const applyWordLimit = (value) => {
  const rawValue = typeof value === "string" ? value : "";
  const words = rawValue.trim().split(/\s+/).filter(Boolean);
  return words.length <= 20 ? rawValue : words.slice(0, 20).join(" ");
};

const normalizeOption = (option, t, translateOptions) => {
  if (option && typeof option === "object") {
    return {
      id: option.id ?? option.value ?? option.label,
      label: option.label ?? option.title ?? option.value ?? option.id,
    };
  }

  const id = String(option);
  return {
    id,
    label: translateOptions && t ? String(t(id, sourceKey.user)) : id,
  };
};

const resolvePreviewUrl = (preview) => {
  if (!preview) return null;
  if (typeof preview === "string") return preview;
  if (typeof preview === "object") {
    return preview.preview || preview.url || null;
  }
  return null;
};

const getFieldStep = (entry) => {
  const { inputType, required } = entry;
  if (
    inputType === VISUAL_INPUT_TYPE.IMAGE_UPLOAD ||
    inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT
  ) {
    return 1;
  }
  if (required === false) return 3;
  if (TEXT_LIKE_TYPES.includes(inputType)) return required === true ? 2 : 3;
  return 2;
};

const VisualDynamicInputV2 = ({
  requiredUI,
  currentMode,
  availableModes = [],
  onModeChange,
  onBack,
  onGenerate,
  isFetching = false,
  hasMinImages,
  selectedImages = [],
  setSelectedImages,
  imagePreviews = [],
  setImagePreviews,
  maxRequiredImages = 10,
  minRequiredImages = 0,
  styleOptions = [],
  angleOptions = [],
  ratioConfig,
  unitConfig,
  styleConfig,
  flooringConfig,
  view1Config,
  view2Config,
  view3Config,
  view4Config,
  contentConfig,
  selectedGradient,
  t,
  preloadUrl = "",
  fieldValues = {},
  onFieldChange,
}) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [lastEditStep, setLastEditStep] = useState(1);
  const [isMerging, setIsMerging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectImageUrls, setSelectImageUrls] = useState([]);
  const [selectedSelectImageUrls, setSelectedSelectImageUrls] = useState(
    () => new Set()
  );
  const [selectImageLoading, setSelectImageLoading] = useState(false);
  const [selectImagePreparing, setSelectImagePreparing] = useState(false);
  const appliedPreloadUrl = useRef(null);
  const fieldRowRefs = useRef({});

  const requiredEntries = useMemo(
    () => normalizeRequiredUI(requiredUI),
    [requiredUI]
  );

  const ratioOptions = Array.isArray(ratioConfig?.options)
    ? ratioConfig.options
    : [];
  const unitOptions = Array.isArray(unitConfig?.options)
    ? unitConfig.options
    : [];
  const interiorStyleOptions = Array.isArray(styleConfig?.options)
    ? styleConfig.options
    : [];
  const flooringOptions = Array.isArray(flooringConfig?.options)
    ? flooringConfig.options
    : [];
  const view1Options = Array.isArray(view1Config?.options)
    ? view1Config.options
    : [];
  const view2Options = Array.isArray(view2Config?.options)
    ? view2Config.options
    : [];
  const view3Options = Array.isArray(view3Config?.options)
    ? view3Config.options
    : [];
  const view4Options = Array.isArray(view4Config?.options)
    ? view4Config.options
    : [];
  const contentOptions = Array.isArray(contentConfig?.options)
    ? contentConfig.options
    : [];

  const selectImageConfig = useMemo(
    () =>
      requiredEntries.find(
        (entry) => entry.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT
      ) || null,
    [requiredEntries]
  );
  const selectImageIndustryCode = selectImageConfig?.industryCode || "";
  const requiredImageCount = minRequiredImages || 1;

  const getFieldValue = useCallback(
    (key) => {
      const value = fieldValues[key];
      return typeof value === "string" ? value : "";
    },
    [fieldValues]
  );

  const resolveInputLabel = useCallback(
    (step) =>
      step?.label || TEXT_INPUT_FALLBACKS[step?.key]?.label || step?.key || "",
    []
  );

  const resolveInputPlaceholder = useCallback(
    (step) =>
      step?.placeholder || TEXT_INPUT_FALLBACKS[step?.key]?.placeholder || "",
    []
  );

  const updateField = useCallback(
    (step, value) => {
      if (!onFieldChange || !step?.key) return;
      const nextValue =
        step.inputType === VISUAL_INPUT_TYPE.TEXT ||
        step.inputType === VISUAL_INPUT_TYPE.TEXTAREA
          ? applyWordLimit(value)
          : value;
      onFieldChange(step.key, nextValue);
    },
    [onFieldChange]
  );

  const getStepOptions = useCallback(
    (step) => {
      const sourceOptions = step.optionSource
        ? { styleOptions, angleOptions }[step.optionSource]
        : step.options;
      return Array.isArray(sourceOptions) ? sourceOptions : [];
    },
    [angleOptions, styleOptions]
  );

  const visibleEntries = useMemo(() => {
    const list = [];
    const seen = new Set();
    requiredEntries.forEach((entry) => {
      if (
        entry.hideWhen &&
        getFieldValue(entry.hideWhen.key) === entry.hideWhen.value
      ) {
        return;
      }
      if (!seen.has(entry.id)) {
        list.push(entry);
        seen.add(entry.id);
      }
    });
    return list;
  }, [getFieldValue, requiredEntries]);

  const imageFields = useMemo(
    () => visibleEntries.filter((entry) => getFieldStep(entry) === 1),
    [visibleEntries]
  );
  const requiredFields = useMemo(
    () => visibleEntries.filter((entry) => getFieldStep(entry) === 2),
    [visibleEntries]
  );
  const optionalFields = useMemo(
    () => visibleEntries.filter((entry) => getFieldStep(entry) === 3),
    [visibleEntries]
  );

  const stepSequence = useMemo(() => {
    const sequence = [];
    if (imageFields.length) sequence.push({ id: "image", label: "Image" });
    if (requiredFields.length) {
      sequence.push({ id: "settings", label: "Settings" });
    }
    if (optionalFields.length) {
      sequence.push({ id: "optional", label: "Optional" });
    }
    sequence.push({ id: "generate", label: "Generate" });
    return sequence;
  }, [imageFields.length, optionalFields.length, requiredFields.length]);

  const totalSteps = stepSequence.length;
  const activeStepId = stepSequence[activeStep - 1]?.id ?? "settings";

  const isStep2Complete = useMemo(() => {
    if (isFetching) return false;
    return requiredFields.every((field) => {
      if (field.isUnknown || !field.inputType) return true;
      if (CHOICE_TYPES.includes(field.inputType)) {
        const options = getStepOptions(field);
        return options.length ? !!getFieldValue(field.key) : true;
      }
      if (TEXT_LIKE_TYPES.includes(field.inputType)) {
        return !!getFieldValue(field.key).trim();
      }
      return true;
    });
  }, [getFieldValue, getStepOptions, isFetching, requiredFields]);

  const canGenerate = useMemo(
    () =>
      isStep2Complete &&
      !selectImagePreparing &&
      (imageFields.length === 0 || hasMinImages),
    [hasMinImages, imageFields.length, isStep2Complete, selectImagePreparing]
  );

  const uploadedImagePreview = resolvePreviewUrl(imagePreviews?.[0]);
  const selectedLibraryImagePreview =
    selectedSelectImageUrls.values().next().value ?? null;
  const imagePreview = uploadedImagePreview ?? selectedLibraryImagePreview ?? null;

  const modelPreviewUrl = useMemo(() => {
    const race = fieldValues["race"];
    if (!race) return null;
    return buildModelImageUrl(
      race,
      fieldValues["gender"],
      fieldValues["age"],
      fieldValues["hair"]
    );
  }, [fieldValues]);

  const stylePreviewUrl = useMemo(() => {
    const paramValue = fieldValues["param"];
    const selectedStyle = paramValue
      ? styleOptions.find(
          (opt) => String(opt.id ?? opt.value ?? opt) === String(paramValue)
        )
      : null;
    const stylePreview = selectedStyle?.previewImage ?? null;

    const angleValue = fieldValues["cameraAngle"];
    if (!angleValue) return stylePreview;

    const selectedAngle = angleOptions.find(
      (opt) => String(opt.id ?? opt.value ?? opt) === String(angleValue)
    );
    return resolvePreviewUrl(selectedAngle?.previewImage) ?? stylePreview;
  }, [angleOptions, fieldValues, styleOptions]);

  const getFieldSummaryValue = useCallback(
    (field) => {
      const value = getFieldValue(field.key);
      if (!value) return "";
      if (CHOICE_TYPES.includes(field.inputType)) {
        const selectedOption = getStepOptions(field)
          .map((option) => normalizeOption(option, t, field.translateOptions))
          .find((option) => String(option.id) === String(value));
        return selectedOption?.label || value;
      }
      return value;
    },
    [getFieldValue, getStepOptions, t]
  );

  const valuePanelFields = useMemo(
    () =>
      [...requiredFields, ...optionalFields].map((field) => {
        const bucket = getFieldStep(field);
        const targetId = bucket === 2 ? "settings" : "optional";
        const stepNum = stepSequence.findIndex((step) => step.id === targetId) + 1;
        return {
          key: field.key,
          label: resolveInputLabel(field),
          step: stepNum > 0 ? stepNum : 1,
          value: getFieldSummaryValue(field),
        };
      }),
    [
      getFieldSummaryValue,
      optionalFields,
      requiredFields,
      resolveInputLabel,
      stepSequence,
    ]
  );

  const navigateToField = useCallback((key, step) => {
    setIsMerging(false);
    setActiveStep(step);
    setTimeout(() => {
      const el = fieldRowRefs.current[key];
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      el.classList.add("shining");
      setTimeout(() => el.classList.remove("shining"), 1600);
    }, 80);
  }, []);

  const handleClearAll = useCallback(() => {
    valuePanelFields.forEach((field) => {
      onFieldChange?.(field.key, "");
    });
    setSelectedImages?.([]);
    setImagePreviews?.([]);
    setSelectedSelectImageUrls(new Set());
  }, [onFieldChange, setImagePreviews, setSelectedImages, valuePanelFields]);

  const goStep = useCallback(
    (stepNum) => {
      if (stepNum >= totalSteps) {
        if (!canGenerate) return;
        setLastEditStep(Math.max(1, Math.min(activeStep, totalSteps - 1)));
        setIsMerging(true);
        return;
      }

      const nextStep = Math.max(1, Math.min(stepNum, totalSteps));
      setIsMerging(false);
      setActiveStep(nextStep);
      setLastEditStep(nextStep);
    },
    [activeStep, canGenerate, totalSteps]
  );

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;
    setIsMerging(true);
    setIsGenerating(true);
    try {
      const result = await Promise.resolve(onGenerate?.());
      if (result !== false) {
        message.success("Added to queue successfully!");
        router.back();
      }
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, isGenerating, onGenerate, router]);

  const handleBackToEdit = useCallback(() => {
    setIsMerging(false);
    setActiveStep(Math.max(1, Math.min(lastEditStep, totalSteps - 1)));
  }, [lastEditStep, totalSteps]);

  const refreshSelectImages = useCallback(() => {
    if (!selectImageIndustryCode) {
      setSelectImageUrls([]);
      return;
    }

    setSelectImageLoading(true);
    getGeneratedVisualContent("all", 0, {
      visualIndustryCode: selectImageIndustryCode,
    })
      .then((res) => setSelectImageUrls(extractGeneratedVisualImageUrls(res)))
      .catch((err) => {
        console.error("Failed to load generated visuals for selection", err);
        message.error(err?.message || "Failed to load generated images");
        setSelectImageUrls([]);
      })
      .finally(() => setSelectImageLoading(false));
  }, [selectImageIndustryCode]);

  const toggleSelectImageUrl = useCallback(
    (url) => {
      if (!url) return;
      setSelectedSelectImageUrls((prev) => {
        const next = new Set(prev);
        if (next.has(url)) {
          next.delete(url);
          return next;
        }
        if (next.size >= maxRequiredImages) {
          const oldestUrl = next.values().next().value;
          if (oldestUrl) next.delete(oldestUrl);
          message.info(
            maxRequiredImages === 1
              ? "Maximum 1 image selected. Replaced the previous image."
              : `Maximum ${maxRequiredImages} images selected. Replaced the oldest image.`
          );
        }
        next.add(url);
        return next;
      });
    },
    [maxRequiredImages]
  );

  const rendererContext = useMemo(
    () => ({
      t,
      fieldValues,
      buildModelImageUrl,
      selectedGradient,
      selectedImages,
      setSelectedImages,
      imagePreviews,
      setImagePreviews,
      maxRequiredImages,
      minRequiredImages,
      requiredImageCount,
      styleOptions,
      angleOptions,
      ratioOptions,
      unitOptions,
      interiorStyleOptions,
      flooringOptions,
      view1Options,
      view2Options,
      view3Options,
      view4Options,
      contentOptions,
      selectImageUrls,
      selectedSelectImageUrls,
      selectImageLoading,
      selectImagePreparing,
      selectImageIndustryCode,
      visualGeneratorFlow: true,
      refreshSelectImages,
      toggleSelectImageUrl,
      goToUpload: () => router.push("/hq/upload"),
    }),
    [
      angleOptions,
      contentOptions,
      fieldValues,
      flooringOptions,
      imagePreviews,
      interiorStyleOptions,
      maxRequiredImages,
      minRequiredImages,
      ratioOptions,
      refreshSelectImages,
      requiredImageCount,
      router,
      selectImageIndustryCode,
      selectImageLoading,
      selectImagePreparing,
      selectImageUrls,
      selectedGradient,
      selectedImages,
      selectedSelectImageUrls,
      setImagePreviews,
      setSelectedImages,
      styleOptions,
      t,
      toggleSelectImageUrl,
      unitOptions,
      view1Options,
      view2Options,
      view3Options,
      view4Options,
    ]
  );

  const renderField = useCallback(
    (entry, { hideLabel = false } = {}) => {
      const Renderer = INPUT_RENDERERS[entry.inputType] || UnsupportedFieldRenderer;
      return (
        <Renderer
          field={{
            ...entry,
            label: hideLabel ? "" : resolveInputLabel(entry),
            placeholder: resolveInputPlaceholder(entry),
          }}
          value={getFieldValue(entry.key)}
          onChange={(value) => updateField(entry, value)}
          context={rendererContext}
        />
      );
    },
    [
      getFieldValue,
      rendererContext,
      resolveInputLabel,
      resolveInputPlaceholder,
      updateField,
    ]
  );

  useEffect(() => {
    setSelectedSelectImageUrls(new Set());
    setSelectImageUrls([]);
    setActiveStep(1);
    setLastEditStep(1);
    setIsMerging(false);
    setIsGenerating(false);
  }, [requiredUI]);

  useEffect(() => {
    if (!selectImageConfig) {
      setSelectImageUrls([]);
      setSelectedSelectImageUrls(new Set());
      return;
    }
    refreshSelectImages();
  }, [refreshSelectImages, selectImageConfig]);

  useEffect(() => {
    if (
      !preloadUrl ||
      appliedPreloadUrl.current === preloadUrl ||
      !selectImageUrls.length
    ) {
      return;
    }
    if (selectImageUrls.includes(preloadUrl)) {
      toggleSelectImageUrl(preloadUrl);
      appliedPreloadUrl.current = preloadUrl;
    }
  }, [preloadUrl, selectImageUrls, toggleSelectImageUrl]);

  useEffect(() => {
    if (!selectImageConfig || !setSelectedImages) return;
    const urls = Array.from(selectedSelectImageUrls);
    if (!urls.length) {
      setSelectedImages([]);
      setSelectImagePreparing(false);
      return;
    }

    let cancelled = false;
    setSelectImagePreparing(true);
    convertGeneratedImageUrlsToFiles(urls)
      .then((files) => {
        if (!cancelled) setSelectedImages(files);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to prepare selected generated images", err);
        message.error(err?.message || "Failed to prepare selected images");
        setSelectedImages([]);
      })
      .finally(() => {
        if (!cancelled) setSelectImagePreparing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectImageConfig, selectedSelectImageUrls, setSelectedImages]);

  useEffect(() => {
    const unknownKeys = visibleEntries
      .filter((entry) => entry.isUnknown)
      .map((entry) => entry.key);
    if (unknownKeys.length) {
      console.warn("[VisualDynamicInputV2] Missing config for key:", [
        ...new Set(unknownKeys),
      ]);
    }
  }, [visibleEntries]);

  useEffect(() => {
    if (activeStep > totalSteps) {
      setActiveStep(1);
      setIsMerging(false);
    }
  }, [activeStep, totalSteps]);

  const navActiveStep = isMerging ? totalSteps : activeStep;
  const handleStepClick = useCallback(
    (stepNum) => {
      if (stepSequence[stepNum - 1]?.id === "generate" && !canGenerate) return;
      goStep(stepNum);
    },
    [canGenerate, goStep, stepSequence]
  );

  if (!visibleEntries.length) return null;

  return (
    <div className="vg-layout">
      <ModeTitleBar
        currentMode={currentMode || ""}
        availableModes={availableModes}
        onModeChange={onModeChange}
        onBack={onBack}
      />
      <StepNavBar
        steps={stepSequence}
        activeStep={navActiveStep}
        onStepClick={handleStepClick}
      />
      <div className={`vg-panels-row${isMerging ? " merging" : ""}`}>
        <LeftPanel
          activeStep={activeStep}
          activeStepId={activeStepId}
          imageFields={imageFields}
          requiredFields={requiredFields}
          optionalFields={optionalFields}
          renderField={renderField}
          isStep2Complete={isStep2Complete}
          canGenerate={canGenerate}
          goStep={goStep}
          fieldRowRefs={fieldRowRefs}
          totalSteps={totalSteps}
        />
        <RightPanel
          imagePreview={imagePreview}
          modelPreviewUrl={modelPreviewUrl}
          stylePreviewUrl={stylePreviewUrl}
          fields={valuePanelFields}
          onNavigate={navigateToField}
          onClearAll={handleClearAll}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isMerging={isMerging}
          onBackToEdit={handleBackToEdit}
          canGenerate={canGenerate}
        />
      </div>
    </div>
  );
};

export default VisualDynamicInputV2;
