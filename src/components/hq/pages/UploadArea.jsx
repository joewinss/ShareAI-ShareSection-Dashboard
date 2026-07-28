import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ImageUploadWithPreview from "@/components/general/components/ImageUploadWithPreview";
import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import { VISUAL_CATEGORY_STATUS } from "@/constants/image";
import startVisualGenerationAndQueue from "@/pages/api/visualCategory/startVisualGenerationAndQueue";
import { Upload, Palette, Box, ChevronRight, Loader2 } from "lucide-react";
import { CabinetDrawer } from "@/components/general/components/CabinetDrawer";
import { SelectionGrid } from "@/components/general/components/SelectionGrid";
import { connect, useDispatch } from "react-redux";
import { updateWallet } from "@/redux/actions/user-actions";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import BeforeAfterCarousel from "@/components/general/components/BeforeAfterCarousal";
import getCurrentUsageAndLimitByUserId from "@/pages/api/user/getCurrentUsageAndLimitByUserId";


//Global Config for this page
const defaultGradient = "bg-gradient-to-r from-green-500 to-blue-500";
const AppStep = {
  UPLOAD_IMAGE: 1,
  SELECT_STYLE: 2,
  SELECT_ANGLE: 3,
};

const UploadArea = ({ mode, selectedGradient = defaultGradient, userId, updateWallet }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedAngle, setSelectedAngle] = useState("");
  const [currentStep, setCurrentStep] = useState(AppStep.UPLOAD_IMAGE);
  const [maxRequiredImages, setMaxRequiredImages] = useState(1)
  const [minRequiredImages, setMinRequiredImages] = useState(0)
  const requiredImages = minRequiredImages ? minRequiredImages : 1;
  const hasMinImages = selectedImages.length >= requiredImages;
  const [angleCreditMap, setAngleCreditMap] = useState({});
  const [carousalOpen, setCarousalOpen] = useState(true);


  const resolvePreview = (candidate) => {
    if (!candidate) return null;
    if (typeof candidate === "string") return candidate;
    if (typeof candidate === "object" && candidate.url) return candidate.url;
    return null;
  };

  //First things will do when push to this page: Get Mode details & options     
  useEffect(() => {
    getData();
  }, [mode]);

  // Clear status
  useEffect(() => {
    setCurrentStep(AppStep.UPLOAD_IMAGE);
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedAngle("");
    setMaxRequiredImages(1);
    setMinRequiredImages(0);
    setCarousalOpen(true);
  }, [mode]);


  //Get Mode details & options
  function getData() {
    setIsLoading(true);
    getVisualCategoryListings(1, 0, {
      title: mode,
      status: VISUAL_CATEGORY_STATUS.ACTIVE,
    })
      .then((res) => {
        const list = Array.isArray(res?.data)
          ? res.data.filter((entry) => entry && Object.keys(entry).length)
          : [];



        const normalized = list.map((record) => ({
          id: record?._id,
          title: record?.title || "",
          param: record?.param || [],
          modes: Array.isArray(record?.modes) ? record.modes : [],
          credits: record?.creditCost ?? record?.credits ?? 0,
          imageInputMaxCount: record?.imageInputMaxCount,
          imageInputMinCount: record?.imageInputMinCount,
        })).filter((item) => item.title);

        const decodedMode =
          typeof mode === "string" ? decodeURIComponent(mode) : mode;
        const match =
          normalized.find((record) => record.title === decodedMode) ||
          normalized[0] ||
          null;
        setMaxRequiredImages(match?.imageInputMaxCount ?? 1); //Set Max Image Input 
        setMinRequiredImages(match?.imageInputMinCount ?? 0);// Set Min Image Input
        const creditLookup = {};
        (match?.modes || []).forEach((m) => {
          if (m?.type || m?.name) {
            creditLookup[m.type || m.name] = m.creditCost;
          }
        });
        setAngleCreditMap(creditLookup);
        setSelectedRecord(match);
        setSelectedType("");
      })
      .catch((err) => {
        console.error("Failed to load visual categories:", err);
        message.error(err?.message || "Failed to load modes");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }



  //Map Photo with Id, Label, Preview, and Sample photo (sample photo is angle's example photo)
  const styleOptions =
    Array.isArray(selectedRecord?.param) && selectedRecord.param.length
      ? selectedRecord.param.map((p, idx) => {
        const sample = Array.isArray(p?.samplePhoto)
          ? p.samplePhoto[0]
          : p?.samplePhoto;
        const allSamples = Array.isArray(p?.samplePhoto)
          ? p.samplePhoto.map((s) => resolvePreview(s)).filter(Boolean)
          : [];
        return {
          id: p?.name || `style-${idx}`,
          label: p?.name || `Style ${idx + 1}`,
          previewImage: resolvePreview(sample),
          samplePhotos: allSamples,
        };
      })
      : [];

  const photoSets = useMemo(() => {
    const params = Array.isArray(selectedRecord?.param)
      ? selectedRecord.param
      : [];

    return params
      .map((p, variantIdx) => {
        const beforeArray = Array.isArray(p?.beforeSamplePhoto)
          ? p.beforeSamplePhoto
          : p?.beforeSamplePhoto
            ? [p.beforeSamplePhoto]
            : [];
        const afterArray = Array.isArray(p?.samplePhoto)
          ? p.samplePhoto
          : p?.samplePhoto
            ? [p.samplePhoto]
            : [];

        const beforeImages = beforeArray
          .map((entry) => resolvePreview(entry))
          .filter(Boolean);
        const afterImages = afterArray
          .map((entry) => resolvePreview(entry))
          .filter(Boolean);

        if (!beforeImages.length && !afterImages.length) return null;

        const layout = beforeImages.length > 1 ? "multi-input" : "single";

        return {
          title: p?.name || selectedRecord?.title || `Variant ${variantIdx + 1}`,
          before: beforeImages[0],
          after: afterImages[0],
          inputs: beforeImages,
          output: afterImages[0],
          layout,
        };
      })
      .filter(Boolean);
  }, [selectedRecord]);

  // Map the selected_Type for angle showing relevant photo example
  const selectedStyle = useMemo(
    () => styleOptions.find((opt) => opt.id === selectedType),
    [styleOptions, selectedType]
  );

  //Render Photo based on the mapped type 
  const angleOptions = useMemo(() => {
    const apiModes = Array.isArray(selectedRecord?.modes)
      ? selectedRecord.modes.filter((m) => m && (m.type || m.name))
      : [];
    if (!apiModes.length) return [];
    const samples = selectedStyle?.samplePhotos || [];
    return apiModes
      .map((m, idx) => ({
        id: m.type || m.name || `mode-${idx}`,
        label: t(m.type, sourceKey.user) || m.type,
        previewImage: resolvePreview(
          samples[idx] ||
          samples[0] ||
          (Array.isArray(m?.samplePhoto) ? m.samplePhoto[0] : m?.samplePhoto)
        ),
        creditCost: m?.creditCost,
      }))
      .filter((opt) => opt.previewImage);
  }, [selectedRecord, selectedStyle]);


  // Map the selected_Angle for angle showing relevant photo example
  const selectedAngleOption = useMemo(
    () => angleOptions.find((opt) => opt.id === selectedAngle),
    [angleOptions, selectedAngle]
  );

  //Let Credit Total Change IF angle options will charge more credit
  const displayedCredit = useMemo(() => {
    if (angleOptions.length) {
      if (selectedAngle) {
        const credit =
          angleCreditMap[selectedAngle] ??
          angleOptions.find((opt) => opt.id === selectedAngle)?.creditCost;
        if (typeof credit === "number") return credit;
      }
      const creditValues = Object.values(angleCreditMap).filter(
        (v) => typeof v === "number"
      );
      if (creditValues.length) return Math.min(...creditValues);
    }
    return typeof selectedRecord?.credits === "number" ? selectedRecord.credits : 0;
  }, [angleOptions, angleCreditMap, selectedAngle, selectedRecord]);


  useEffect(() => {
    if (selectedAngle && !angleOptions.find((opt) => opt.id === selectedAngle)) {
      setSelectedAngle("");
    }
  }, [angleOptions, selectedAngle]);


  // Send Request to Back End
  const generatePhoto = async () => {
    try {
      setIsLoading(true);
      if (!hasMinImages) {
        message.error(`Please upload at least ${requiredImages} image${requiredImages > 1 ? "s" : ""} to generate`);
        setIsLoading(false);
        setCurrentStep(AppStep.UPLOAD_IMAGE);
        return;
      }

      //Error handling 
      const hasStyleRequirement =
        Array.isArray(selectedRecord?.param) && selectedRecord.param.length;
      if (hasStyleRequirement && !selectedType) {
        message.error("Please select a style before generating");
        setIsLoading(false);
        setCurrentStep(AppStep.SELECT_STYLE);
        return;
      }

      //Send here
      const data = {
        "type": selectedType,
        "mode": selectedAngle,
        "images[]": selectedImages
      }
      await startVisualGenerationAndQueue(data)
      const userData = await getCurrentUsageAndLimitByUserId();
      const wallet = userData?.wallets || [];
      updateWallet(wallet);
      message.success("Visual generation started successfully!");
      router.push("/hq/upload")
    } catch (error) {
      console.error("Content generation failed:", error);
      message.error(error?.message || "Failed to generate visuals");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <div className="flex flex-row items-center gap-3">
        <Button
          onClick={() => router.push("/hq/upload")}
          className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0`}
        >
          <ArrowLeftOutlined />
        </Button>
        <h1
          className="font-bold text-foreground mb-2"
          style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
        >
          {mode}
        </h1>
      </div>

      <div className="mt-6 max-w-5xl space-y-4">

        {/* {carousalOpen && photoSets.length > 0 ? (
          <div className="mt-6">
            <BeforeAfterCarousel
              sets={photoSets}
              // stickToBottom={true}
              showClose={true}
              onClose={() => setCarousalOpen(false)}
            />
          </div>
        ) : null} */}

        {/* Step 1 : Upload Image */}
        <CabinetDrawer
          step={AppStep.UPLOAD_IMAGE}
          title="Upload Image"
          icon={Upload}
          isActive={currentStep === AppStep.UPLOAD_IMAGE}
          isCompleted={!!selectedImages.length}
          disabled={false}
          summary={
            selectedImages.length
              ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""
              } selected`
              : "Select your product photo"
          }
          onSelect={setCurrentStep}
        >
          {/* Show Message for How much of phto is needed. */}
          {(maxRequiredImages || minRequiredImages) ? (
            <p className="text-sm text-muted-foreground mb-2">
              {minRequiredImages === maxRequiredImages
                ? `You need to upload ${maxRequiredImages} photo${maxRequiredImages > 1 ? "s" : ""}`
                : `You need to upload min of ${minRequiredImages} photo${minRequiredImages !== 1 ? "s" : ""} and max ${maxRequiredImages} photo${maxRequiredImages !== 1 ? "s" : ""}`}
            </p>
          ) : null}
          <ImageUploadWithPreview
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            imagePreviews={imagePreviews}
            setImagePreviews={setImagePreviews}
            maxRequiredImages={maxRequiredImages}
            maxFileSize={10}
            showCounter={true}
            gridCols="grid-cols-5 md:grid-cols-5"
            imageHeight={180}
          />

          <div className="flex justify-end mt-4">
            <Button
              className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
              onClick={() => setCurrentStep(AppStep.SELECT_STYLE)}
              disabled={!hasMinImages}
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CabinetDrawer>


        {/* Step 2 : Choose Style */}
        <CabinetDrawer
          step={AppStep.SELECT_STYLE}
          title="Choose Style"
          icon={Palette}
          isActive={currentStep === AppStep.SELECT_STYLE}
          isCompleted={!!selectedType}
          disabled={!hasMinImages}
          summary={selectedStyle?.label}
          onSelect={setCurrentStep}
        >
          <SelectionGrid
            label="Select a style"
            options={styleOptions}
            selectedId={selectedType}
            onSelect={(id) => setSelectedType(id)}
          />

          <div className="flex justify-end">
            <Button
              className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
              onClick={() => setCurrentStep(AppStep.SELECT_ANGLE)}
              disabled={!selectedType && styleOptions.length > 0}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CabinetDrawer>


        {/* Step 3 : Angle & Generate */}
        <CabinetDrawer
          step={AppStep.SELECT_ANGLE}
          title="Perspective & Generate"
          icon={Box}
          isActive={currentStep === AppStep.SELECT_ANGLE}
          disabled={!hasMinImages || !selectedType}
          summary={selectedAngleOption?.label || (angleOptions.length ? "Select angle" : null)}
          onSelect={setCurrentStep}
        >
          {/* Check Is angle selection is provided  */}
          {angleOptions.length ? (
            <SelectionGrid
              label="Select camera angle"
              options={angleOptions}
              selectedId={selectedAngle}
              onSelect={setSelectedAngle}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No angle options available for this mode.
            </p>
          )}
          <div className="mt-6 space-y-3">
            <div className="text-sm text-muted-foreground text-left">
              {selectedAngle === "fix" ? t("nTfixDesc", sourceKey.user) : selectedAngle === "free" ? t("nTfreeDesc", sourceKey.user) : null}
            </div>
            <div className="text-sm text-muted-foreground text-right">
              Credit cost: {displayedCredit}
            </div>
            <Button
              className={`${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0 w-full`}
              size="lg"
              onClick={generatePhoto}
              disabled={isLoading}
            >
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Box className="h-4 w-4" />
                )}
                {isLoading ? "Generating..." : "Generate Now"}
              </span>
            </Button>
          </div>
        </CabinetDrawer>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  userId: state.user?.user?._id,
});

const mapDispatchToProps = {
  updateWallet
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadArea);
