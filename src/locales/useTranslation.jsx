import localStorage from "local-storage";
import { get, isString, map } from "lodash";
import { allTranslationJson } from "./index";
// import { languages } from "../utilities/profile";

const defaultLocale = "en";
export const useTranslation = () => {
    let locales = "";
    locales = localStorage.get("locale") || "";
    const locale = locales || defaultLocale;
    //   const matchedLanguage = map(languages, "value");

    //   if (matchedLanguage.includes(locale)) {
    //     localStorage.set("locale", locale);
    //   } else {
    localStorage.set("locale", defaultLocale);
    //   }

    return {
        t: (term, key) => {
            const translation = get(
                allTranslationJson,
                `${locale}.["${isString(key) ? `${key}.` : ""}${term}"]`
            );
            return Boolean(translation) ? translation : term;
        },
        languages: locales,
        changeLanguage: (lang) => {
            localStorage.set("locale", lang);
            window.location.reload();
        },
        defaultLanguage: defaultLocale,
    };
};
