import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import MobileFormDrawer from '@/components/general/components/MobileFormDrawer';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { Table } from 'antd';
import ListingTable from '@/components/general/components/ListingTable';

const SharedListDrawer = (props) => {
    const { selectedRecord, user } = props;
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setOpen(props?.open === true);
    }, [props?.open, selectedRecord]);

    function onClose() {
        setOpen(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    const columns = [
        {
            title: t("businessName", sourceKey.user),
            dataIndex: 'businessName',
            key: 'businessName',
            render: (text) => <strong>{text}</strong>,
        }
    ];

    return (
        <>
            <MobileFormDrawer
                closable={true}
                onClose={onClose}
                open={open}
                width={"360px"}
                zIndex={1200}
                title={t("nTsharedUnit", sourceKey.user)}
            >
                <Table
                    dataSource={selectedRecord?.applicableOutletDetails || []}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </MobileFormDrawer>
        </>
    );
};


const mapStateToProps = (state) => ({
    user: state.user,
});
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SharedListDrawer));
