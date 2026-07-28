import React from "react";
import { Carousel, Button } from "antd";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const IMAGE_HEIGHT = 180;

const SampleNextArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
        zIndex: 1,
        display: className.includes("slick-disabled") ? "none" : "block",
      }}
    >
      <Button
        onClick={onClick}
        shape="circle"
        icon={<ChevronRight size={24} />}
      />
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div
      style={{
        position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)", zIndex: 1,
      }}
    >
      <Button
        onClick={onClick}
        shape="circle"
        icon={<ChevronLeft size={24} />}
      />
    </div>
  );
};

const BeforeAfterCarousel = ({
  sets = [],
  stickToBottom = false,
  showClose = false,
  onClose,
  hideDotsWhenSingle = false,
}) => {
  const hasSingle = sets.length <= 1;
  const carouselSettings = {
    dots: hasSingle ? !hideDotsWhenSingle : true,
    autoplay: true,
    arrows: hasSingle ? false : true,
    nextArrow: hasSingle ? undefined : <SampleNextArrow />,
    prevArrow: hasSingle ? undefined : <SamplePrevArrow />,
  };

  const renderSingle = (item) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <img
        src={item.before}
        alt="Before"
        style={{
          width: "clamp(150px, 35vw, 260px)",
          height: IMAGE_HEIGHT,
          borderRadius: 8,
          objectFit: "contain",
          backgroundColor: "#f3f4f6",
        }}
      />
      <ArrowRight size={20} color="black" />
      <img
        src={item.after}
        alt="After"
        style={{
          width: "clamp(150px, 35vw, 260px)",
          height: IMAGE_HEIGHT,
          borderRadius: 8,
          objectFit: "contain",
          backgroundColor: "#f3f4f6",
        }}
      />
    </div>
  );

  const renderMultiInput = (item) => {
    const inputs = Array.isArray(item.inputs) ? item.inputs.filter(Boolean) : [];
    const output = item.output || item.after;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {inputs.slice(0, 2).map((src, idx) => (
          <React.Fragment key={`input-${idx}-${src}`}>
            {idx > 0 && <span style={{ fontSize: 20, fontWeight: 700 }}><Plus /></span>}
            <img
              src={src}
              alt={`Input ${idx + 1}`}
              style={{
                width: "clamp(130px, 30vw, 220px)",
                height: IMAGE_HEIGHT,
                borderRadius: 8,
                objectFit: "contain",
                backgroundColor: "#f3f4f6",
              }}
            />
          </React.Fragment>
        ))}
        <ArrowRight size={20} color="black" />
        <img
          src={output}
          alt="Output"
          style={{
            width: "clamp(150px, 35vw, 260px)",
            height: IMAGE_HEIGHT,
            borderRadius: 8,
            objectFit: "contain",
            backgroundColor: "#f3f4f6",
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        position: stickToBottom ? "fixed" : "relative",
        bottom: stickToBottom ? 0 : "auto",
        left: stickToBottom ? "var(--sidebar-width, 256px)" : "auto",
        right: stickToBottom ? 0 : "auto",
        width: stickToBottom ? "auto" : "100%",
        maxWidth: "100%",
        background: "#fcfcfc", // lighter grey
        boxShadow: stickToBottom ? "0 -2px 8px rgba(0,0,0,0.08)" : "none",
        zIndex: stickToBottom ? 999 : "auto",
        marginBottom: stickToBottom ? 0 : "16px",
      }}
    >
      {/* ⭐ Center container matching your page layout */}
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: stickToBottom ? "12px 20px 18px" : "12px 20px",
        }}
      >
        <div style={{ position: "relative" }}>
          {showClose && (
            <Button
              shape="circle"
              size="small"
              onClick={onClose}
              style={{
                position: "absolute",
                top: -8,
                right: -4,
                zIndex: 2,
                width: 28,
                height: 28,
                minWidth: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
              icon={<span style={{ fontSize: 14, lineHeight: 1 }}>×</span>}
            />
          )}
          <Carousel {...carouselSettings}>
            {sets.map((item, index) => (
              <div key={index} style={{ padding: 12 }}>
                {/* Title */}
                <h3
                  style={{
                    textAlign: "center",
                    marginBottom: 14,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {`Example Type : "${item.title}"`}
                </h3>
                {/* Layout */}
                {Array.isArray(item.inputs) && item.inputs.length > 1
                  ? renderMultiInput(item)
                  : renderSingle(item)}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterCarousel;
