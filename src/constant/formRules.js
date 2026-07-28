import { GEN_LIMIT } from "@/constants/autoGenMode";

export const useFormRules = (t, sourceKey) => ({
    title: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("titleIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    presetTemplate: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("presetTemplateIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    platform: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("platformIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    image: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size" style={{ color: 'red' }}>
                            {t("imageIsRequired", sourceKey.voucher)}
                        </span>);
                }
            },
        },
    ],
    category: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("categoryIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    productName: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("productNameIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    sellingHighlight: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("sellingHighlightIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    promotionalMessage: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("promotionalMessageIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    productType: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("productTypeIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    outlet: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("outletIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    language: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("languageIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    targetAudience: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("targetAudienceIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    writingStyle: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("writingStyleIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    hashtag: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("hashtagIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    wording: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("wordingIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    numberOfPosts: [
        {
            validator: (_, value) => {
                if (!value || value < GEN_LIMIT.MIN || value > GEN_LIMIT.MAX) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("numberOfPostsIsRequired", sourceKey.user)} ({GEN_LIMIT.MIN}-{GEN_LIMIT.MAX} only)
                        </span>
                    );
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    categoryTitle: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("categoryTitleIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    knowledgeBase: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("knowledgeBaseIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    businessName: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("businessNameIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
    countryCode: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("countryCodeRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    contactNo: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("contactNoRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    address: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("addressRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    state: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("stateRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    city: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("cityRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    zipCode: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("zipCodeRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    industry: [
        {
            validator: (_, value) => {
                if (value) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("industryRequired", sourceKey.user)}
                        </span>);
                }
            },
        },
    ],
    businessDescription: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text">
                            {t("businessDescriptionIsRequired", sourceKey.user)}
                        </span>
                    );
                } else {
                    // Count English words and Chinese characters
                    const englishWords = value
                        .split(/\s+/)
                        .filter((word) => /[a-zA-Z]/.test(word));
                    const chineseCharacters = value
                        .split("")
                        .filter((char) => /[\u4e00-\u9fa5]/.test(char));
                    const totalWordCount =
                        englishWords.length + chineseCharacters.length;

                    if (totalWordCount > 300) {
                        return Promise.reject(
                            <span className="xsmall-text-size red-text">
                                {t("wordingExceedsLimit", sourceKey.user)}
                            </span>
                        );
                    }

                    return Promise.resolve();
                }
            },
        },
    ],
    password: [
        {
            validator: (_, value) => {
                if (!value) {
                    setPasswordValid(false);
                    return Promise.reject(
                        <span className="xsmall-text-size red-text">
                            {t("passwordRequired", sourceKey.user)}
                        </span>
                    );
                } else {
                    return Promise.resolve();
                }
            },
        },
    ],
    confirmPassword: [
        {
            validator: (rule, value) => {
                if (value !== form.getFieldValue("password") || !value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text">
                            {t("passwordNotMatch", sourceKey.user)}
                        </span>
                    );
                } else {
                    return Promise.resolve();
                }
            },
        },
    ],
    email: [
        {
            validator: (_, value) => {
                const type = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text">
                            {t("emailRequired", sourceKey.user)}
                        </span>
                    );
                } else if (!type.test(value)) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text">
                            {t("invalidEmail", sourceKey.user)}
                        </span>
                    );
                }
                else {
                    return Promise.resolve();
                }
            },
        },
    ],
    presetName: [
        {
            validator: (_, value) => {
                if (!value) {
                    return Promise.reject(
                        <span className="xsmall-text-size red-text" >
                            {t("nTpresetNameIsRequired", sourceKey.user)}
                        </span>);
                } else {
                    return Promise.resolve();
                }
            },
        }
    ],
})
