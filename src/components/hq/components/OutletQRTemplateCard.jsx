import React, { forwardRef } from "react";
import { QRCode } from "antd";
import { QrLogo1, QrLogo2, QrLogo3, QrLogo4, Consi } from "../../../../public/assets";

const normalizeImageUrl = (url) => {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
};

const getProxiedImageUrl = (url) => {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";
  if (
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("/")
  ) {
    return normalized;
  }
  if (typeof window !== "undefined" && normalized.startsWith(window.location.origin)) {
    return normalized;
  }
  return `/api/images/proxy-image?url=${encodeURIComponent(normalized)}`;
};

const OutletQRTemplateCard = forwardRef(
  (
    {
      businessName = "",
      qrValue = "",
      headline = "",
      description = "",
      description2 = "",
      icon1 = QrLogo1,
      icon2 = QrLogo2,
      icon3 = QrLogo3,
      icon4 = QrLogo4,
      qrIcon = "",
      mode = "default",
      className = "",
    },
    ref
  ) => {
    const qrDisplaySize = 200;
    const qrPixelRatio = 3;
    const qrIconSize = Math.round(qrDisplaySize * 1.0);
    const resolvedQrIcon = getProxiedImageUrl(qrIcon);
    const getMtpnBusinessNameClass = (name) => {
      const length = name.trim().length;

      if (length <= 18) return "text-xl";
      if (length <= 26) return "text-lg";
      if (length <= 34) return "text-base";
      if (length <= 42) return "text-sm";
      return "text-xs";
    };

    // Part A: default layout
    const renderDefaultCard = () => (
      <div
        ref={ref}
        className={`bg-[#8F0000] pt-6 pb-8 px-6 w-[320px] text-center ${className}`.trim()}
      >
        <div className="flex-1 flex flex-col items-center">
          {/* Title */}
          <h1 className="text-white mb-6 text-lg font-semibold tracking-wide">
            {businessName}
          </h1>

          {/* QR */}
          <div className="bg-white rounded-3xl w-[230px] h-[230px] mx-auto flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.35)] border border-white/70 mb-6">
            <QRCode
              type="canvas" // or "svg" if you're printing
              size={qrDisplaySize * qrPixelRatio}
              style={{ width: qrDisplaySize, height: qrDisplaySize }}
              bordered={false}
              bgColor="#ffffff"
              icon={resolvedQrIcon || undefined}
              iconSize={resolvedQrIcon ? qrIconSize : undefined}
              value={qrValue || " "}
              errorLevel="H"
            />
          </div>

          {/* Divider */}
          <div className="w-14 h-px bg-white/35 mb-6" />

          {/* Headline */}
          {headline && (
            <h2 className="text-white font-semibold text-base">{headline}</h2>
          )}

          {/* Main description */}
          {description && (
            <p className="text-white/85 text-sm mt-1 leading-snug px-2">
              {description}
            </p>
          )}

          {/* Optional description 2 */}
          {description2 && (
            <p className="text-white/70 text-xs mt-3 leading-snug px-4">
              {description2}
            </p>
          )}
        </div>
      </div>
    );

    // Part B: mtpn layout
    const renderMtpnCard = () => {
      return (
        <div
          ref={ref}
          className={`relative w-[320px] h-[424px] overflow-hidden ${className}`.trim()}
        >
          <img
            src={Consi}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {businessName && (
            <div className="absolute left-1/2 top-14 w-full -translate-x-1/2 px-6 text-center">
              <p
                className={`${getMtpnBusinessNameClass(
                  businessName
                )} font-semibold text-[#2D4B7C] leading-tight`}
              >
                {businessName}
              </p>
            </div>
          )}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-3xl w-[220px] h-[220px] mx-auto flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.25)] border border-white/80">
              <QRCode
                type="canvas" // or "svg" if you're printing
                size={qrDisplaySize * qrPixelRatio}
                style={{ width: qrDisplaySize, height: qrDisplaySize }}
                bordered={false}
                bgColor="#ffffff"
                icon={resolvedQrIcon || undefined}
                iconSize={resolvedQrIcon ? qrIconSize : undefined}
                value={qrValue || " "}
                errorLevel="H"
              />
            </div>
          </div>
        </div>

        // OLD VERSION OF MTPN
        // <div
        //   ref={ref}
        //   className={`w-[320px] bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden p-8 flex flex-col items-center gap-6 border border-gray-100 ${className}`}
        // >
        //   {/* 1. Business Name */}
        //   <h2 className="text-2xl font-bold text-gray-900 text-center tracking-tight leading-tight uppercase">
        //     {businessName}
        //   </h2>

        //   {/* 2. Headline Above */}
        //   {headline && (
        //     <p className="text-sm text-gray-500 font-medium text-center -mb-2">
        //       {headline}
        //     </p>
        //   )}

        //   {/* 3. QR Code in gray box */}
        //   <div className="bg-[#F3F3F3] p-6 rounded-[2rem] flex items-center justify-center shadow-inner">
        //     <QRCode
        //       type="canvas" // or "svg" if you're printing
        //       size={qrDisplaySize * qrPixelRatio}
        //       style={{ width: qrDisplaySize, height: qrDisplaySize }}
        //       bordered={false}
        //       bgColor="#F3F3F3"
        //       value={qrValue}
        //       errorLevel="H"
        //     />
        //   </div>

        //   {/* 4. Row of 4 Icons */}
        //   <div className="flex w-full pt-4 border-t border-gray-100 items-center justify-center gap-4">
        //     <div className="grid grid-cols-3 gap-4">
        //       <div className="flex items-center justify-center">
        //         <img
        //           src={icon2}
        //           alt="icon 2"
        //           className="w-10 h-10 object-contain"
        //         />
        //       </div>
        //       <div className="flex items-center justify-center">
        //         <img
        //           src={icon1}
        //           alt="icon 1"
        //           className="w-15 h-12 object-contain"
        //         />
        //       </div>
        //       <div className="flex items-center justify-center">
        //         <img
        //           src={icon3}
        //           alt="icon 3"
        //           className="w-11 h-11 object-contain mb-2"
        //         />
        //       </div>
        //     </div>
        //     <div className="flex items-center justify-center w-20 flex-shrink-0">
        //       <img
        //         src={icon4}
        //         alt="icon 4"
        //         className="h-12 w-auto object-contain"
        //       />
        //     </div>
        //   </div>
        // </div>
      );
    };

    if (mode === "mtpn") {
      return renderMtpnCard();
    }

    return renderDefaultCard();
  }
);

OutletQRTemplateCard.displayName = "OutletQRTemplateCard";
export default OutletQRTemplateCard;
