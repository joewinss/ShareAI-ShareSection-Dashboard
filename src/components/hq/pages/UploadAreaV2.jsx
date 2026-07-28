import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { CabinetDrawer } from "@/components/general/components/CabinetDrawer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import { VISUAL_CATEGORY_STATUS } from "@/constants/image";
import startVisualGenerationAndQueue from "@/pages/api/visualCategory/startVisualGenerationAndQueue";
import { Box, Loader2 } from "lucide-react";
import { useRefreshCreditBalance } from "@/hooks/useCreditBalance";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import VisualDynamicInput from "../components/uploadArea/VisualDynamicInput";
import {
    StepKey,
    UICONFIG_NEEDED_TO_HAVE_MULTISELCTION,
    VISUAL_INDUSTRY_CODES,
} from "@/constants/visualMode";
import {
    VISUAL_INPUT_FIELDS,
    getPayloadFieldEntries,
} from "@/constants/visualInputFields";

const VALID_VISUAL_INDUSTRY_CODES = VISUAL_INDUSTRY_CODES;

const normalizeIndustryCode = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";


//Global Config for this page
const defaultGradient = "bg-gradient-to-r from-green-500 to-blue-500";
const UploadAreaV2 = ({ mode, selectedGradient = defaultGradient }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const rawPreloadUrl = router.query.preloadUrl;
    const preloadUrl = Array.isArray(rawPreloadUrl) ? rawPreloadUrl[0] : (rawPreloadUrl || "");
    const refreshCreditBalance = useRefreshCreditBalance();
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [fieldValues, setFieldValues] = useState({});
    const [currentStep, setCurrentStep] = useState(StepKey.UPLOAD);
    const [dynamicStepKeys, setDynamicStepKeys] = useState([]);
    const [dynamicComplete, setDynamicComplete] = useState(false);
    const [maxRequiredImages, setMaxRequiredImages] = useState(1)
    const [minRequiredImages, setMinRequiredImages] = useState(0)
    const requiredImages = minRequiredImages ? minRequiredImages : 1;
    const hasMinImages = selectedImages.length >= requiredImages;
    const [angleCreditMap, setAngleCreditMap] = useState({});
    const hasUploadImageStep = dynamicStepKeys.includes(StepKey.UPLOAD);
    const hasSelectImageStep = dynamicStepKeys.includes(StepKey.SELECT_IMAGE);
    const hasImageInputStep = hasUploadImageStep || hasSelectImageStep;
    const generateStepNumber = dynamicStepKeys.length + 1;
    const canGenerate =
        (hasImageInputStep ? hasMinImages : true) &&
        dynamicComplete &&
        !isFetching;
    const [isFurnitureStyle, setIsFurnitureStyle] = useState(false)
    const [param, setParam] = useState("")

    const getFieldValue = useCallback((key) => {
        const value = fieldValues[key];
        return typeof value === "string" ? value : "";
    }, [fieldValues]);

    const updateFieldValue = useCallback((key, value) => {
        setFieldValues((prev) => {
            const config = VISUAL_INPUT_FIELDS[key];
            const next = {
                ...prev,
                [key]: value,
            };

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

    const resolvePreview = (candidate) => {
        if (!candidate) return null;
        if (typeof candidate === "string") return candidate;
        if (typeof candidate === "object" && candidate.url) return candidate.url;
        return null;
    };

    //First things will do when push to this page: Get Mode details & options     
    useEffect(() => {
        getData();
    }, [mode]);

    // Clear status
    useEffect(() => {
        setCurrentStep(StepKey.UPLOAD);
        setSelectedImages([]);
        setImagePreviews([]);
        setFieldValues({});
        setSelectedRecord(null);
        setDynamicStepKeys([]);
        setDynamicComplete(false);
        setMaxRequiredImages(1);
        setMinRequiredImages(0);
    }, [mode]);


    //Get Mode details & options
    function getData() {
        setIsFetching(true);
        getVisualCategoryListings(1, 0, {
            title: mode,
            status: VISUAL_CATEGORY_STATUS.ACTIVE,
        })
            .then((res) => {
                const list = Array.isArray(res?.data)
                    ? res.data.filter((entry) => entry && Object.keys(entry).length)
                    : [];

                const normalized = list.map((record) => ({
                    id: record?._id,
                    title: record?.title || "",
                    param: record?.param || [],
                    uiConfig: Array.isArray(record?.uiConfig) ? record.uiConfig : [],
                    modes: Array.isArray(record?.modes) ? record.modes : [],
                    credits: record?.creditCost ?? record?.credits ?? 0,
                    imageInputMaxCount: record?.imageInputMaxCount,
                    imageInputMinCount: record?.imageInputMinCount,
                    visualIndustry: record?.visualIndustry
                })).filter((item) => item.title);
                const decodedMode = typeof mode === "string" ? decodeURIComponent(mode) : mode;
                const match = normalized.find((record) => record.title === decodedMode) || normalized[0] || null;
                setMaxRequiredImages(match?.imageInputMaxCount ?? 1); //Set Max Image Input 
                setMinRequiredImages(match?.imageInputMinCount ?? 0);// Set Min Image Input
                const hasParamMultiSelection = !!(Array.isArray(match?.uiConfig) && match.uiConfig.find((w) =>
                    w.key.trim() === UICONFIG_NEEDED_TO_HAVE_MULTISELCTION.PARAM));
                setIsFurnitureStyle(hasParamMultiSelection);
                setParam(match?.param?.[0]?.name || "");
                const creditLookup = {};
                (match?.modes || []).forEach((m) => {
                    if (m?.type || m?.name) {
                        creditLookup[m.type || m.name] = m.creditCost;
                    }
                });
                setAngleCreditMap(creditLookup);
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
    }

    //Map Photo with Id, Label, Preview, and Sample photo (sample photo is angle's example photo)
    const styleOptions =
        Array.isArray(selectedRecord?.param) && selectedRecord.param.length
            ? selectedRecord.param.map((p, idx) => {
                const sample = Array.isArray(p?.samplePhoto)
                    ? p.samplePhoto[0]
                    : p?.samplePhoto;
                const allSamples = Array.isArray(p?.samplePhoto)
                    ? p.samplePhoto.map((s) => resolvePreview(s)).filter(Boolean)
                    : [];
                return {
                    id: p?.name || `style-${idx}`,
                    label: p?.name || `Style ${idx + 1}`,
                    previewImage: resolvePreview(sample),
                    samplePhotos: allSamples,
                };
            })
            : [];

    // Map the selected_Type for angle showing relevant photo example
    const selectedStyle = useMemo(
        () => styleOptions.find((opt) => opt.id === selectedType),
        [styleOptions, selectedType]
    );

    //Render Photo based on the mapped type 
    const angleOptions = useMemo(() => {
        const apiModes = Array.isArray(selectedRecord?.modes)
            ? selectedRecord.modes.filter((m) => m && (m.type || m.name))
            : [];
        if (!apiModes.length) return [];
        const samples = selectedStyle?.samplePhotos || [];
        return apiModes
            .map((m, idx) => ({
                id: m.type || m.name || `mode-${idx}`,
                label: t(m.type, sourceKey.user) || m.type,
                previewImage: resolvePreview(
                    samples[idx] ||
                    samples[0] ||
                    (Array.isArray(m?.samplePhoto) ? m.samplePhoto[0] : m?.samplePhoto)
                ),
                creditCost: m?.creditCost,
            }));
    }, [selectedRecord, selectedStyle]);

    //Let Credit Total Change IF angle options will charge more credit
    const displayedCredit = useMemo(() => {
        if (angleOptions.length) {
            if (selectedAngle) {
                const credit =
                    angleCreditMap[selectedAngle] ??
                    angleOptions.find((opt) => opt.id === selectedAngle)?.creditCost;
                if (typeof credit === "number") return credit;
            }
            const creditValues = Object.values(angleCreditMap).filter(
                (v) => typeof v === "number"
            );
            if (creditValues.length) return Math.min(...creditValues);
        }
        return typeof selectedRecord?.credits === "number" ? selectedRecord.credits : 0;
    }, [angleOptions, angleCreditMap, selectedAngle, selectedRecord]);

    //Map the ratio option for VisualDynamicInput
    const ratioConfig = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.RATIO;
            }) || null
        );
    }, [selectedRecord]);

    //Map the unit option for VisualDynamicInput
    const unitConfig = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.UNIT;
            }) || null
        );
    }, [selectedRecord]);

    //Map the content option for VisualDynamicInput
    const contentConfig = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.CONTENT;
            }) || null
        );
    }, [selectedRecord]);

    const styleConfig = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.STYLE;
            }) || null
        );
    }, [selectedRecord]);

    const flooringConfig = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.FLOORING;
            }) || null
        );
    }, [selectedRecord]);

    const view1Config = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.VIEW1;
            }) || null
        );
    }, [selectedRecord]);

    const view2Config = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.VIEW2;
            }) || null
        );
    }, [selectedRecord]);

    const view3Config = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.VIEW3;
            }) || null
        );
    }, [selectedRecord]);

    const view4Config = useMemo(() => {
        const configList = Array.isArray(selectedRecord?.uiConfig)
            ? selectedRecord.uiConfig
            : [];
        return (
            configList.find((item) => {
                const key = typeof item?.key === "string" ? item.key.trim() : "";
                return key === StepKey.VIEW4;
            }) || null
        );
    }, [selectedRecord]);

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
            return {
                ...prev,
                [StepKey.CONTENT]: contentOptions[0],
            };
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
    }, [view1Options, selectedView1, updateFieldValue]);

    useEffect(() => {
        if (selectedView2 && !view2Options.includes(selectedView2)) {
            updateFieldValue(StepKey.VIEW2, "");
        }
    }, [view2Options, selectedView2, updateFieldValue]);

    useEffect(() => {
        if (selectedView3 && !view3Options.includes(selectedView3)) {
            updateFieldValue(StepKey.VIEW3, "");
        }
    }, [view3Options, selectedView3, updateFieldValue]);

    useEffect(() => {
        if (selectedView4 && !view4Options.includes(selectedView4)) {
            updateFieldValue(StepKey.VIEW4, "");
        }
    }, [view4Options, selectedView4, updateFieldValue]);

    useEffect(() => {
        if (selectedAngle && !angleOptions.find((opt) => opt.id === selectedAngle)) {
            updateFieldValue(StepKey.CAMERA, "");
        }
    }, [angleOptions, selectedAngle, updateFieldValue]);

    // Send Request to Back End
    const generatePhoto = async () => {
        try {
            setIsLoading(true);
            if (hasImageInputStep && !hasMinImages) {
                message.error(`Please ${hasSelectImageStep ? "select" : "upload"} at least ${requiredImages} image${requiredImages > 1 ? "s" : ""} to generate`);
                setIsLoading(false);
                setCurrentStep(hasSelectImageStep ? StepKey.SELECT_IMAGE : StepKey.UPLOAD);
                return;
            }

            const visualIndustry = normalizeIndustryCode(
                selectedRecord?.visualIndustry?.industryCode
            );
            if (!visualIndustry) {
                message.error("Visual industry is missing for this mode.");
                setIsLoading(false);
                return;
            }
            if (!VALID_VISUAL_INDUSTRY_CODES.includes(visualIndustry)) {
                message.error("Visual industry is invalid for this mode.");
                setIsLoading(false);
                return;
            }

            //Send here
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

            selectedImages.forEach((img) => {
                if (img !== undefined && img !== null && img !== "") {
                    formData.append("images[]", img);
                }
            });

            const typeValue = isFurnitureStyle ? selectedType : param;
            appendValue("type", typeValue);

            getPayloadFieldEntries().forEach(([key, config]) => {
                if (config.skipPayloadWhen) {
                    const otherValue = getFieldValue(config.skipPayloadWhen.key);
                    if (otherValue === config.skipPayloadWhen.value) {
                        return;
                    }
                }

                appendValue(config.payloadKey, getFieldValue(key));
            });

            await startVisualGenerationAndQueue(formData, visualIndustry, {
                requireImages: hasImageInputStep,
            })
            await refreshCreditBalance();
            message.success("Visual generation started successfully!");
            router.push("/hq/upload")
        } catch (error) {
            console.error("Content generation failed:", error);
            message.error(error?.message || "Failed to generate visuals");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-row items-center gap-3">
                <Button
                    onClick={() => router.push("/hq/upload")}
                    className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0`}
                >
                    <ArrowLeftOutlined />
                </Button>
                <h1
                    className="font-bold text-foreground mb-2"
                    style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
                >
                    {mode}
                </h1>
            </div>

            <div className="mt-6 max-w-5xl space-y-4">
                {/* Dynamic Input Cabinet Drawer Component  */}
                {/* Dynamic cabinets: upload, select inputs, and API-driven text inputs (company/about/website/title/subtitle/description/info/notes/theme/corporateColor/background/costume) */}
                <VisualDynamicInput
                    requiredUI={selectedRecord?.uiConfig}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    stepOffset={0}
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
                    onStepsChange={setDynamicStepKeys}
                    onCompletionChange={setDynamicComplete}
                    selectedGradient={selectedGradient}
                    t={t}
                    preloadUrl={preloadUrl}
                    fieldValues={fieldValues}
                    onFieldChange={updateFieldValue}
                />

                {/* The Last Cabinet Always Generate Button */}
                <CabinetDrawer
                    step={generateStepNumber}
                    title="Generate"
                    icon={Box}
                    isActive={currentStep === StepKey.GENERATE}
                    disabled={!canGenerate}
                    onSelect={() => setCurrentStep(StepKey.GENERATE)}
                >
                    <div className="mt-6 space-y-3">
                        <div className="text-sm text-muted-foreground text-right">
                            Credit cost: {displayedCredit}
                        </div>
                        <Button
                            className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
                            size="lg"
                            onClick={generatePhoto}
                            disabled={!canGenerate || isLoading}
                        >
                            <span className="flex items-center gap-2">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Box className="h-4 w-4" />
                                )}
                                {isLoading ? "Generating..." : "Generate Now"}
                            </span>
                        </Button>
                    </div>
                </CabinetDrawer>
            </div>
        </>
    );
};

export default UploadAreaV2;
