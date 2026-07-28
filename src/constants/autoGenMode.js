import { sourceKey } from "@/locales/config";


// =========
// Constant
// =========

// Auto Gen Mode status 
export const AUTO_MODE_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  PAUSED: 2,
};

// Role Options
export const roleOptions = [
  { titleKey: "nTbloggerReview", value: "blogger" },
  { titleKey: "nTcustomerReview", value: "normal" },
  { titleKey: "nTeventPromotion", value: "sale" },
  { titleKey: "nTpersonalReview", value: "person" },
  { titleKey: "nTinternalStaff", value: "staff" },
];

export const AUTO_MODE_DEFAULT_ROLE = "normal";


// LANGUAGE constant
export const AUTO_MODE_LANGUAGE = {
  ENGLISH: "english",
  CHINESE: "chinese",
  MALAY: "malay",
};

export const AUTO_MODE_DEFAULT_LANGUAGE = AUTO_MODE_LANGUAGE.ENGLISH;

export const languageOptions = [
  { titleKey: "nTenglish", value: AUTO_MODE_LANGUAGE.ENGLISH },
  { titleKey: "nTchinese", value: AUTO_MODE_LANGUAGE.CHINESE },
  { titleKey: "nTmalay", value: AUTO_MODE_LANGUAGE.MALAY },
];

// Limit Generation 
export const GEN_LIMIT = { // Used in Auto GEN mode and Normal Gen mode.
  MIN: 1,
  MAX: 20
}



// =========
// Functions 
// =========

export const getRoleOptions = (t) =>
  roleOptions.map((item) => ({
    title: t(item.titleKey, sourceKey.user),
    value: item.value,
  }));


export const getLanguageOptions = (t) =>
  languageOptions.map((item) => {
    const resolvedTitle = t(item.titleKey, sourceKey.user);
    return {
      title:
        typeof resolvedTitle === "string"
          ? resolvedTitle
          : String(item.value),
      value: item.value,
    };
  });