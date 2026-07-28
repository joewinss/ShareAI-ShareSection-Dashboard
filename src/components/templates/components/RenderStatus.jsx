import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
import React from 'react'
import { connect } from 'react-redux'

export const RenderStatus = (props) => {
    const { t } = useTranslation();

    let bgClassName = "";
    let label = "";
    if (props.status) {
        switch (props.status) {
            case 1:
                bgClassName = "dark-blue-bg";
                label = t("redeemed", sourceKey.user);
                break;
            case 2:
                bgClassName = "dark-blue-bg";
                label = t("redeemed", sourceKey.user);
                break;
            case "Pending":
                bgClassName = "orange-bg";
                label = t("pending", sourceKey.user);
                break;
            // case "Completed":
            //     bgClassName = "green-bg";
            //     label = t("completed", sourceKey.user);
            //     break;
            case 99: // HardCoded
                bgClassName = "dark-blue-bg";
                label = t("usedDeal", sourceKey.user);
                break;
            default:
                break;
        }
    }

    return (
        <span className={`${bgClassName} rounded-full px-2 py-1 white-text`}>
            {label}
        </span>
    );
};


const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RenderStatus)