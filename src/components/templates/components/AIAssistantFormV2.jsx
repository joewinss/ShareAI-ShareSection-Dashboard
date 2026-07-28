import React, { useEffect, useState } from "react";
// import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Upload, Wand2, Video, Image as ImageIcon } from "lucide-react";
import StringInput from "@/general/input/StringInput";
import DropdownInput from "@/general/input/DropdownInput";
import NumberInput from "@/general/input/NumberInput";
import { useForm } from "antd/lib/form/Form";
import { Button, Form, message } from "antd";
import { useRouter } from "next/router";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { facebook, instagram, redNote } from "../../../../public/assets/index";
import TextAreaInput from "@/general/input/TextAreaInput";
import { useFormRules } from "@/constant/formRules";
import generateContent from "@/pages/api/n8n-content/generateContent";
import progress from "@/pages/api/progress";
import images from "@/pages/api/upload/images";
import { createImagePreviews, validateImages } from "@/utility/ImagesFunction";
import getAllPresetContent from "@/pages/api/content-presets/getAllPresetContent";
import getCategory from "@/pages/api/category/getCategory";
const AIAssistantForm = ({
  currentTab,
  setFormData,
  handleAIParamChange,
  toast,
}) => {
  const [form] = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [presetTemplates, setPresetTemplates] = useState([]);

  // Progress tracking states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedContent, setCompletedContent] = useState(0);
  const [totalContent, setTotalContent] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [categoryOption, setCategoryOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showRetryOption, setShowRetryOption] = useState(false);
  const formRules = useFormRules(t, sourceKey);
  // Get current form values to calculate required images
  const [currentVariations, setCurrentVariations] = useState(1);
  const requiredImages = currentVariations * 4;

  // Platform options matching TemplatesPage tabItems
  const platformOptions = [
    {
      title: (
        <div className="flex items-center">
          <img src={redNote} className="w-4 h-4 mr-2" alt="Rednote" />
          <span>{t("rednote", sourceKey.user)}</span>
        </div>
      ),
      value: "rednote",
    },
    {
      title: (
        <div className="flex items-center">
          <img src={facebook} className="w-4 h-4 mr-2" alt="Facebook" />
          <span>{t("facebook", sourceKey.user)}</span>
        </div>
      ),
      value: "facebook",
    },
    {
      title: (
        <div className="flex items-center">
          <img src={instagram} className="w-4 h-4 mr-2" alt="Instagram" />
          <span>{t("instagram", sourceKey.user)}</span>
        </div>
      ),
      value: "instagram",
    },
  ];

  // Watch for changes in variationsPerPlatform using form onValuesChange
  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.variationsPerPlatform !== undefined) {
      setCurrentVariations(parseInt(changedValues.variationsPerPlatform) || 1);
    }

    // Handle preset template selection
    if (changedValues.presetTemplate !== undefined) {
      handlePresetTemplateChange(changedValues.presetTemplate);
    }
  };

  // Load preset templates on component mount
  const loadPresetTemplates = async () => {
    try {
      const response = await getAllPresetContent();
      if (response?.success && response?.data?.data) {
        setPresetTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error loading preset templates:", error);
    }
  };

  // Load category options on component mount
  const loadCategoryOptions = async () => {
    try {
      const response = await getCategory();
      if (response?.success && response?.data?.data) {
        const options = response?.data?.data?.categories?.map((category) => ({
          title: category.title,
          value: category.id,
        }));
        setCategoryOption(options);
      }
    } catch (error) {
      console.error("Error loading category options:", error);
    }
  };

  // Handle preset template selection
  const handlePresetTemplateChange = (selectedValue) => {
    if (!selectedValue || selectedValue === "") {
      // Reset all form fields when empty option is selected
      form.resetFields();
      setCurrentVariations(1);
      return;
    }

    // Find the selected preset template
    const selectedPreset = presetTemplates.find(
      (preset) => preset._id === selectedValue
    );
    if (selectedPreset) {
      // Set form fields with flat structure preset data
      form.setFieldsValue({
        productName: selectedPreset.productName || "",
        promotional: selectedPreset.promotional || "",
        sellingPoint: selectedPreset.sellingPoint || "",
        targetAudience: selectedPreset.targetAudience || "",
        style: selectedPreset.style || "",
        language: selectedPreset.language || "",
        contentLength: selectedPreset.contentLength || "",
        hashtag: selectedPreset.hashtags || "",
      });
    }
  };

  // useEffect to load preset templates and set default platform
  useEffect(() => {
    loadPresetTemplates();
    loadCategoryOptions();

    // Only set default platform if NOT coming from preset template
    if (currentTab && !router.query.presetTemplateId) {
      form.setFieldsValue({
        platform: currentTab,
      });
    }
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
          // Do NOT set platform - let user choose manually
        });
        // Trigger the preset template change handler
        handlePresetTemplateChange(router.query.presetTemplateId);
        // Show success message
        message.success(
          `Preset template "${selectedPreset.name}" has been loaded. Please select a platform to continue.`
        );
      }
    } else {
      form.setFieldsValue({
        targetAudience: "Everyone",
        style: "friendly",
        language: "Chinese",
        contentLength: "short",
        variationsPerPlatform: 1,
      });
    }
  }, [router.query.presetTemplateId, presetTemplates]);

  //   const generateAIContent = async () => {
  //   setLoading(true);
  //   try {
  //     // Validate form fields
  //     const values = await form.validateFields();

  //     let imageUrls = [];
  //     if (selectedImages.length > 0) {
  //       const uploadResponse = await uploadAPI.handleMediaUpload(selectedImages);
  //       imageUrls = uploadResponse.data.images.map(img => img.url);
  //     }

  //     // Prepare correct values for content generation
  //     const correctValues = {
  //       platforms: [currentTab],
  //       variationsPerPlatform: parseInt(values.variationsPerPlatform) || 1,
  //       customInputs: {
  //         productName: values.productName,
  //         promotional: values.promotional,
  //         sellingPoint: values.sellingPoint,
  //         targetAudience: values.targetAudience,
  //         wording: String(parseInt(values?.wording) || 1),
  //         style: values.style,
  //         location: "Worldwide",
  //         language: values.language || "english"
  //       },
  //       imageUrls: imageUrls, // Include uploaded image URLs
  //     };

  //     // Generate content using the contentAPI
  //     const response = await contentAPI.generateContent(correctValues);

  //     if (response?.success) {
  //       message.success("Your new template has been successfully created.");
  //       router.push({
  //         pathname: '/templates',
  //         query: { defaultTab: currentTab },
  //       });
  //     }

  //   } catch (error) {
  //     console.error('Content generation failed:', error);

  //     if (error.message) {
  //       message.error(error.message);
  //     } else if (error.errorType) {
  //       message.error(`${error.errorType}: ${error.message || 'Unknown error'}`);
  //     } else {
  //       message.error("An unexpected error occurred. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const generateAIContent = async () => {
  //   setLoading(true);
  //   // Always redirect after 15 seconds
  //   const redirectTimeout = setTimeout(() => {
  //     router.push({
  //       pathname: '/templates/live',
  //       query: { defaultTab: currentTab },
  //     });
  //   }, 10000);
  //   try {
  //     // Validate form fields
  //     const values = await form.validateFields();

  //     // Validate image count based on variationsPerPlatform
  //     const requiredImages = parseInt(values.variationsPerPlatform) * 4 || 4;
  //     if (selectedImages.length !== requiredImages) {
  //       clearTimeout(redirectTimeout);
  //       message.error(`Please select exactly ${requiredImages} images for ${values.variationsPerPlatform || 1} variation(s). Each variation requires 4 images.`);
  //       setLoading(false);
  //       return;
  //     }

  //     let imageUrls = [];
  //     if (selectedImages.length > 0) {
  //       const uploadResponse = await uploadAPI.handleMediaUpload(selectedImages);
  //       imageUrls = uploadResponse.data.images.map(img => img.url);
  //     }

  //     // Prepare correct values for content generation
  //     const correctValues = {
  //       platforms: [currentTab],
  //       variationsPerPlatform: parseInt(values.variationsPerPlatform) || 1,
  //       customInputs: {
  //         productName: values.productName,
  //         promotional: values.promotional,
  //         sellingPoint: values.sellingPoint,
  //         targetAudience: values.targetAudience,
  //         contentLength: values.contentLength,
  //         style: values.style,
  //         location: "Worldwide",
  //         language: values.language || "english",
  //         hashtags: values.hashtag,
  //       },
  //       imageUrls: imageUrls, // Include uploaded image URLs
  //     };

  //     // Generate content using the contentAPI
  //     const response = await contentAPI.generateContent(correctValues);

  //     if (response?.success) {
  //       message.success("Your new template has been successfully created.");
  //       clearTimeout(redirectTimeout);
  //       router.push({
  //         pathname: '/templates/live',
  //         query: { defaultTab: currentTab },
  //       });
  //     }

  //   } catch (error) {
  //     console.error('Content generation failed:', error);
  //     clearTimeout(redirectTimeout); // Clear the timeout to prevent redirect on error
  //     if (error?.err?.error === "Image Validation Failed") {
  //       message.error(error?.err?.message);
  //     } else if (error?.errorType === "api_error") {
  //       message.error(error?.err?.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Progress tracking version of content generation
  const generateAIContentWithProgress = async () => {
    try {
      // Disable form and show initial loading
      setIsGenerating(true);
      setProgressPercentage(0);
      setGenerationStatus("starting");
      setShowResults(false);
      setShowRetryOption(false);

      // Validate form fields
      const values = await form.validateFields();

      // Validate platform selection
      if (!values.platform && !currentTab) {
        message.error("Please select a platform");
        setIsGenerating(false);
        return;
      }

      // Validate image count based on variationsPerPlatform
      const requiredImages = parseInt(values.variationsPerPlatform) * 4 || 4;
      if (selectedImages.length !== requiredImages) {
        message.error(
          `Please select exactly ${requiredImages} images for ${
            values.variationsPerPlatform || 1
          } variation(s). Each variation requires 4 images.`
        );
        setIsGenerating(false);
        return;
      }

      // Upload images after form validation
      let imageUrls = [];
      if (selectedImages.length > 0) {
        const uploadResponse = await images(selectedImages);
        imageUrls = uploadResponse.data.images.map((img) => img.url);
      }

      // Prepare correct values for content generation
      const correctValues = {
        platforms: [values.platform || currentTab],
        variationsPerPlatform: parseInt(values.variationsPerPlatform) || 1,
        customInputs: {
          productName: values.productName,
          promotional: values?.promotional || "-",
          sellingPoint: values.sellingPoint,
          targetAudience: values.targetAudience,
          contentLength: values.contentLength,
          style: values.style,
          location: "Worldwide",
          language: values.language || "english",
          hashtags: values.hashtag,
        },
        images: imageUrls, // Include uploaded image URLs
      };

      // Call generation API with progress tracking
      const response = await generateContent(correctValues);

      if (response?.success && response?.data?.progressSession) {
        const newGenerationId = response?.data?.progressSession?.generationId;
        setGenerationId(newGenerationId);
        setTotalContent(response?.data?.progressSession?.totalContent);

        // Start progress polling
        startProgressPolling(response?.data?.progressSession?.generationId);
      } else {
        // Fallback to regular generation if no progress session
        // if (response?.success) {
        //   message.success("Your new template has been successfully created.");
        //   router.push({
        //     pathname: '/templates/live',
        //     query: { defaultTab: currentTab },
        //   });
        // }
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Content generation failed:", error);
      setIsGenerating(false);
      if (error?.err?.error === "Image Validation Failed") {
        message.error(error?.err?.message);
      } else if (error?.errorType === "api_error") {
        message.error(error?.err?.message);
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Smart polling function
  const startProgressPolling = (generationId) => {
    let pollCount = 0;
    let pollInterval = 1000; // Start with 1 second
    const pollProgress = async () => {
      try {
        // Call progress API with query parameter
        const response = await progress({ generationId: generationId });

        if (response?.success && response?.data?.progress) {
          const progress = response.data.progress;

          // Update UI with current progress
          setProgressPercentage(progress?.progressPercentage || 0);
          setCompletedContent(progress?.completedContent || 0);
          setTotalContent(progress?.totalContent || totalContent);
          setGenerationStatus(progress?.status || "in_progress");
          setCurrentStep(progress?.currentStep || "");
          setEstimatedTime(
            progress?.data?.metadata?.estimatedTimeRemaining || null
          );

          // Check if generation finished
          if (["completed", "failed", "cancelled"].includes(progress.status)) {
            setIsGenerating(false);
            handleGenerationComplete(progress);
            return; // Stop polling
          }

          // Smart polling intervals (prevent server overload)
          pollCount++;
          if (pollCount > 30) pollInterval = 2000; // After 30 polls: 2 seconds
          if (pollCount > 60) pollInterval = 3000; // After 60 polls: 3 seconds

          // Schedule next poll
          setTimeout(pollProgress, pollInterval);
        } else {
          // Handle API errors
          console.error("Progress API error:", result);
          setTimeout(pollProgress, Math.min(10000, pollInterval * 2));
        }
      } catch (error) {
        console.error("Polling failed:", error);
        // Retry with exponential backoff
        setTimeout(pollProgress, Math.min(10000, pollInterval * 2));
      }
    };

    // Start polling immediately
    pollProgress();
  };

  // Handle generation completion
  const handleGenerationComplete = (progress) => {
    if (progress.status === "completed") {
      message.success(
        `✅ All ${progress.totalContent} content pieces generated!`
      );
      setShowResults(true);
      // Navigate to content list after a short delay
      setTimeout(() => {
        router.push({
          pathname: "/templates/pending-review",
          query: { defaultTab: currentTab },
        });
      }, 2000);
    } else if (progress.status === "failed") {
      message.error("❌ Generation failed");
      setShowRetryOption(true);
    } else if (progress.status === "cancelled") {
      message.info("⚠️ Generation was cancelled");
    }
  };

  // Cancel generation function
  const handleCancelGeneration = async () => {
    if (!confirm("Cancel generation? Progress will be lost.")) return;

    try {
      await fetch("/api/progress/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generationId }),
      });
      setIsGenerating(false);
      setGenerationStatus("cancelled");
      setProgressPercentage(0);
      message.info("Generation cancelled");
    } catch (error) {
      message.error("Failed to cancel generation");
    }
  };

  // Get progress message for UI
  const getProgressMessage = () => {
    if (generationStatus === "completed") {
      return `✅ All ${totalContent} content pieces generated!`;
    }
    if (generationStatus === "in_progress") {
      const timeText = estimatedTime
        ? ` • ${Math.round(estimatedTime / 1000)}s remaining`
        : "";
      return `Generating ${completedContent}/${totalContent} content pieces${timeText}`;
    }
    if (generationStatus === "starting") {
      return "Initializing content generation...";
    }
    return "Preparing generation...";
  };

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Validate images before upload
      const validation = validateImages(files);
      if (!validation.valid) {
        message.error(validation.errors.join(", "));
        return;
      }

      // Combine existing images with new ones (don't clear previous selection)
      const newFiles = Array.from(files);
      const combinedFiles = [...selectedImages, ...newFiles];

      // Create previews for all images (existing + new)
      const existingPreviews = imagePreviews;
      const newPreviews = createImagePreviews(newFiles);
      const allPreviews = [...existingPreviews, ...newPreviews];

      setImagePreviews(allPreviews);
      setSelectedImages(combinedFiles);
    } catch (error) {
      console.error("Error selecting images:", error);
      message.error("Error selecting images. Please try again.");
    }
  };

  return (
    <Form form={form} onValuesChange={handleFormValuesChange}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="presetTemplate">
            {t("presetTemplate", sourceKey.user)}
          </Label>
          <DropdownInput
            fieldName="presetTemplate"
            options={[
              {
                title:
                  "-- " +
                  (t("noPresetTemplate", sourceKey.user) ||
                    "No Preset Template") +
                  " --",
                value: "",
              },
              ...presetTemplates.map((preset) => ({
                title: preset.name,
                value: preset._id,
              })),
            ]}
            placeholder={t("selectTemplate", sourceKey.user)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">
            {t("platform", sourceKey.user) || "Platform"}
          </Label>
          <DropdownInput
            fieldName="platform"
            rules={formRules.platform}
            options={platformOptions}
            placeholder={
              t("selectPlatform", sourceKey.user) || "Select Platform"
            }
          />
        </div>
      </div>
      <div className="space-y-4">
        {/* <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">AI Content Generation</h4>
          <p className="text-sm text-blue-700">Provide parameters below to generate engaging content using AI.</p>
        </div> */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-1">
              <Label>
                Media Upload ({selectedImages.length}/{requiredImages} images
                required)
              </Label>
              <div className="blue-text xsmall-text-size">
                {t("uploadAtLeast4Images", sourceKey.user)}
              </div>
            </div>
            {selectedImages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all images
                  imagePreviews.forEach((preview) =>
                    URL.revokeObjectURL(preview.preview)
                  );
                  setImagePreviews([]);
                  setSelectedImages([]);
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              selectedImages.length === requiredImages
                ? "border-green-300 bg-green-50"
                : selectedImages.length > requiredImages
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-center space-x-2">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Upload images - JPEG, PNG, GIF allowed
                <br />
                <span className="font-medium">
                  {currentVariations} variation(s) × 4 images = {requiredImages}{" "}
                  total images needed
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 3MB per image
              </p>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif"
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("media-upload").click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedImages.length === 0
                  ? "Choose Images"
                  : "Add More Images"}
              </Button>
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    {preview.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = imagePreviews.filter(
                        (_, i) => i !== index
                      );
                      const newImages = selectedImages.filter(
                        (_, i) => i !== index
                      );
                      setImagePreviews(newPreviews);
                      setSelectedImages(newImages);
                      URL.revokeObjectURL(preview.preview);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">
              {t("productName", sourceKey.user)}
            </Label>
            <TextAreaInput
              rules={formRules.productName}
              fieldName="productName"
              placeholder={t("title", sourceKey.user)}
              extraLabel={t("titleDesc", sourceKey.user)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPoint">
              {t("sellingHighlight", sourceKey.user)}
            </Label>
            <TextAreaInput
              fieldName="sellingPoint"
              rules={formRules.sellingHighlight}
              placeholder={t("sellingPoint", sourceKey.user)}
              extraLabel={t("sellingPointDesc", sourceKey.user)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotional">
              {t("promotionalMessage", sourceKey.user)}
            </Label>
            <TextAreaInput
              fieldName="promotional"
              // rules={formRules.promotionalMessage}
              placeholder={t("promotional", sourceKey.user)}
              extraLabel={t("promotionalDesc", sourceKey.user)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">{t("productType", sourceKey.user)}</Label>
            <DropdownInput
              fieldName="category"
              options={categoryOption}
              // rules={formRules.category}
              placeholder={t("category", sourceKey.user)}
              extraLabel={t("categoryDesc", sourceKey.user)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">{t("branch", sourceKey.user)}</Label>
            <DropdownInput
              fieldName="branch"
              options={
                [
                  // { title: "Pro", value: "Pro" },
                  // { title: "Cute", value: "Cute" },
                  // { title: "Joke", value: "Joke" },
                ]
              }
              // rules={formRules.branch}
              placeholder={t("branch", sourceKey.user)}
              extraLabel={t("branchDesc", sourceKey.user)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">{t("language", sourceKey.user)}</Label>
            <DropdownInput
              fieldName="language"
              options={[
                { title: "English", value: "English" },
                { title: "Chinese", value: "Chinese" },
                { title: "Malay", value: "Malay" },
              ]}
              rules={formRules.language}
              placeholder={t("language", sourceKey.user)}
              extraLabel={t("languageDesc", sourceKey.user)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="audience">
              {t("targetAudience", sourceKey.user)}
            </Label>
            <StringInput
              fieldName="targetAudience"
              rules={formRules.targetAudience}
              placeholder={t("targetAudience", sourceKey.user)}
              extraLabel={t("targetAudienceDesc", sourceKey.user)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">{t("writingStyle", sourceKey.user)}</Label>
            <DropdownInput
              fieldName="style"
              options={[
                { title: t("pro", sourceKey.user), value: "pro" },
                { title: t("cute", sourceKey.user), value: "cute" },
                { title: t("joke", sourceKey.user), value: "joke" },
                { title: t("friendly", sourceKey.user), value: "friendly" },
              ]}
              placeholder={t("style", sourceKey.user)}
              rules={formRules.writingStyle}
              extraLabel={t("writingStyleDesc", sourceKey.user)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">{t("hashtag", sourceKey.user)}</Label>
            <StringInput
              fieldName="hashtag"
              placeholder="#Hashtag"
              // rules={formRules.hashtag}
              extraLabel={t("hashtagDesc", sourceKey.user)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="promotion">{t("wording", sourceKey.user)}</Label>
            <DropdownInput
              fieldName="contentLength"
              rules={formRules.wording}
              options={[
                { title: "Long", value: "long" },
                { title: "Short", value: "short" },
              ]}
              placeholder={t("select", sourceKey.user)}
              extraLabel={t("-", sourceKey.user)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfPost">
              {t("numberOfPosts", sourceKey.user)}
            </Label>
            <NumberInput
              rules={formRules.numberOfPosts}
              extraLabel={t("aiTextGenerationDesc", sourceKey.user)}
              fieldName="variationsPerPlatform"
              placeholder={0}
            />
          </div>
        </div>

        {/* Progress UI - Show when generation is active */}
        {isGenerating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-900">
                {getProgressMessage()}
              </span>
              {/* <button
                onClick={handleCancelGeneration}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Cancel
              </button> */}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-blue-700 mt-1">
              <span>{progressPercentage.toFixed(0)}% Complete</span>
              <span>
                {completedContent} / {totalContent} pieces
              </span>
            </div>
            {currentStep && (
              <div className="text-xs text-blue-600 mt-1">
                Current step: {currentStep}
              </div>
            )}
          </div>
        )}

        {/* Generation Buttons */}
        <div className="space-y-3">
          {/* Original Button with Timeout */}
          {/* <Button
            type="button"
            loading={loading}
            disabled={loading || selectedImages.length !== requiredImages || isGenerating}
            onClick={generateAIContent}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {loading
              ? 'Generating Content...'
              : selectedImages.length !== requiredImages
                ? `Select ${requiredImages - selectedImages.length} more image(s) to continue`
                : `Generate AI Content (Quick Mode)`}
          </Button> */}

          {/* Progress Tracking Button */}
          <Button
            type="button"
            loading={isGenerating}
            disabled={
              loading ||
              selectedImages.length !== requiredImages ||
              isGenerating
            }
            onClick={generateAIContentWithProgress}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating
              ? getProgressMessage()
              : selectedImages.length !== requiredImages
              ? `Select ${
                  requiredImages - selectedImages.length
                } more image(s) to continue`
              : `Generate AI Content (Progress Tracking)`}
          </Button>

          {/* Retry Button - Show when generation failed */}
          {/* {showRetryOption && (
            <Button
              type="button"
              onClick={generateAIContentWithProgress}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Retry Generation
            </Button>
          )} */}

          {/* {showResults && (
            <Button
              type="button"
              onClick={() => router.push({
                pathname: '/templates/live',
                query: { defaultTab: currentTab },
              })}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              ✅ View Generated Content
            </Button>
          )} */}
        </div>
      </div>
    </Form>
  );
};

export default AIAssistantForm;
