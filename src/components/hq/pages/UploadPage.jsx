import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coins } from "lucide-react";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import { message } from "antd";
import UploadArea from "./UploadArea";
import BeforeAfterCarousel from "@/components/general/components/BeforeAfterCarousal";
import { VISUAL_CATEGORY_STATUS } from "@/constants/image";

const selectedGradient = "bg-gradient-to-r from-green-500 to-blue-500";
const UploadPage = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [modes, setModes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { mode } = router.query;
  const [carousalOpen, setCarousalOpen] = useState(true);

  const handleProceed = () => {
    if (selectedMode) {
      router.push({ pathname: "/hq/upload", query: { mode: selectedMode } });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!mode) {
      setSelectedMode(null);
    }
    if (mode) {
      document.getElementById("app-scroll-container").scrollTo({ top: 0, behavior: "smooth" }); // Scroll to Top of Upload Area
    }
  }, [mode]);

  useEffect(() => {
    // Re-open carousel when a new mode is selected and examples exist
    if (selectedMode) {
      setCarousalOpen(true);
    }
  }, [selectedMode]);

  function getData() {
    setIsLoading(true);

    getVisualCategoryListings({ status: VISUAL_CATEGORY_STATUS.ACTIVE })
      .then((res) => {
        const list = res?.data;

        const resolvePreview = (candidate) => {
          if (!candidate) return null;
          if (typeof candidate === "string") return candidate;
          if (typeof candidate === "object" && candidate.url) return candidate.url;
          return null;
        };

        const normalized = Array.isArray(list)
          ? list.map((record) => {
            const min = record?.estimateTimeMinSeconds;
            const max = record?.estimateTimeMaxSeconds;
            const estimatedTime = `${min}-${max} seconds`;

            const topLevelSample = Array.isArray(record?.samplePhoto)
              ? record.samplePhoto[0]
              : record?.samplePhoto;

            const tally =
              record?.maxCost === record?.minCost
                ? record?.minCost
                : `${record?.minCost}-${record?.maxCost}`;

            const beforeAfterSets = Array.isArray(record?.param)
              ? record.param
                .filter((p) => {
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
                  return beforeArray.length > 0 || afterArray.length > 0;
                })
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

                  const beforeImages = beforeArray.map((entry) => resolvePreview(entry)).filter(Boolean);
                  const afterImages = afterArray.map((entry) => resolvePreview(entry)).filter(Boolean);

                  const layout = beforeImages.length > 1 ? "multi-input" : "single";

                  return {
                    title:
                      p?.name ||
                      record?.title ||
                      `Variant ${variantIdx + 1}`,
                    before: beforeImages[0],
                    after: afterImages[0],
                    inputs: beforeImages,
                    output: afterImages[0],
                    layout,
                  };
                })
              : [];

            // Image type card's value 
            return {
              id: record?._id,
              title: record?.title || "Untitled",
              description: record?.description || "No description provided",
              icon: resolvePreview(topLevelSample),
              beforeAfterSets,
              estimatedTime,
              credits: tally,
            };
          })
          : [];
        setModes(normalized);
      })

      .catch((err) => {
        console.log(err);
        message.error(err?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  //After select mode direct to Upload Area
  if (mode) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UploadArea mode={mode} selectedGradient={selectedGradient} />
        </main>
      </div>
    );
  }

  // const selectedModeData = modes.find((m) => m.title === selectedMode);
  // const photoSets = selectedModeData?.beforeAfterSets || [];

  return (
    <div className="min-h-screen bg-background pb-60">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Select Processing Mode
          </h1>
          <p className="text-muted-foreground">
            Choose how you want to process your product images
          </p>
        </div>

        {isLoading && modes.length === 0 ? (
          <div className="text-muted-foreground">Loading modes...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {modes.map((modeOption) => {
              const isSelected = selectedMode === modeOption.title;

              return (
                <div
                  key={modeOption.id}
                  className={`cursor-pointer rounded-xl p-[2px] transition-all ${isSelected ? `${selectedGradient} shadow-lg` : "bg-transparent"
                    }`}
                  onClick={() => setSelectedMode(modeOption.title)}
                >
                  <Card
                    className={`h-full flex flex-col transition-all hover:shadow-lg ${isSelected ? "border-none" : ""
                      }`}
                  >
                    <CardHeader>
                      <div className="flex items-end justify-between mb-2">
                        {isSelected && (
                          <Badge
                            variant="default"
                            className={`${selectedGradient} border-0 text-white hover:from-green-600 hover:to-blue-600`}
                          >
                            Selected
                          </Badge>
                        )}
                      </div>
                      {modeOption.icon ? (
                        <div className="rounded-lg flex items-center justify-center overflow-hidden h-40 bg-muted">
                          <img
                            src={modeOption.icon}
                            alt={modeOption.title}
                            className="w-full h-full object-cover"  // Fit card size
                          // className="w-auto h-auto max-w-full max-h-full" // show full image
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg flex items-center justify-center h-40 bg-muted text-muted-foreground">
                          {/* No sample photo available from API */}
                          No preview
                        </div>
                      )}
                      <CardTitle className="text-xl mt-2">
                        {modeOption.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4 pb-4">
                      <p className="text-sm text-muted-foreground">
                        {modeOption.description}
                      </p>

                      {isSelected ? (<div className="mb-3">
                        <div className="flex justify-center">
                          <Button
                            onClick={handleProceed}
                            disabled={!selectedMode || isLoading}
                            size="lg"
                            className={`px-8 mt-4 ${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0`}
                          >
                            Proceed to Upload
                          </Button>
                        </div>
                      </div>) : null}

                      <div className="mt-auto space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Coins className="w-4 h-4" />
                            Credit Cost
                          </span>
                          <span className="font-semibold">
                            {modeOption.credits}{" "}
                            {typeof modeOption.credits === "number" &&
                              modeOption.credits > 1
                              ? "credits"
                              : "credit"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Est. Time
                          </span>
                          <span className="font-semibold">
                            {modeOption.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {!isLoading && modes.length === 0 && (
              <div className="text-muted-foreground col-span-full">
                No processing modes available from the API.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* <div className="flex justify-center">
            <Button
              onClick={handleProceed}
              disabled={!selectedMode || isLoading}
              size="lg"
              className={`px-8 mt-4 ${selectedGradient} hover:from-green-600 hover:to-blue-600 text-white border-0`}
            >
              Proceed to Upload
            </Button>
          </div> */}

          {/* {carousalOpen && photoSets.length > 0 && (
            <div className="w-full">
              <BeforeAfterCarousel sets={photoSets} stickToBottom={true} showClose={true} onClose={() => setCarousalOpen(false)} />
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
