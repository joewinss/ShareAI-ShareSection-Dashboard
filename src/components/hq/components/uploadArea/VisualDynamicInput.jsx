import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import { CabinetDrawer } from "@/components/general/components/CabinetDrawer";
import { StepKey } from "@/constants/visualMode";
import { sourceKey } from "@/locales/config";
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

const OPTIONAL_DETAILS_STEP_ID = "optionalDetails";
const MODEL_IMG_DEFAULTS = { gender: "F", age: "21", hair: "L" };

// Normalize requiredUI into a list of known or fallback step entries.
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
  const key = `${race}_${g}_${a}_${h}`;
  return Assets[key] ?? null;
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

const summarizeValue = (value, emptyText) => {
  if (!value) return emptyText;
  const words = String(value).split(/\s+/).filter(Boolean);
  if (words.length <= 3) return value;
  return `${words.slice(0, 3).join(" ")} ....`;
};

const applyWordLimit = (value) => {
  const rawValue = typeof value === "string" ? value : "";
  const words = rawValue.trim().split(/\s+/).filter(Boolean);
  return words.length <= 20 ? rawValue : words.slice(0, 20).join(" ");
};

const VisualDynamicInput = ({
  requiredUI,
  currentStep,
  setCurrentStep,
  stepOffset = 1,
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
  onStepsChange,
  onCompletionChange,
  selectedGradient,
  t,
  preloadUrl = "",
  fieldValues = {},
  onFieldChange,
}) => {
  const router = useRouter();
  const [acknowledgedSteps, setAcknowledgedSteps] = useState({});
  const [selectImageUrls, setSelectImageUrls] = useState([]);
  const [selectedSelectImageUrls, setSelectedSelectImageUrls] = useState(
    () => new Set()
  );
  const [selectImageLoading, setSelectImageLoading] = useState(false);
  const [selectImagePreparing, setSelectImagePreparing] = useState(false);
  const appliedPreloadUrl = useRef(null);

  const requiredEntries = useMemo(
    () => normalizeRequiredUI(requiredUI),
    [requiredUI]
  );
  const selectImageConfig = useMemo(
    () =>
      requiredEntries.find(
        (entry) => entry.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT
      ) || null,
    [requiredEntries]
  );
  const selectImageIndustryCode = selectImageConfig?.industryCode || "";
  const requiredImageCount = minRequiredImages ? minRequiredImages : 1;

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

  const getFieldValue = useCallback(
    (key) => {
      const value = fieldValues[key];
      return typeof value === "string" ? value : "";
    },
    [fieldValues]
  );

  const getTrimmedFieldValue = useCallback(
    (key) => getFieldValue(key).trim(),
    [getFieldValue]
  );

  const selectedAngle = getFieldValue(StepKey.CAMERA);
  const selectedContentMode = getFieldValue(StepKey.CONTENT);

  const resolveInputLabel = useCallback(
    (step) =>
      step?.label ||
      TEXT_INPUT_FALLBACKS[step?.key]?.label ||
      step?.key ||
      "",
    []
  );

  const resolveInputPlaceholder = useCallback(
    (step) =>
      step?.placeholder ||
      TEXT_INPUT_FALLBACKS[step?.key]?.placeholder ||
      "",
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
        ? {
          styleOptions,
          angleOptions,
        }[step.optionSource]
        : step.options;

      return Array.isArray(sourceOptions) ? sourceOptions : [];
    },
    [angleOptions, styleOptions]
  );

  const isOptionalTextStep = useCallback(
    (step) =>
      [
        VISUAL_INPUT_TYPE.TEXT,
        VISUAL_INPUT_TYPE.TEXTAREA,
        VISUAL_INPUT_TYPE.COLOR,
      ].includes(step?.inputType) && step?.required === false,
    []
  );

  const steps = useMemo(() => {
    const list = [];
    const seen = new Set();
    requiredEntries.forEach((entry) => {
      if (entry.hideWhen && getFieldValue(entry.hideWhen.key) === entry.hideWhen.value) {
        return;
      }
      if (!seen.has(entry.id)) {
        list.push(entry);
        seen.add(entry.id);
      }
    });
    return list;
  }, [requiredEntries, getFieldValue]);

  const refreshSelectImages = useCallback(() => {
    if (!selectImageIndustryCode) {
      setSelectImageUrls([]);
      return;
    }

    setSelectImageLoading(true);
    getGeneratedVisualContent("all", 0, {
      visualIndustryCode: selectImageIndustryCode,
    })
      .then((res) => {
        setSelectImageUrls(extractGeneratedVisualImageUrls(res));
      })
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
          if (oldestUrl) {
            next.delete(oldestUrl);
          }
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
      selectImageIndustryCode,
      refreshSelectImages,
      toggleSelectImageUrl,
      goToUpload: () => router.push("/hq/upload"),
    }),
    [
      t,
      fieldValues,
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
      selectImageIndustryCode,
      refreshSelectImages,
      toggleSelectImageUrl,
      router,
    ]
  );

  const isStepComplete = useCallback(
    (step) => {
      if (step.isUnknown || !step.inputType) return true;

      const isRequired = step.required !== false;
      if (!isRequired) return true;

      if (step.inputType === VISUAL_INPUT_TYPE.IMAGE_UPLOAD) {
        return hasMinImages;
      }

      if (step.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT) {
        return selectedImages.length >= requiredImageCount;
      }

      if (
        step.inputType === VISUAL_INPUT_TYPE.TEXT ||
        step.inputType === VISUAL_INPUT_TYPE.TEXTAREA ||
        step.inputType === VISUAL_INPUT_TYPE.COLOR
      ) {
        return getTrimmedFieldValue(step.key).length > 0;
      }

      if (
        step.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_SQUARE ||
        step.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_PORTRAIT ||
        step.inputType === VISUAL_INPUT_TYPE.PILL_SELECT
      ) {
        const hasOptions = getStepOptions(step).length > 0;
        return hasOptions ? !!getFieldValue(step.key) : true;
      }

      return true;
    },
    [
      getFieldValue,
      getStepOptions,
      getTrimmedFieldValue,
      hasMinImages,
      requiredImageCount,
      selectedImages.length,
    ]
  );

  const isStepBlocking = useCallback(
    (step) => !isStepComplete(step),
    [isStepComplete]
  );

  const acknowledgeOptionalSteps = useCallback(
    (stepList) => {
      const optionalIds = (Array.isArray(stepList) ? stepList : [])
        .filter((step) => isOptionalTextStep(step))
        .map((step) => step.id)
        .filter(Boolean);

      if (!optionalIds.length) return;
      setAcknowledgedSteps((prev) => {
        const next = { ...prev };
        let changed = false;
        optionalIds.forEach((id) => {
          if (!next[id]) {
            next[id] = true;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    },
    [isOptionalTextStep]
  );

  const requiredSteps = useMemo(
    () => steps.filter((step) => !isOptionalTextStep(step)),
    [steps, isOptionalTextStep]
  );

  const optionalTextSteps = useMemo(
    () => steps.filter((step) => isOptionalTextStep(step)),
    [steps, isOptionalTextStep]
  );

  const optionalDetailsStep = useMemo(
    () => ({
      id: OPTIONAL_DETAILS_STEP_ID,
      key: OPTIONAL_DETAILS_STEP_ID,
      input: OPTIONAL_DETAILS_STEP_ID,
      label: "Optional Details",
    }),
    []
  );

  const visibleSteps = useMemo(
    () =>
      optionalTextSteps.length
        ? [...requiredSteps, optionalDetailsStep]
        : requiredSteps,
    [requiredSteps, optionalTextSteps.length, optionalDetailsStep]
  );

  const handleStepSelect = useCallback(
    (nextStepId) => {
      const nextStep = visibleSteps.find((step) => step.id === nextStepId);
      if (!nextStep) return;
      if (nextStepId !== currentStep) {
        const currentIndex = visibleSteps.findIndex(
          (step) => step.id === currentStep
        );
        const nextIndex = visibleSteps.findIndex(
          (step) => step.id === nextStepId
        );
        const activeStep = steps.find((step) => step.id === currentStep);
        const forwardSkippedSteps =
          currentIndex !== -1 &&
            nextIndex !== -1 &&
            nextIndex > currentIndex + 1
            ? visibleSteps.slice(currentIndex + 1, nextIndex)
            : [];
        const skippedOptionalSteps = forwardSkippedSteps.some(
          (step) => step.id === OPTIONAL_DETAILS_STEP_ID
        )
          ? optionalTextSteps
          : [];
        acknowledgeOptionalSteps([
          activeStep,
          ...forwardSkippedSteps,
          ...skippedOptionalSteps,
        ]);
      }
      setCurrentStep(nextStepId);
    },
    [
      visibleSteps,
      currentStep,
      steps,
      optionalTextSteps,
      acknowledgeOptionalSteps,
      setCurrentStep,
    ]
  );

  const goToNextStep = useCallback(
    (stepId) => {
      const currentIndex = visibleSteps.findIndex((step) => step.id === stepId);
      if (currentIndex === -1) return;
      const nextStep = visibleSteps[currentIndex + 1];
      setCurrentStep(nextStep ? nextStep.id : StepKey.GENERATE);
    },
    [visibleSteps, setCurrentStep]
  );

  const getStepSummary = useCallback(
    (step) => {
      if (step.inputType === VISUAL_INPUT_TYPE.IMAGE_UPLOAD) {
        return selectedImages.length
          ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} selected`
          : "Select your product photo";
      }

      if (step.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT) {
        return selectedSelectImageUrls.size
          ? `${selectedSelectImageUrls.size} image${selectedSelectImageUrls.size > 1 ? "s" : ""} selected`
          : "Select generated images";
      }

      const value = getFieldValue(step.key);
      if (
        step.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_SQUARE ||
        step.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_PORTRAIT ||
        step.inputType === VISUAL_INPUT_TYPE.PILL_SELECT
      ) {
        const selectedOption = getStepOptions(step)
          .map((option) => normalizeOption(option, t, step.translateOptions))
          .find((option) => option.id === value);
        if (selectedOption?.label) return selectedOption.label;
      }

      return summarizeValue(
        value,
        resolveInputPlaceholder(step) ||
          `Select ${resolveInputLabel(step).toLowerCase()}`
      );
    },
    [
      getFieldValue,
      getStepOptions,
      resolveInputLabel,
      resolveInputPlaceholder,
      selectedImages.length,
      selectedSelectImageUrls.size,
      t,
    ]
  );

  const isStepNextDisabled = useCallback(
    (step) => {
      if (isFetching) return true;
      if (step.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT) {
        return (
          selectedImages.length < requiredImageCount || selectImagePreparing
        );
      }
      return !isStepComplete(step);
    },
    [
      isFetching,
      isStepComplete,
      requiredImageCount,
      selectImagePreparing,
      selectedImages.length,
    ]
  );

  const renderStepContent = useCallback(
    (step) => {
      const Renderer = INPUT_RENDERERS[step.inputType] || UnsupportedFieldRenderer;

      return (
        <Renderer
          field={{
            ...step,
            label: resolveInputLabel(step),
            placeholder: resolveInputPlaceholder(step),
          }}
          value={getFieldValue(step.key)}
          onChange={(value) => updateField(step, value)}
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
    setAcknowledgedSteps({});
    setSelectedSelectImageUrls(new Set());
    setSelectImageUrls([]);
  }, [requiredUI]);

  useEffect(() => {
    if (!selectImageConfig) {
      setSelectImageUrls([]);
      setSelectedSelectImageUrls(new Set());
      return;
    }
    refreshSelectImages();
  }, [selectImageConfig, refreshSelectImages]);

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
  }, [selectImageUrls, preloadUrl, toggleSelectImageUrl]);

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
        if (cancelled) return;
        setSelectedImages(files);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to prepare selected generated images", err);
        message.error(err?.message || "Failed to prepare selected images");
        setSelectedImages([]);
      })
      .finally(() => {
        if (!cancelled) {
          setSelectImagePreparing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectImageConfig, selectedSelectImageUrls, setSelectedImages]);

  useEffect(() => {
    const unknownKeys = steps
      .filter((step) => step.isUnknown)
      .map((step) => step.key);

    if (unknownKeys.length) {
      console.warn(
        "[VisualDynamicInput] Missing config for key:",
        Array.from(new Set(unknownKeys))
      );
    }
  }, [steps]);

  useEffect(() => {
    const missingRenderers = steps
      .filter((step) => step.inputType && !INPUT_RENDERERS[step.inputType])
      .map((step) => step.inputType);

    if (missingRenderers.length) {
      console.error(
        "[VisualDynamicInput] Missing renderer for inputType:",
        Array.from(new Set(missingRenderers))
      );
    }
  }, [steps]);

  useEffect(() => {
    if (onStepsChange) {
      onStepsChange(visibleSteps.map((step) => step.id));
    }
  }, [visibleSteps, onStepsChange]);

  useEffect(() => {
    if (!onCompletionChange) return;
    if (!steps.length) {
      onCompletionChange(true);
      return;
    }
    const completed = steps.every((step) => {
      if (isOptionalTextStep(step)) return true;
      return isStepComplete(step);
    });
    onCompletionChange(completed);
  }, [steps, isStepComplete, isOptionalTextStep, onCompletionChange]);

  useEffect(() => {
    if (!visibleSteps.length) return;
    const isDynamicStep = visibleSteps.some((step) => step.id === currentStep);
    if (!isDynamicStep && currentStep !== StepKey.GENERATE) {
      setCurrentStep(visibleSteps[0].id);
    }
  }, [visibleSteps, currentStep, setCurrentStep]);

  useEffect(() => {
    if (currentStep !== StepKey.GENERATE) return;
    acknowledgeOptionalSteps(steps);
  }, [currentStep, steps, acknowledgeOptionalSteps]);

  const optionalDetailsFilledCount = optionalTextSteps.filter(
    (step) => getTrimmedFieldValue(step.key).length > 0
  ).length;
  const optionalDetailsSummary = optionalDetailsFilledCount
    ? `${optionalDetailsFilledCount} detail${optionalDetailsFilledCount > 1 ? "s" : ""} added`
    : "Optional";
  const isOptionalDetailsCompleted =
    optionalTextSteps.length > 0 &&
    (optionalDetailsFilledCount > 0 ||
      optionalTextSteps.every((step) => acknowledgedSteps[step.id]));
  const isOptionalDetailsLocked = requiredSteps.some((item) =>
    isStepBlocking(item)
  );

  if (!visibleSteps.length) return null;

  return (
    <>
      {requiredSteps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isLocked = requiredSteps
          .slice(0, index)
          .some((item) => isStepBlocking(item));

        return (
          <CabinetDrawer
            key={step.id}
            step={stepOffset + index + 1}
            title={resolveInputLabel(step)}
            icon={
              step.inputType === VISUAL_INPUT_TYPE.IMAGE_UPLOAD
                ? Upload
                : undefined
            }
            isActive={isActive}
            isCompleted={isStepComplete(step)}
            disabled={isLocked}
            summary={getStepSummary(step)}
            onSelect={() => handleStepSelect(step.id)}
          >
            {renderStepContent(step)}

            {step.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_SQUARE &&
              step.key === StepKey.CAMERA && (
                <div className="mt-4 text-sm text-muted-foreground text-left">
                  {selectedAngle === "fix"
                    ? t("nTfixDesc", sourceKey.user)
                    : selectedAngle === "free"
                      ? t("nTfreeDesc", sourceKey.user)
                      : null}
                </div>
              )}

            <div className="flex justify-end mt-4">
              <Button
                className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
                onClick={() => goToNextStep(step.id)}
                disabled={isStepNextDisabled(step)}
              >
                {step.inputType === VISUAL_INPUT_TYPE.IMAGE_SELECT &&
                  selectImagePreparing
                  ? "Preparing..."
                  : "Next"}{" "}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CabinetDrawer>
        );
      })}

      {optionalTextSteps.length > 0 && (
        <CabinetDrawer
          step={stepOffset + requiredSteps.length + 1}
          title="Optional Details"
          isActive={currentStep === OPTIONAL_DETAILS_STEP_ID}
          isCompleted={isOptionalDetailsCompleted}
          disabled={isOptionalDetailsLocked}
          summary={optionalDetailsSummary}
          onSelect={() => handleStepSelect(OPTIONAL_DETAILS_STEP_ID)}
        >
          <div className="grid grid-cols-1 gap-4">
            {optionalTextSteps.map((step) => (
              <div key={step.id}>{renderStepContent(step)}</div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
              onClick={() => {
                acknowledgeOptionalSteps(optionalTextSteps);
                goToNextStep(OPTIONAL_DETAILS_STEP_ID);
              }}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CabinetDrawer>
      )}
    </>
  );
};

export default VisualDynamicInput;
