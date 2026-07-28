import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { Image, Spin } from 'antd';

export const ImageSection = (props) => {
    const {
        img,
        shareIcon,
        closeIcon,
        divClassName,
        imgClassName,
        discount,
        action,
        style,
        status,
        width = "2000px"
    } = props;
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: "640px" });
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="grey-base-bg-2 relative">
            <div
                className={`flex justify-center items-center ${divClassName} ${action && "rounded-lg relative group overflow-hidden cursor-pointer select-none"}`}
                onClick={status === 1 && typeof action === 'function' ? action : undefined}
            >
                <Image.PreviewGroup>
                    {img && img.length > 0 ? (
                        <>
                            {/* Display only the first image */}
                            <div className="relative w-full h-[144px]">
                                {isImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 rounded-lg">
                                        <Spin />
                                    </div>
                                )}
                                <Image
                                    src={img[0]}
                                    alt="ProductImg"
                                    className={`${imgClassName || ""} ${action ? "group-hover:blur-sm transition duration-300 ease-in-out" : ""}`}
                                    width="100%"
                                    height={144}
                                    style={{
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        opacity: isImageLoading ? 0 : 1,
                                        transition: 'opacity 0.3s ease',
                                        height: '144px'
                                    }}
                                    preview={true}
                                    draggable={false}
                                    onLoad={() => {
                                        setIsImageLoading(false);
                                        setHasError(false);
                                    }}
                                    onError={() => {
                                        setIsImageLoading(false);
                                        setHasError(true);
                                    }}
                                />
                            </div>
                            {/* Hidden images for preview only */}
                            {img.slice(1).map((imageUrl, imgIdx) => (
                                <Image
                                    key={imgIdx + 1}
                                    src={imageUrl}
                                    alt={`ProductImg ${imgIdx + 2}`}
                                    style={{ display: 'none' }}
                                    preview={true}
                                />
                            ))}
                        </>
                    ) : (
                        <Image
                            src="error"
                            alt="error"
                            width="100%"
                            fallback="data:image/png;base64,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"
                            height={144}
                            preview={false}
                        />
                    )}
                </Image.PreviewGroup>



                {/* {status === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <span className="text-white font-semibold small-text-size">
                            {t("redeemed", sourceKey.home)}
                        </span>
                    </div>
                )}

                {voucherStatus === 6 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <span className="text-white font-semibold small-text-size">
                            {t("fullyRedeemed", sourceKey.home)}
                        </span>
                    </div>
                )} */}

                {/* Show the "See Details" button when status is 1 */}
                {/* {status === 1 && action && (
                    <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out"
                        onClick={typeof action === 'function' ? action : undefined}
                    >
                        <span className="text-white text-lg font-semibold">
                            {t("seeDetails", sourceKey.voucher)}
                        </span>
                    </div>
                )} */}
            </div>

            {/* Close Icon */}
            {closeIcon && (
                <div
                    className="absolute top-0 left-0 m-2 p-1 rounded-full cursor-pointer select-none shadow-md hover:shadow-lg"
                    style={{ background: "#FFF" }}
                    onClick={closeIcon}
                >
                    <img src={CloseIcon} width={24} />
                </div>
            )}

            {/* Share Icon */}
            {shareIcon && (
                <div
                    className="absolute top-0 right-0 m-2 p-2 rounded-full cursor-pointer select-none shadow-md hover:shadow-lg"
                    style={{ background: "#FFF" }}
                    onClick={shareIcon}
                >
                    <img src={ShareIcon} width={16} />
                </div>
            )}

            {/* Discount Badge */}
            {discount && (
                <div className="absolute bottom-0 left-0 m-1 px-2 py-0.5 rounded-full shadow-md small-text-size brown-bg">
                    {discount}
                </div>
            )}
        </div>
    );
};


const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ImageSection)