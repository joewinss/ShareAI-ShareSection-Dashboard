export const buildSimilarUploadPath = (imageUrl) => (
    `/hq/upload?mode=Similar&preloadUrl=${encodeURIComponent(imageUrl)}`
);

const getSelectedImage = (images, selectedValue, getImageUrl) => {
    if (Number.isInteger(selectedValue)) return images[selectedValue];
    return images.find((image) => getImageUrl(image) === selectedValue);
};

export const getLastSelectedProductUrl = (
    images,
    selectedValues,
    productCode,
    getImageUrl = (image) => image?.imageUrl
) => {
    if (!Array.isArray(images) || typeof selectedValues?.forEach !== "function") return null;

    const normalizedProductCode = String(productCode || "").trim().toLowerCase();
    const selectedValueList = [];
    selectedValues.forEach((value) => selectedValueList.push(value));

    const selectedProduct = selectedValueList
        .reverse()
        .map((value) => getSelectedImage(images, value, getImageUrl))
        .find((image) => String(image?.visualIndustryCode || "").trim().toLowerCase() === normalizedProductCode);

    return selectedProduct ? getImageUrl(selectedProduct) : null;
};

export const getSingleSelectedProductUrl = (selectedValues, productUrl) => {
    if (!productUrl || typeof selectedValues?.forEach !== "function") return null;

    let selectedCount = 0;
    selectedValues.forEach(() => {
        selectedCount += 1;
    });

    return selectedCount === 1 ? productUrl : null;
};
