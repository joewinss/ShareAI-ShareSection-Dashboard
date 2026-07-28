import { useEffect, useState } from "react";
import { Col, Row, Typography, Dropdown, Menu, message } from "antd";
import { facebook, imageExample, LogoGoodnite, redNote, TransalationIcon2, TranslationIcon } from "../../../../public/assets";
import { Button } from "@/components/ui/button";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import ShareListItem from "../component/ShareListItem";
import SinglePopUpModal from "@/general/components/SinglePopUpModal";
import { isEmpty } from "lodash";
import getGlobalShare from "@/pages/api/global-share/getGlobalShare";
import shareGlobalContent from "@/pages/api/global-share/shareGlobalContent";

const ShareSectionMainPage = () => {
    const [langOpen, setLangOpen] = useState(false);
    const { Text } = Typography;
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [filterGroup, setFilterGroup] = useState({});
    // Language modal state
    const [languageModalOpen, setLanguageModalOpen] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [tempSelectedLanguage, setTempSelectedLanguage] = useState('English');
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(false);
    const [shareContentModalOpen, setShareContentModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(0);
    const [platformList, setPlatformList] = useState([]);
    const [shareContent, setShareContent] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState({})

    const languageOptions = [
        { key: 'English', label: 'EN' },
        { key: 'Chinese', label: '中' },
        { key: 'Malay', label: 'Melayu' }
    ];

    const languageMenu = (
        <Menu
            style={{
                background: 'rgba(255,255,255,0.8)',
            }}
            selectedKeys={[selectedLanguage]}
        >
            {languageOptions.map(opt => (
                <Menu.Item
                    key={opt.key}
                    onClick={() => setSelectedLanguage(opt.key)}
                    className={selectedLanguage === opt.key ? 'ant-menu-item-selected' : ''}
                >
                    {opt.label}
                </Menu.Item>
            ))}
        </Menu>
    );

    const tabData = [
        {
            key: 1,
            label: t("share", sourceKey.home),
        },
        {
            key: 2,
            label: t("follow", sourceKey.home),
        },
    ];

    const [selectedKey, setSelectedKey] = useState(tabData[0]?.key || null);
    useEffect(() => {

        getData((page - 1) * PAGE_SIZE);
    }, [page, filterGroup, selectedLanguage]);

    const getData = async (skip) => {
        setLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        const filterParams = {
            limit: PAGE_SIZE,
            page: page,
            action: "platforms",
            language: selectedLanguage,
            // action: "content",
            // platform: "rednote",
            ...filterGroup
        };

        try {
            const response = await getGlobalShare(filterParams);

            if (response?.data) {
                setPlatformList(response.data.platforms);

            }
        } catch (error) {
            message.error(error?.message);
        } finally {
            setLoading(false);
        }
    };

    async function handleShareContent(platform) {
        setLoading(true)
        try {
            const response = await getGlobalShare({ platform: platform, action: "content", language: selectedLanguage });

            if (response?.data) {

                setShareContent(response?.data?.content)
                setSelectedPlatform(response?.data?.platform)
                // setAllContent(response.data.content || response.data);
                // setTotal(response.data.summary?.totalItems || response.data.length);
            }
        } catch (error) {
            message.error(error?.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSwitchContent(platform) {
        setLoading(true)
        try {
            const response = await getGlobalShare({ platform: platform, action: "switch", language: selectedLanguage });

            if (response?.data) {
                setShareContent(response?.data?.content)
                setSelectedPlatform(response?.data?.platform)
            }
        } catch (error) {
            message.error(error?.message);
        } finally {
            setLoading(false);
        }
    }


    async function handlePostContent(content) {
        setLoading(true)
        try {
            const response = await shareGlobalContent({ contentId: content });

            if (response?.success) {
                navigator.clipboard.writeText(shareContent?.text || '');
                message.success(response?.data?.message);
                setShareContentModalOpen(false)
            }
        } catch (error) {
            message.error(error?.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Language Modal */}
            <SinglePopUpModal
                type="chooseLanguage"
                open={languageModalOpen}
                height={"auto"}
                closeable={true}
                onClose={() => setLanguageModalOpen(false)}
                extraData={{
                    selected: tempSelectedLanguage,
                    onSelect: setTempSelectedLanguage,
                    languageOptions,
                }}
                confirmBtn1={() => {
                    setSelectedLanguage(tempSelectedLanguage);
                    setLanguageModalOpen(false);
                }}
            />

            {/* Share Content Modal */}
            <SinglePopUpModal
                type="shareContent"
                open={shareContentModalOpen}
                closeable={true}
                height={"auto"}
                modalLoading={loading}
                onClose={() => setShareContentModalOpen(false)}
                extraData={{
                    imgSrc: shareContent?.images,
                    title: `${selectedPlatform?.displayName}`,
                    description: shareContent?.text,
                    selectedType,
                    onSelectType: setSelectedType,
                    shareButtonText: `Share ${selectedPlatform?.displayName}`,
                    onShare: () => {
                        setShareContentModalOpen(false);
                    },
                }}
                confirmBtn1={() => { handleSwitchContent(selectedPlatform?.name) }}
                confirmBtn2={() => { handlePostContent(shareContent?.id) }}

            />
            <div
                style={{
                    height: 120,
                    background: "linear-gradient(180deg, #D90000 0%, #730000 100%)",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <Dropdown
                        overlay={languageMenu}
                        trigger={["click"]}
                        open={langOpen}
                        onOpenChange={setLangOpen}
                        placement="bottomRight"
                    >
                        <Button
                            variant="white"
                            width={32}
                            height={32}
                        >
                            <img src={TransalationIcon2} />
                        </Button>
                    </Dropdown>
                </div>
                <img
                    src={LogoGoodnite}
                    alt="Goodnite"
                    style={{
                        height: 60,
                        width: 60,
                        borderRadius: "100%",
                        position: "absolute",
                        left: "50%",
                        bottom: -30,
                        transform: "translateX(-50%)",
                    }}
                />
            </div>
            <div className="py-10 px-3 flex flex-col items-center w-full">
                <div className="secondary-color-text large-text-size semibold-font pb-2">{t("goodniteMalaysiaHQ", sourceKey.user)}</div>
                <div className="w-screen max-w-full px-0 flex flex-col items-center">
                    <div className="flex justify-center space-x-3 w-full relative">
                        {tabData.map(({ key, label }) => (
                            <div
                                key={key}
                                className="relative flex flex-col items-center cursor-pointer px-2 pb-2 gap-2"
                                onClick={() => {
                                    setSelectedKey(key);
                                }}
                            >
                                <span className={`small-text-size ${selectedKey === key ? 'text-[#1766A4]' : ''}`} >
                                    {label}
                                </span>
                                {/* Blue underline flush with border */}
                                {selectedKey === key && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1766A4] rounded-t" style={{ zIndex: 2 }} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="w-screen max-w-full h-[1px] bg-[#EFECE6] relative -mt-[2px]" style={{ zIndex: 1 }} />
                    <div className="pt-5 w-full space-y-2">
                        {(isEmpty(platformList)) ? (
                            <div className="text-center text-gray-500 py-10">
                                {t("noAvailableContent", sourceKey.user)}
                            </div>
                        ) : (
                            platformList.map(platform => {
                                let iconSrc = null;
                                if (platform.name === "rednote") {
                                    iconSrc = redNote;
                                } else if (platform.name === "facebook") {
                                    iconSrc = facebook;
                                }
                                return (
                                    <ShareListItem
                                        key={platform.id}
                                        imgSrc={iconSrc}
                                        text={platform.displayName}
                                        buttonText="Share"
                                        onButtonClick={() => { setShareContentModalOpen(true); handleShareContent(platform.name) }}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShareSectionMainPage;