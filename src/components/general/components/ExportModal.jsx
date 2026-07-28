import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { Modal } from "antd";
import React, { useEffect, useState } from "react";

const ExportModal = (props) => {
    const { onOK, loading, } = props;
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(props.open === true)
    }, [props.open]);

    function close() {
        if (props.onClose) {
            props.onClose()
        }
    }

    return (
        <>
            <Modal
                className="blue-modal"
                title={t("exportData", sourceKey.user)}
                open={visible}
                onCancel={() => close()}
                confirmLoading={loading}
                onOk={() => {
                    onOK();
                    close();
                }}
            >
                {t("exportConfirmation", sourceKey.user)}
            </Modal>
        </>
    );
};

export default ExportModal;
