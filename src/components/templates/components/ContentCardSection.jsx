import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dropdown, Modal } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import ImageSection from '@/components/general/components/ImageSection';
import { renderNameTag, renderOutletTag, renderStatusTag } from '@/utility/content-function';
import { Button as Button2 } from 'antd';
import { sourceKey } from '@/locales/config';
import { isVideoMedia } from '@/constants/mediaType';

const extractUrl = (entry) =>
    typeof entry === 'string' ? entry : entry?.url || null;

/**
 * ContentCardSection - Reusable card component for displaying content
 * @param {Object} props
 * @param {Object} props.template - The content/template data to display
 * @param {number} props.index - Index for animation delay
 * @param {Function} props.onPreviewClick - Callback when preview button is clicked
 * @param {Array} props.dropdownMenuItems - Array of menu items for dropdown
 * @param {Object} props.t - Translation function
 */
const ContentCardSection = ({
    template,
    index,
    onPreviewClick,
    dropdownMenuItems = [],
    t
}) => {
    const isVideo = isVideoMedia(template?.mediaType);
    const videoList = isVideo
        ? (template?.videoUrls || [])
            .map(extractUrl)
            .filter((url) => !!url)
        : [];
    const videoSrc = videoList[0] || null;
    const hasMultipleVideos = videoList.length > 1;
    const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const currentVideoSrc = videoList[currentVideoIndex] || null;

    const openVideoPreview = () => {
        setCurrentVideoIndex(0);
        setVideoPreviewOpen(true);
    };

    const showPrevVideo = (e) => {
        e?.stopPropagation();
        setCurrentVideoIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
    };

    const showNextVideo = (e) => {
        e?.stopPropagation();
        setCurrentVideoIndex((prev) => (prev + 1) % videoList.length);
    };

    return (
        <motion.div
            key={template._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="my-3"
        >
            <Card className="relative group hover:shadow-xl transition-all duration-300 border-0 bg-black/5 backdrop-blur-sm flex flex-col h-full pb-2 p-3 overflow-hidden">

                {template?.isShared === 1 && (
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none z-10">
                        <div className="absolute transform rotate-45 bg-red-600 text-white text-[10px] font-bold py-1 shadow-sm text-center w-[100px] -right-[28px] top-[12px]">
                            {t("nTshared", sourceKey.user)}
                        </div>
                    </div>
                )}
                {isVideo ? (
                    // Mirror ImageSection's wrapper + 144px media height so video and image cards line up
                    <div className="grey-base-bg-2 relative">
                        <div className="flex justify-center items-center aspect-ratio-1">
                            <div
                                className={`relative w-full h-[144px] ${videoSrc ? 'cursor-pointer group' : ''}`}
                                onClick={videoSrc ? openVideoPreview : undefined}
                            >
                                {videoSrc ? (
                                    <>
                                        <video
                                            src={videoSrc}
                                            preload="metadata"
                                            muted
                                            playsInline
                                            className="rounded-lg"
                                            style={{
                                                width: '100%',
                                                height: '144px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                background: '#000',
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg">
                                            <PlayCircle className="w-12 h-12 text-white/85 drop-shadow-lg" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-lg">
                                        {t("noVideo", sourceKey.user) || "No video"}
                                    </div>
                                )}
                            </div>
                        </div>
                        {videoSrc && (
                            <Modal
                                open={videoPreviewOpen}
                                onCancel={() => setVideoPreviewOpen(false)}
                                footer={null}
                                centered
                                width="auto"
                                destroyOnHidden
                                styles={{ body: { padding: 0, background: '#000' } }}
                            >
                                <div className="relative" style={{ background: '#000' }}>
                                    <video
                                        key={currentVideoSrc}
                                        src={currentVideoSrc}
                                        controls
                                        autoPlay
                                        playsInline
                                        style={{
                                            display: 'block',
                                            maxWidth: '90vw',
                                            maxHeight: '80vh',
                                            background: '#000',
                                        }}
                                    />
                                    {hasMultipleVideos && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={showPrevVideo}
                                                aria-label="Previous video"
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={showNextVideo}
                                                aria-label="Next video"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                                                {currentVideoIndex + 1} / {videoList.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Modal>
                        )}
                    </div>
                ) : (
                    <ImageSection
                        img={template?.imageUrls}
                        style={{ width: "100%", height: "100%" }}
                        divClassName={"aspect-ratio-1"}
                        imgClassName="rounded-lg"
                        status={template?.status}
                    />
                )}

                <div className='mt-1'>
                    <div>
                        {/* <div className="medium-text-size font-bold mb-1 line-clamp-1">
                            {template?.title}
                        </div> */}
                        <div className="xsmall-text-size line-clamp-2">
                            {template?.contentText}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 flex-grow flex flex-col">
                    <div className="flex flex-col justify-between xsmall-text-size text-gray-500 pt-1 auto-width">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                            {renderOutletTag(template?.outletBusinessName)}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                            {renderNameTag(template?.productName)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        {/* More Options Dropdown - only show if there are menu items */}
                        {template?.isShared === 0 && dropdownMenuItems?.length > 0 && (
                            <Dropdown
                                menu={{ items: dropdownMenuItems }}
                                trigger={['click']}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-black/15 bg-white/85"
                                >
                                    <MoreOutlined className="w-4 h-4" />
                                </Button>
                            </Dropdown>
                        )}

                        {/* Preview Button */}
                        <Button2
                            size="sm"
                            className="w-full"
                            onClick={onPreviewClick}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {t("preview", sourceKey.user)}
                        </Button2>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default ContentCardSection;
