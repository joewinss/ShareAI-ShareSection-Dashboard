import { StepKey } from "@/constants/visualMode";

export const VISUAL_INPUT_TYPE = {
  IMAGE_UPLOAD: "image-upload",
  IMAGE_SELECT: "image-select",
  PILL_SELECT: "pill-select",
  TEXT: "text",
  TEXTAREA: "textarea",
  COLOR: "color",
};

export const TEXT_INPUT_FALLBACKS = {
  [StepKey.COMPANY_NAME]: {
    label: "Company Name",
    placeholder: "Company Name",
  },
  [StepKey.ABOUT]: {
    label: "About",
    placeholder: "About",
  },
  [StepKey.WEBSITE]: {
    label: "Website",
    placeholder: "Website",
  },
  [StepKey.TITLE]: {
    label: "Title",
    placeholder: "Title",
  },
  [StepKey.SUBTITLE]: {
    label: "Subtitle",
    placeholder: "Subtitle",
  },
  [StepKey.DESCRIPTION]: {
    label: "Description",
    placeholder: "Description",
  },
  [StepKey.INFO]: {
    label: "Info",
    placeholder: "Info",
  },
  [StepKey.NOTES]: {
    label: "Website Link",
    placeholder: "Website Link",
  },
  [StepKey.CORPORATE_COLOR]: {
    label: "Corporate Color",
    placeholder: "Corporate Color",
  },
  [StepKey.THEME]: {
    label: "Theme",
    placeholder: "Enter your Theme",
  },
  [StepKey.BACKGROUND]: {
    label: "Background",
    placeholder: "Enter your Background",
  },
  [StepKey.COSTUME]: {
    label: "Costume",
    placeholder: "Enter your Costume",
  },
};

export const MODEL_PREVIEW_DEFAULTS = {
  gender: "F",
  age: "21",
  hair: "L",
};

export const VISUAL_INPUT_FIELDS = {
  [StepKey.UPLOAD]: {
    inputType: VISUAL_INPUT_TYPE.IMAGE_UPLOAD,
    label: "Upload Image",
    payloadKey: null,
  },
  [StepKey.SELECT_IMAGE]: {
    inputType: VISUAL_INPUT_TYPE.IMAGE_SELECT,
    label: "Select Image",
    payloadKey: null,
  },
  [StepKey.PARAM]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Select a style",
    optionSource: "styleOptions",
    payloadKey: "type",
    payloadMode: "manual",
    emptyText: "No style options available for this mode.",
  },
  [StepKey.CAMERA]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Camera Angle",
    optionSource: "angleOptions",
    payloadKey: "mode",
    emptyText: "No angle options available for this mode.",
  },
  [StepKey.RATIO]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Ratio",
    payloadKey: "ratio",
    translateOptions: true,
    emptyText: "No ratio options available for this mode.",
  },
  [StepKey.UNIT]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Unit",
    payloadKey: "unit",
    emptyText: "No unit options available for this mode.",
  },
  [StepKey.STYLE]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Style",
    payloadKey: "style",
    emptyText: "No style options available for this mode.",
  },
  [StepKey.FLOORING]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Flooring",
    payloadKey: "flooring",
    emptyText: "No flooring options available for this mode.",
  },
  [StepKey.VIEW1]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "View 1",
    payloadKey: "view1",
    emptyText: "No view 1 options available for this mode.",
  },
  [StepKey.VIEW2]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "View 2",
    payloadKey: "view2",
    emptyText: "No view 2 options available for this mode.",
  },
  [StepKey.VIEW3]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "View 3",
    payloadKey: "view3",
    emptyText: "No view 3 options available for this mode.",
  },
  [StepKey.VIEW4]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "View 4",
    payloadKey: "view4",
    emptyText: "No view 4 options available for this mode.",
  },
  [StepKey.CONTENT]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Content",
    payloadKey: "content",
    emptyText: "No content options available for this mode.",
  },
  [StepKey.COMPANY_NAME]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "companyName",
    ...TEXT_INPUT_FALLBACKS[StepKey.COMPANY_NAME],
  },
  [StepKey.ABOUT]: {
    inputType: VISUAL_INPUT_TYPE.TEXTAREA,
    payloadKey: "about",
    ...TEXT_INPUT_FALLBACKS[StepKey.ABOUT],
  },
  [StepKey.WEBSITE]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "website",
    ...TEXT_INPUT_FALLBACKS[StepKey.WEBSITE],
  },
  [StepKey.TITLE]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "title",
    hideWhen: { key: StepKey.CONTENT, value: "auto" },
    skipPayloadWhen: { key: StepKey.CONTENT, value: "auto" },
    ...TEXT_INPUT_FALLBACKS[StepKey.TITLE],
  },
  [StepKey.SUBTITLE]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "subtitle",
    hideWhen: { key: StepKey.CONTENT, value: "auto" },
    skipPayloadWhen: { key: StepKey.CONTENT, value: "auto" },
    ...TEXT_INPUT_FALLBACKS[StepKey.SUBTITLE],
  },
  [StepKey.DESCRIPTION]: {
    inputType: VISUAL_INPUT_TYPE.TEXTAREA,
    payloadKey: "description",
    ...TEXT_INPUT_FALLBACKS[StepKey.DESCRIPTION],
  },
  [StepKey.INFO]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "info",
    ...TEXT_INPUT_FALLBACKS[StepKey.INFO],
  },
  [StepKey.NOTES]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "notes",
    ...TEXT_INPUT_FALLBACKS[StepKey.NOTES],
  },
  [StepKey.CORPORATE_COLOR]: {
    inputType: VISUAL_INPUT_TYPE.COLOR,
    payloadKey: "corporateColor",
    ...TEXT_INPUT_FALLBACKS[StepKey.CORPORATE_COLOR],
  },
  [StepKey.THEME]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "theme",
    ...TEXT_INPUT_FALLBACKS[StepKey.THEME],
  },
  [StepKey.BACKGROUND]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "background",
    ...TEXT_INPUT_FALLBACKS[StepKey.BACKGROUND],
  },
  [StepKey.COSTUME]: {
    inputType: VISUAL_INPUT_TYPE.TEXT,
    payloadKey: "costume",
    ...TEXT_INPUT_FALLBACKS[StepKey.COSTUME],
  },
  [StepKey.RACE]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Race",
    payloadKey: "race",
    modelPreview: {
      race: "$option",
      gender: StepKey.GENDER,
      age: StepKey.AGE,
      hair: StepKey.HAIR,
    },
  },
  [StepKey.GENDER]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Gender",
    payloadKey: "gender",
    modelPreview: {
      race: StepKey.RACE,
      gender: "$option",
      age: StepKey.AGE,
      hair: StepKey.HAIR,
    },
  },
  [StepKey.AGE]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Age",
    payloadKey: "age",
    modelPreview: {
      race: StepKey.RACE,
      gender: StepKey.GENDER,
      age: "$option",
      hair: StepKey.HAIR,
    },
  },
  [StepKey.HAIR]: {
    inputType: VISUAL_INPUT_TYPE.PILL_SELECT,
    label: "Hair",
    payloadKey: "hair",
    modelPreview: {
      race: StepKey.RACE,
      gender: StepKey.GENDER,
      age: StepKey.AGE,
      hair: "$option",
    },
  },
};

export const getVisualInputFieldConfig = (key) =>
  key ? VISUAL_INPUT_FIELDS[key] || null : null;

export const getPayloadFieldEntries = () =>
  Object.entries(VISUAL_INPUT_FIELDS).filter(
    ([, config]) => config.payloadKey && config.payloadMode !== "manual"
  );
