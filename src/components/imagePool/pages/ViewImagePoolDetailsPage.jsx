import React, { useState, useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import { Button, Image, message, Pagination, Spin } from "antd";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { connect } from "react-redux";
import getImagePool from "@/pages/api/imagePool/getImagePool";
// import { IMAGE_POOL_STATUS } from '@/constants/package';
import { EmptyPostIcon } from "../../../../public/assets";
import { IMAGE_POOL_STATUS } from "@/constant/template";
import { LeftOutlined } from "@ant-design/icons";

export const ViewImagePoolDetailsPage = (props) => {
  const { t } = useTranslation();
  const [filterGroup, setFilterGroup] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const PAGE_SIZE = 10;
  const router = useRouter();

  useEffect(() => {
    const { poolId, productName } = router.query;
    if (poolId) {
      getData(poolId, (page - 1) * PAGE_SIZE);
    }

    if (productName) {
      setProductInfo({
        productName: productName,
        productId: poolId,
      });
    }
  }, [page, filterGroup, router.query]);

  function getData(poolId, skip) {
    setLoading(true);

    if (isNaN(parseInt(skip))) {
      skip = 0;
    } else {
      skip = parseInt(skip);
    }

    const filterParams = {
      ...filterGroup,
      productId: poolId,
      status: IMAGE_POOL_STATUS.ACTIVE,
      imageUrlNe: false,
    };
    getImagePool(PAGE_SIZE, skip, filterParams)
      .then((res) => {
        setDataSource(res?.data);
        setTotal(res?.total);
      })
      .catch((err) => {
        console.log(err);
        message.error(err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function onRefresh() {
    const { poolId } = router.query;
    if (poolId) {
      setPage(1);
      getData(poolId, 0);
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  function handleEditClick() {
    const { poolId, productName, outletUserId } = router.query;
    router.push({
      pathname: `/image-pool/edit-pool-details`,
      query: {
        poolId: poolId,
        productName: productName,
        outletUserId: outletUserId,
      },
    });
  }

  function handleDeleteClick() {
    const { poolId, productName, outletUserId } = router.query;
    router.push({
      pathname: `/image-pool/delete-pool-details`,
      query: {
        poolId: poolId,
        productName: productName,
        outletUserId: outletUserId,
      },
    });
  }

  function handleCancel() {
    router.back();
  }

  return (
    <>
      <div className="min-h-screen bg-white from-slate-50 to-blue-50 rounded-lg">
        <div className="p-3">
          {/* Header with action buttons */}
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="flex flex-row items-center gap-4">
              <div className="cursor-pointer" onClick={() => handleCancel()}>
                <LeftOutlined />
              </div>
              <div className="flex flex-col ">
                <h2 className="xlarge-text-size font-bold">
                  {productInfo?.productName || t("imagePool", sourceKey.user)}
                </h2>
                <p className="second-grey-text small-text-size">
                  {t("totalImages", sourceKey.user)}: {total}
                </p>
              </div>
            </div>
            {(props?.user?.role === "masterHQ" || router.query.sourceType === "own" || props.user?.contentPermission === 1) && (
              <div className="flex gap-2">
                <Button
                  className="purple-btn"
                  size="medium"
                  onClick={handleEditClick}
                >
                  {t("addImagePool", sourceKey.user) || "Edit Image Pool"}
                </Button>
                <Button
                  className="purple-btn"
                  size="medium"
                  onClick={handleDeleteClick}
                  disabled={total === 0}
                >
                  {t("editImagePool", sourceKey.user) || "Delete Image Pool"}
                </Button>
              </div>
            )}

          </div>

          {/* Image Grid */}
          <Spin
            spinning={loading}
            tip={t("loadingImages", sourceKey.user) || "Loading images..."}
          >
            {dataSource.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
                  {dataSource.map((image, index) => (
                    <div key={image._id} className="aspect-square relative">
                      <Image
                        src={image.imageUrl}
                        alt={`${image.productName} ${index + 1}`}
                        width={"100%"}
                        height={"100%"}
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px",
                          aspectRatio: "1 / 1",
                        }}
                        loading="lazy"
                        placeholder={
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f0f0f0",
                              borderRadius: "8px",
                              aspectRatio: "1 / 1",
                            }}
                          >
                            <Spin size="small" />
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {total > PAGE_SIZE && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={PAGE_SIZE}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <div className="flex flex-col items-center justify-center space-y-10 w-full py-20">
                  <img
                    src={EmptyPostIcon}
                    alt="No Images"
                    className="max-w-full h-auto"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="xlarge-text-size font-bold">
                      {t("noImage", sourceKey.user)}
                    </div>
                    <p className="second-grey-text">
                      {t("noImageDesc", sourceKey.user)}
                    </p>
                  </div>
                </div>
              )
            )}
          </Spin>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ViewImagePoolDetailsPage));
