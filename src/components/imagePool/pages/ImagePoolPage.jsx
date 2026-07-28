import React, { useState, useEffect } from 'react';
import { useRouter, withRouter } from 'next/router';
import { Col, Dropdown, Input, message, Pagination, Row, Switch, Tabs, Tag } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MoreOutlined, SettingOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import ListingTable from '@/components/general/components/ListingTable';
import getAvailablePoolListing from '@/pages/api/imagePool/getAvailablePoolListing';
import SinglePopUpModal from '@/components/general/popUp/SinglePopUpModal';
import getImagePool from '@/pages/api/imagePool/getImagePool';
import editImagePool from '@/pages/api/imagePool/editImagePool';
import { IMAGE_POOL_STATUS } from '@/constant/template';

const ImagePoolPage = (props) => {
    const { user } = props;
    const { t } = useTranslation();
    const [filterGroup, setFilterGroup] = useState({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const userIdentity = user?.user?.role;
    const PAGE_SIZE = 10;
    const router = useRouter();
    const [hasImage, setHasImage] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedContent, setSelectedContent] = useState('')


    const columns = [
        {
            title: t("productName", sourceKey.user),
            dataIndex: 'productName',
            filterable: true,
            key: 'productName',
            fixed: "left",
            render: (text, record, index) => (
                text
            ),
        },
        {
            title: t("imageCount", sourceKey.user),
            dataIndex: 'imageCount',
            // filterable: true,
            key: 'imageCount',
            render: (text, record, index) => (
                text
            ),
        },


        {
            title: "",
            dataIndex: 'action',
            key: 'action',

            // width: isMobile ? 20 : 20,

            render: (text, record) => {
                const menuItems = [
                    {
                        key: "view",
                        label: (
                            <div className=" flex flex-center cursor-pointer"
                                onClick={() => {
                                    router.push({
                                        pathname: `/image-pool/image-pool-details`,
                                        query: {
                                            poolId: record.productId,
                                            productName: record.productName,
                                            outletUserId: record.outletUserId
                                        }
                                    });
                                }}
                            >
                                {t("viewImagePoolDetails", sourceKey.user)}
                            </div>
                        ),
                    },
                    // {
                    //     key: "delete",
                    // label: (
                    //         <div onClick={() => { setDeleteModalOpen(true); setSelectedContent(record) }}>
                    //             Delete Image Pool
                    //         </div>
                    //     )
                    // }
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                    </Dropdown>
                );
            },
        }

    ];

    useEffect(() => {
        getData((page - 1) * PAGE_SIZE);
    }, [page, filterGroup]);

    function getData(skip) {
        setLoading(true);

        if (isNaN(parseInt(skip))) {
            skip = 0;
        } else {
            skip = parseInt(skip);
        }

        const filterParams = {
            ...(userIdentity === "outlet" && {
                outletUserId: user?.user?._id,
            }),

            ...filterGroup,
        };

        getAvailablePoolListing(PAGE_SIZE, skip, filterParams)
            .then((res) => {
                setDataSource(res?.data);
                setTotal(res?.total);
                const hasData = Array.isArray(res?.data) && res.data.length > 0;
                setHasImage(hasData);
                if (hasData === false) { // Guard to prevent user enter link to enter imagepool.
                    router.push("/");
                    message.error("No more Image Pool available")
                }
            })
            .catch((err) => {
                console.log(err);
                message.error(err?.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    async function handleDeleteContent(content) {
        if (!content) return;
        setLoading(true);
        try {
            const response = await editImagePool({
                productId: content?.productId,
                action: "remove"
            });
            message.success(response?.data?.message || 'Images deleted successfully');
            setDeleteModalOpen(false);
            setSelectedContent(null);
            onRefresh();
        } catch (err) {
            console.error("Error deleting image pool:", err);
            message.error(err?.message || 'Error deleting images');
        } finally {
            setLoading(false);
        }
    }



    async function onRefresh() {
        setPage(1)
        if (page !== 1) {
            getData((page - 1) * PAGE_SIZE);
        } else {
            getData(0);
        }
    }

    return (
        <>
            <div className='mb-5 flex flex-row justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl font-bold text-gray-900'>{t("imagePool", sourceKey.user)}</h1>
                    <span className='text-gray-600 mt-1' >{t("imagePoolDesc", sourceKey.user)}</span>
                    <div className='mt-2'>
                        <Tag color='red'>This feature will be removing soon. Please SAVE your image to your local storage.</Tag>
                    </div>
                </div>
            </div>
            <div className="">
                <ListingTable
                    columns={columns}
                    dataSource={dataSource}
                    setPage={setPage}
                    total={total}
                    page={page}
                    loading={loading}
                    // listingActions={listingActions}
                    PAGE_SIZE={PAGE_SIZE}
                    onRefresh={onRefresh}
                    filterTag={true}
                    filterGroup={filterGroup}
                    setFilterGroup={setFilterGroup}
                // onExport={onExport}
                // onRowClick={(record) => {
                //     router.push({
                //         pathname: `/image-pool/image-pool-details`,
                //         query: {
                //             poolId: record.productId
                //             productName:reco
                //         }
                //     });
                // }}
                />
            </div>
            <SinglePopUpModal
                open={deleteModalOpen}
                type={"deleteImagePool"}
                closeable={true}
                extraData={selectedContent}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedContent(null);
                }}
                confirmBtn1={() => handleDeleteContent(selectedContent)}
            />
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
})
const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ImagePoolPage))