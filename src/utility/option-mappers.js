export const mapOutletOptions = (outlets = [], options = {}) => {
  const {
    fallbackTitle = "Unnamed Outlet",
    useUsernameFallback = true,
    includeAddress = false,
    includeBusinessInfo = false,
    addressFallback = "Worldwide",
    sortByTitle = false,
    dedupeByValue = false,
    extra,
  } = options;

  const list = Array.isArray(outlets) ? outlets : [];
  let mapped = list
    .map((outlet) => {
      const title =
        outlet?.businessInfo?.businessName ||
        (useUsernameFallback ? outlet?.username : undefined) ||
        fallbackTitle;
      const value = outlet?._id;
      if (!value) return null;
      const option = { title, value };
      if (includeAddress) {
        option.address =
          outlet?.businessInfo?.businessAddress?.address || addressFallback;
        // specialRemark overrides address for AI generation; fall back to address for old users without specialRemark
        option.specialRemark =
          outlet?.businessInfo?.specialRemark ||
          outlet?.businessInfo?.businessAddress?.address ||
          addressFallback;
      }
      if (includeBusinessInfo) {
        option.businessInfo = outlet?.businessInfo;
      }
      if (typeof extra === "function") {
        const extraFields = extra(outlet);
        if (extraFields && typeof extraFields === "object") {
          Object.assign(option, extraFields);
        }
      }
      return option;
    })
    .filter(Boolean);

  if (dedupeByValue) {
    const optionMap = new Map();
    mapped.forEach((option) => {
      if (!optionMap.has(option.value)) {
        optionMap.set(option.value, option);
      }
    });
    mapped = Array.from(optionMap.values());
  }

  if (sortByTitle) {
    mapped.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), undefined, {
        sensitivity: "base",
      })
    );
  }

  return mapped;
};
