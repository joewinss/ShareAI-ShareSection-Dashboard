import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Armchair,
  Box,
  BriefcaseBusiness,
  Globe,
  House,
  Palette,
  Shirt,
  Smartphone,
  Sparkles,
} from "lucide-react";
import getVisualCategoryListings from "@/pages/api/visualCategory/getVisualCategoryListings";
import { message } from "antd";
import UploadArea from "./UploadArea";
import { VISUAL_CATEGORY_STATUS } from "@/constants/image";
import { VISUAL_INDUSTRY_CODE } from "@/constants/visualMode";
import ProcessingModeCard from "../components/uploadArea/ProcessingModeCard";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import getVisualIndustryListings from "@/pages/api/visualIndustry/getVisualIndustryListings";
import UploadAreaV3 from "./UploadAreaV3";

const selectedGradient = "bg-gradient-to-r from-green-500 to-blue-500";
const industryIconByCode = {
  [VISUAL_INDUSTRY_CODE.BASIC_INTERIOR]: House,
  [VISUAL_INDUSTRY_CODE.BUSINESS_PORTRAIT]: BriefcaseBusiness,
  [VISUAL_INDUSTRY_CODE.DESIGN]: Palette,
  [VISUAL_INDUSTRY_CODE.PRODUCT]: Box,
  [VISUAL_INDUSTRY_CODE.FASHION]: Shirt,
  [VISUAL_INDUSTRY_CODE.FURNITURE]: Armchair,
  [VISUAL_INDUSTRY_CODE.BEAUTY]: Sparkles,
  [VISUAL_INDUSTRY_CODE.ELECTRONICS]: Smartphone,
};
const defaultIndustryTabs = [{ id: "All", label: "All Industries", icon: Globe, industryId: null },];
const normalizeIndustryCode = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const buildIndustryTabs = (list) => {
  const apiTabs = Array.isArray(list) ? list.map((item) => {
    const Icon = industryIconByCode[normalizeIndustryCode(item?.industryCode)] || Globe;
    const label = item?.industryName;
    const id = item?._id;
    return {
      id,
      label,
      icon: Icon,
      industryId: item?._id,
    };
  }) : [];
  return [defaultIndustryTabs[0], ...apiTabs];
};

const UploadPageV2 = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [modes, setModes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [industryTabs, setIndustryTabs] = useState(defaultIndustryTabs);
  const router = useRouter();
  const { mode } = router.query;
  const { t } = useTranslation();

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


  const getTabItems = () => {
    return getVisualIndustryListings(100, 0, {
      status: VISUAL_CATEGORY_STATUS.ACTIVE,
    })
      .then((res) => {
        const list = res?.data;
        setIndustryTabs(buildIndustryTabs(list));
      })
      .catch((err) => {
        console.log(err);
        message.error(err?.message);
      });
  };

  const getVisualCategory = (visualIndustryId) => {
    setIsLoading(true);
    const query = { status: VISUAL_CATEGORY_STATUS.ACTIVE };
    if (visualIndustryId) {
      query.visualIndustryId = visualIndustryId;
    }

    return getVisualCategoryListings(100, 0, query)
      .then((res) => {
        const list = res?.data;
        const resolvePreview = (candidate) => {
          if (!candidate) return null;
          if (typeof candidate === "string") return candidate;
          return null;
        };
        const normalized = Array.isArray(list)
          ? list.map((record) => {
            const min = record?.estimateTimeMinSeconds;
            const max = record?.estimateTimeMaxSeconds;
            const estimatedTime = `${min}-${max} seconds`;
            const tally = record?.maxCost === record?.minCost
              ? record?.minCost
              : `${record?.minCost}-${record?.maxCost}`;
            const firstPreview = Array.isArray(record?.param)
              ? record.param
                .map((p) => {
                  const before = resolvePreview(Array.isArray(p?.beforeSamplePhoto)
                    ? p.beforeSamplePhoto[0]
                    : p?.beforeSamplePhoto
                  );
                  const after = resolvePreview(Array.isArray(p?.samplePhoto)
                    ? p.samplePhoto[0]
                    : p?.samplePhoto
                  );
                  return { before, after };
                }).find(Boolean)
              : null;

            // Image type card's value 
            return {
              id: record?._id,
              title: record?.title || "Untitled",
              description: record?.description || "No description provided",
              before: firstPreview?.before,
              after: firstPreview?.after,
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
  };

  function getData() {
    getTabItems();
    getVisualCategory();
  }

  const handleTabChange = (tab) => {
    setActiveCategory(tab.id);
    setSelectedMode(null);
    getVisualCategory(tab.industryId);
  };

  //After select mode direct to Upload Area
  if (mode) {
    return (
      <div className="min-h-screen bg-background">
        <main className="w-full">
          {/* <UploadArea mode={mode} selectedGradient={selectedGradient} /> */}
          <UploadAreaV3 mode={mode} selectedGradient={selectedGradient} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-60">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("nTselectMode", sourceKey.user)}
          </h1>
          <p className="text-muted-foreground">
            {t("nTchooseProcessingMode", sourceKey.user)}
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("nTselectModeType", sourceKey.user)}
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {industryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                    ? `${selectedGradient} text-white shadow-md`
                    : "bg-white border border-border text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && modes.length === 0 ? (
          <div className="text-muted-foreground">{t("nTloadingModes", sourceKey.user)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
            {modes.map((modeOption) => {
              const isSelected = selectedMode === modeOption.title;

              return (
                <ProcessingModeCard
                  key={modeOption.id}
                  modeOption={modeOption}
                  isSelected={isSelected}
                  isLoading={isLoading}
                  onSelect={() => setSelectedMode(modeOption.title)}
                  onProceed={handleProceed}
                />
              );
            })}
            {!isLoading && modes.length === 0 && (
              <div className="text-muted-foreground col-span-full">
                {t("nTnoProcessingMode", sourceKey.user)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UploadPageV2;
