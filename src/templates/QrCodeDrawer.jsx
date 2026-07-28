
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { useTranslation } from '@/locales/useTranslation';
import { adminAPI } from '@/pages/api';
import { QRCode } from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
export const QrCodeDrawer = (props) => {
    const { selectedRecord } = props
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: "640px" });
    // const [QRCode, setQRCode] = useState("");
    const [deepLinkUrl, setDeepLinkUrl] = useState("");
    useEffect(() => {
        setOpen(props?.open === true);
        generateQR();
    }, [props?.open]);

    function onClose() {
        setOpen(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    // function generateQR() {
    //     setLoading(true);
    //     adminAPI.regenerateQRCode({

    //     })
    //         .then((res) => {

    //             setQRCode(res.data.qrCode.qrCodeDataUrl);
    //             setLoading(false);
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             setLoading(false);
    //         })
    // }

    function generateQR() {
        setLoading(true);

        const link = 'xhs://';

        setDeepLinkUrl(link);
        setLoading(false);
    }


    return (
        < MobileFormDrawer
            open={open}
            width={isMobile ? "100%" : "400px"}
            className="body-no-padding"
            closable={true}
            placement={"left"}
            destroyOnClose={true}
            onClose={() => onClose()}
            zIndex={2000}
            title={
                <div>
                    {/* {t("description", sourceKey.user)} */}
                </div>
            }
        >
            {/* <div className='flex justify-center'>
                <img src={QRCode} />
            </div> */}

            {deepLinkUrl && !loading ? (
                <QRCode value={deepLinkUrl} />
            ) : (
                <div>Loading...</div>
            )}

        </MobileFormDrawer>
    )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(QrCodeDrawer)