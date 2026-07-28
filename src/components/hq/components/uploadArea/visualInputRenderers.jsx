import React, { useEffect } from "react";
import { Input, Form } from "antd";
import { Button } from "@/components/ui/button";
import { sourceKey } from "@/locales/config";
import StringInput from "@/components/general/input/StringInput";
import ImageUploadWithPreview from "@/components/general/components/ImageUploadWithPreview";
import { SelectionGrid } from "@/components/general/components/SelectionGrid";
import VisualImageCard from "@/components/hq/components/VisualImageCard";
import {
  MODEL_PREVIEW_DEFAULTS,
  VISUAL_INPUT_TYPE,
} from "@/constants/visualInputFields";

const normalizeOption = (option, context, field) => {
  if (option && typeof option === "object") {
    return {
      id: option.id ?? option.value ?? option.label,
      label: option.label ?? option.title ?? option.value ?? option.id,
      previewImage: option.previewImage,
      previewColor: option.previewColor,
      creditCost: option.creditCost,
    };
  }

  const id = String(option);
  const label =
    field.translateOptions && context?.t
      ? String(context.t(id, sourceKey.user))
      : id;

  return { id, label };
};

const resolveOptions = (field, context) => {
  const sourceOptions = field.optionSource
    ? context?.[field.optionSource]
    : field.options;

  return Array.isArray(sourceOptions)
    ? sourceOptions.map((option) => normalizeOption(option, context, field))
    : [];
};

const resolveModelPart = (part, optionId, values) => {
  if (part === "$option") return optionId;
  const value = values?.[part];
  if (value) return value;
  if (part === "gender") return MODEL_PREVIEW_DEFAULTS.gender;
  if (part === "age") return MODEL_PREVIEW_DEFAULTS.age;
  if (part === "hair") return MODEL_PREVIEW_DEFAULTS.hair;
  return "";
};

const withModelPreviews = (options, field, context) => {
  if (!field.modelPreview || !context?.buildModelImageUrl) return options;

  return options.map((option) => {
    const optionId = String(option.id);
    const race = resolveModelPart(
      field.modelPreview.race,
      optionId,
      context.fieldValues
    );
    const gender = resolveModelPart(
      field.modelPreview.gender,
      optionId,
      context.fieldValues
    );
    const age = resolveModelPart(
      field.modelPreview.age,
      optionId,
      context.fieldValues
    );
    const hair = resolveModelPart(
      field.modelPreview.hair,
      optionId,
      context.fieldValues
    );

    return {
      ...option,
      previewImage: context.buildModelImageUrl(race, gender, age, hair),
    };
  });
};

