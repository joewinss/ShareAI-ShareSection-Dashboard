import { formatDate } from "@/utility/common-functions";
import React, { useState } from "react";

const InfoBlock = ({ fields, proofImages, title, infoTitle }) => {
  const isImageFile = (url) => {
    return /\.(jpeg|jpg|png|webp|gif)$/i.test(url);
  };

  const FieldRow = ({ item, isLast }) => {
    const [expanded, setExpanded] = useState(false);
    const value = item?.value;
    const hasLabel = Boolean(item?.label);

    const shouldTruncate = typeof value === "string" && value.length > 200;
    const displayValue =
      shouldTruncate && !expanded ? `${value.substring(0, 200)}...` : value;

    return (
      <div>
        <div
          className={`small-text-size ${
            hasLabel ? "flex justify-between" : "w-full"
          }`}
        >
          {hasLabel && <span className="grey-second-text">{item?.label}</span>}
          <span
            className={`${hasLabel ? "text-right" : "block w-full text-left"}`}
            style={hasLabel ? { maxWidth: "60%" } : undefined}
          >
            {displayValue || "N/A"}
            {shouldTruncate && (
              <button
                type="button"
                className="ml-2 text-blue-500 underline xsmall-text-size"
                onClick={() => setExpanded((s) => !s)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </span>
        </div>
        {!isLast && <hr className="my-2.5 border-gray-200" />}
      </div>
    );
  };
  return (
    <>
      <div>
        <div className="small-text-size py-1 font-bold">{infoTitle}</div>
        <div className="border rounded-lg p-3 lightgrey-bg space-y-3">
          {/* Regular Fields */}
          {fields && fields.length > 0 && (
            <div>
              {fields.map((item, idx) => (
                <FieldRow
                  key={idx}
                  item={item}
                  isLast={idx === fields.length - 1}
                />
              ))}
            </div>
          )}

          {/* Proof Images Section */}
          {proofImages && proofImages.length > 0 && (
            <div className="space-y-2">
              {fields && fields.length > 0 && (
                <hr className="my-2.5 border-gray-200" />
              )}

              <div className="flex items-center">
                <span className="grey-second-text small-text-size">
                  {title}
                </span>
              </div>

              {proofImages
                .slice()
                .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                .map((proof, index) => {
                  const isImage = isImageFile(proof.imageLink);

                  return (
                    <div key={index} className="">
                      <div className="proof-image">
                        <div className="flex justify-end items-center mb-2">
                          <div className="grey-second-text xsmall-text-size">
                            {formatDate(
                              proof.uploadedAt,
                              "DD MMM YYYY HH:mm:ss"
                            ) || null}
                          </div>
                          <a
                            href={proof.imageLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline ml-4 xsmall-text-size"
                          >
                            View File
                          </a>
                        </div>
                        {isImage ? (
                          <img
                            src={proof.imageLink}
                            alt={`Proof ${index + 1}`}
                            style={{
                              width: "100%",
                              maxHeight: "500px",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <div className="xsmall-text-size grey-second-text italic">
                            File cannot be previewed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfoBlock;
