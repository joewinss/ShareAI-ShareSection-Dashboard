import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
// import { LeftOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import { ChevronLeft } from 'lucide-react';

const MobileFormDrawer = (props) => {
    const {
        loading,
        greyContent,
        closable = true,
        maskClosable = true,
        className,
        placement = "right"
    } = props;
    const { t } = useTranslation();

    function close() {
        if (props.onClose) {
            props.onClose();
        }
    }

    return (
        <>
            <Drawer
                className={`${className ? className : "body-padding"}`}
                open={props.open}
                placement={placement}
                width={props.width ? props.width : "100%"}
                closable={closable}
                maskClosable={maskClosable}
                zIndex={props.zIndex}
                closeIcon={<ChevronLeft style={{ color: "black", fontSize: "12px" }} />}
                loading={loading}
                title={
                    <div className="flex justify-between">
                        <div
                            className="flex flex-row cursor-pointer"
                            onClick={() => close()}
                        >
                            {closable && (
                                <span className="flex items-center medium-text-size text-black " >
                                    {props.closeText ? props.closeText : t("back", sourceKey.user)}
                                </span>
                            )}
                        </div>
                        <div className={`flex items-center ${closable && !props.extra ? 'mr-10' : ''}`}>
                            {props.title}
                        </div>
                        <div>
                            {props.extra && props.extra}
                        </div>

                    </div>
                }
                onClose={() => close()}
                footer={props.footer}
            >
                <div className="relative min-h-full flex flex-col">
                    <div className={`flex-grow ${greyContent && "lightgreybox-bg-color"}`}>
                        {props.content ? props.content : props.children}
                    </div>
                    {props.customBottomNavBar &&
                        <div
                            className="z-10 sticky bottom-0 py-3 w-full flex items-center px-3"
                            style={{
                                backdropFilter: "blur(15px)",
                                height: props?.customHeight ? props?.customHeight : "fit-content",
                            }}
                        >
                            {props.customBottomNavBar}
                        </div>
                    }
                </div>
            </Drawer>
        </>
    )
}

export default MobileFormDrawer;