const EmptyState = ({ children }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export const ImageUploadRenderer = ({ context }) => (
  <>
    {context.maxRequiredImages || context.minRequiredImages ? (
      <p className="text-sm text-muted-foreground mb-2">
        {context.minRequiredImages === context.maxRequiredImages
          ? `You need to upload ${context.maxRequiredImages} photo${context.maxRequiredImages > 1 ? "s" : ""}`
          : `You need to upload min of ${context.minRequiredImages} photo${context.minRequiredImages !== 1 ? "s" : ""} and max ${context.maxRequiredImages} photo${context.maxRequiredImages !== 1 ? "s" : ""}`}
      </p>
    ) : null}

    <ImageUploadWithPreview
      selectedImages={context.selectedImages}
      setSelectedImages={context.setSelectedImages}
      imagePreviews={context.imagePreviews}
      setImagePreviews={context.setImagePreviews}
      maxRequiredImages={context.maxRequiredImages}
      maxFileSize={10}
      showCounter
      gridCols="grid-cols-5 md:grid-cols-5"
      imageHeight={180}
    />
  </>
);

export const ImageSelectRenderer = ({ context }) => (
  <>
    {context.maxRequiredImages || context.minRequiredImages ? (
      <p className="text-sm text-muted-foreground mb-2">
        {context.minRequiredImages === context.maxRequiredImages
          ? `You need to select ${context.maxRequiredImages} photo${context.maxRequiredImages > 1 ? "s" : ""}`
          : `You need to select min of ${context.requiredImageCount} photo${context.requiredImageCount !== 1 ? "s" : ""} and max ${context.maxRequiredImages} photo${context.maxRequiredImages !== 1 ? "s" : ""}`}
      </p>
    ) : null}

    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm font-medium text-gray-700">
        {context.selectedSelectImageUrls?.size || 0} /{" "}
        {context.maxRequiredImages}
      </div>
      <Button
        type="button"
        onClick={context.refreshSelectImages}
        disabled={context.selectImageLoading || !context.selectImageIndustryCode}
      >
        Refresh
      </Button>
    </div>

    {context.selectImageLoading ? (
      <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
        Loading generated images...
      </div>
    ) : context.selectImageUrls?.length ? (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {context.selectImageUrls.map((url, index) => (
          <VisualImageCard
            key={`${url}-${index}`}
            src={url}
            alt="Generated visual"
            selectable
            selected={context.selectedSelectImageUrls.has(url)}
            onClick={() => context.toggleSelectImageUrl(url)}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
        <p>You should generate product first.</p>
        <Button
          type="button"
          className={`${context.selectedGradient} mt-4 hover:from-green-600 hover:to-blue-600 text-white border-0`}
          onClick={context.goToUpload}
        >
          Go to Upload
        </Button>
      </div>
    )}
  </>
);

export const ImageGridRenderer = ({ field, value, onChange, context }) => {
  const options = withModelPreviews(resolveOptions(field, context), field, context);

  if (!options.length) {
    return (
      <EmptyState>
        {field.emptyText || "No options available for this mode."}
      </EmptyState>
    );
  }

  return (
    <SelectionGrid
      imageSize={
        field.inputType === VISUAL_INPUT_TYPE.IMAGE_GRID_PORTRAIT
          ? "portrait"
          : "square"
      }
      label={field.label}
      options={options}
      selectedId={value}
      onSelect={onChange}
    />
  );
};

export const PillSelectRenderer = ({ field, value, onChange, context }) => {
  const options = resolveOptions(field, context);
  const isVisualGeneratorFlow = !!context?.visualGeneratorFlow;

  if (!options.length) {
    return (
      <EmptyState>
        {field.emptyText || "No options available for this mode."}
      </EmptyState>
    );
  }

  return (
    <div className={isVisualGeneratorFlow ? "" : "mb-6"}>
      {field.label && (
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
          {field.label}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={
                isVisualGeneratorFlow
                  ? `vg-opt-pill${isSelected ? " sel" : ""}`
                  : `rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function TextRenderer({ field, value, onChange }) {
  const [form] = Form.useForm();

  useEffect(() => {
    const formVal = form.getFieldValue(field.key);
    if (!formVal && value) {
      // Input shows empty but fieldValues has data - inject into form store
      form.setFieldsValue({ [field.key]: value });
    } else if (formVal && !value) {
      // External clear (e.g. Clear All button) - sync the clear to form store
      form.setFieldsValue({ [field.key]: "" });
    }
  }, [form, field.key, value]);

  return (
    <Form form={form}>
      <StringInput
        label={field.label}
        fieldName={field.key}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value || "")}
        required={field.required !== false}
      />
    </Form>
  );
}

export const TextAreaRenderer = ({ field, value, onChange }) => (
  <div>
    <label
      htmlFor={field.key}
      className={`mb-1 ${
        field.required !== false ? "required-label" : ""
      } small-text-size`}
      style={{ color: "#37333480" }}
    >
      {field.label}
    </label>
    <Input.TextArea
      id={field.key}
      value={typeof value === "string" ? value : ""}
      placeholder={field.placeholder}
      className="input-border"
      autoComplete="off"
      rows={4}
      onChange={(event) => onChange(event.target.value || "")}
    />
  </div>
);

export const ColorRenderer = ({ field, value, onChange }) => {
  const rawValue = typeof value === "string" ? value : "";
  const colorValue = /^#[0-9A-Fa-f]{6}$/.test(rawValue)
    ? rawValue
    : "#000000";

  return (
    <div>
      <label
        htmlFor={field.key}
        className={`mb-1 ${
          field.required !== false ? "required-label" : ""
        } small-text-size`}
        style={{ color: "#37333480" }}
      >
        {field.label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={`${field.key}-swatch`}
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value || "")}
          className="h-10 w-12 cursor-pointer rounded border border-gray-200"
        />
        <Input
          id={field.key}
          value={rawValue}
          placeholder={field.placeholder || "#000000"}
          className="input-border"
          autoComplete="off"
          onChange={(event) => onChange(event.target.value || "")}
        />
      </div>
    </div>
  );
};

export const UnsupportedFieldRenderer = ({ field }) => (
  <p className="text-sm text-muted-foreground">
    Unsupported input configuration: {String(field.key || field.input || field.id)}
  </p>
);

export const INPUT_RENDERERS = {
  [VISUAL_INPUT_TYPE.IMAGE_UPLOAD]: ImageUploadRenderer,
  [VISUAL_INPUT_TYPE.IMAGE_SELECT]: ImageSelectRenderer,
  [VISUAL_INPUT_TYPE.IMAGE_GRID_SQUARE]: ImageGridRenderer,
  [VISUAL_INPUT_TYPE.IMAGE_GRID_PORTRAIT]: ImageGridRenderer,
  [VISUAL_INPUT_TYPE.PILL_SELECT]: PillSelectRenderer,
  [VISUAL_INPUT_TYPE.TEXT]: TextRenderer,
  [VISUAL_INPUT_TYPE.TEXTAREA]: TextAreaRenderer,
  [VISUAL_INPUT_TYPE.COLOR]: ColorRenderer,
};
