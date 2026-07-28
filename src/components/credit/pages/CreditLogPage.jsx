import React, { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import { connect } from 'react-redux';
import WalletTransactionLog from '@/components/general/components/WalletTransactionLog';
import getUserWalletTransactionListsByUserId from '@/pages/api/user/getUserWalletTransactionListsByUserId';
import { CREDIT_TYPE } from '@/constants/user';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { formatDecimalNumber } from '@/utility/common-functions';
import DetailCreditCard from '@/components/credit/components/DetailCreditCard';

const CreditLogPage = ({ user }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [total, setTotal] = useState(0);
    const PAGE_SIZE = 10;
    const { data: creditData } = useCreditBalance({ poll: false, enabled: Boolean(user?.user?._id) });
    const credits = creditData?.data || [];
    const imageCredit = credits.find((w) => w.creditType === 0);
    const contentCredit = credits.find((w) => w.creditType === 1);
    const userIdentity = user?.user?.role;
    const isMasterHq = userIdentity === "masterHQ";
    const isOutlet = userIdentity === "outlet";

    const toSafeNumber = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
    };


    const getCreditStats = (credit) => {
        if (isOutlet) {
            const available = toSafeNumber(credit?.limit ?? credit?.availableAmount ?? 0);
            const used = toSafeNumber(credit?.actualUsed ?? 0);
            const total = available + used;
            return { total, used, available };
        }
        const available = toSafeNumber(credit?.availableAmount ?? 0);
        const used = toSafeNumber(credit?.currentlyUsedByOutlets ?? 0);
        const total = available + used;
        return { total, used, available };
    };

    const poolItems = [
        {
            key: 'image',
            label: 'Visual Credit Balance',
            icon: <ImageIcon className="w-5 h-5 text-white/90" />,
            gradient: 'from-[#059669] via-[#0891b2] to-[#2563eb]',
            credit: imageCredit,
        },
        {
            key: 'content',
            label: 'Content Credit Balance',
            icon: <FileText className="w-5 h-5 text-white/90" />,
            gradient: 'from-[#059669] via-[#0891b2] to-[#2563eb]',
            credit: contentCredit,
        },
    ];

    const usedLabel = isMasterHq ? 'Shared Out' : 'Used';

    const tabData = useMemo(() => ([
        { key: 'all', label: 'All' },
        { key: 'IN', label: 'Incoming' },
        { key: 'OUT', label: 'Outgoing' },
    ]), []);

    useEffect(() => {
        getData((page - 1) * PAGE_SIZE);
        const contentInterval = setInterval(() => { getData((page - 1) * PAGE_SIZE); }, 30000); // refresh counts every 20 seconds
        return () => {
            clearInterval(contentInterval);
        };
    }, [page, selectedTab, user]);

    const mapTransaction = (tx = {}) => {
        const transactionType = (tx.transactionType || tx.type || '').toUpperCase();
        const isCredit = transactionType === 'CREDIT';
        const isDebit = transactionType === 'DEBIT';

        return {
            title: `${t(tx.title, sourceKey.user) || "Error 404"} - 
            ${tx.creditType === CREDIT_TYPE.IMAGE ? t("nTimageCredit", sourceKey.user) : tx.creditType === CREDIT_TYPE.CONTENT ? t("nTContentCredit", sourceKey.user) : "Transaction"}`,
            remark: tx.description || tx.remark || null,
            status: tx.status || null,
            type: isCredit ? 'IN' : isDebit ? 'OUT' : tx.type,
            amount: tx.amount,
            amountType: tx.amountType || 'Credit',
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
            creditType: tx.creditType,
        };
    };

    function getData(skip) {
        if (!user?.user?._id) {
            setDataSource([]);
            setTotal(0);
            return;
        }
        setLoading(true);
        skip = isNaN(parseInt(skip)) ? 0 : parseInt(skip);

        const filterParams = {
            userId: user?.user?._id,
            transactionType: selectedTab === 'all'
                ? undefined
                : selectedTab === 'IN'
                    ? 'CREDIT'
                    : 'DEBIT',
        };

        getUserWalletTransactionListsByUserId(PAGE_SIZE, skip, filterParams)
            .then((res) => {
                const rows = res?.data || [];
                setDataSource(rows.map(mapTransaction));
                setTotal(res?.total || rows.length);
            })
            .catch((err) => message.error(err?.message))
            .finally(() => setLoading(false));
    }

    const handleTabChange = (key) => {
        setSelectedTab(key);
        setPage(1);
    };

    return (
        <>
            <div className='mb-5 flex flex-row justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl font-bold text-gray-900'>Credit Log</h1>
                    <span className='text-gray-600 mt-1' >View and manage all credit transactions.</span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
                {poolItems.map((pool) => {
                    const { total, used, available } = getCreditStats(pool.credit);

                    return (
                        <DetailCreditCard
                            key={pool.key}
                            label={pool.label}
                            icon={pool.icon}
                            gradient={pool.gradient}
                            available={available}
                            total={total}
                            used={used}
                            usedLabel={usedLabel}
                            showChart={isMasterHq}
                        />
                    );
                })}
            </div>
            <div>
                <WalletTransactionLog
                    tabData={tabData}
                    selectedKey={selectedTab}
                    onTabChange={handleTabChange}
                    dataSource={dataSource}
                    total={total}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                    emptyText="No credit transactions yet"
                    theme={{
                        selected: "",
                        unselected: "text-gray-400",
                        style: {
                            selected: {
                                background: 'linear-gradient(to right, #22c55e, #3b82f6)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }
                        }
                    }}
                />
            </div>
        </>
    );
};


const mapStateToProps = (state) => ({
    user: state.user,
    outlet: state.user.outletBadgeCount,
});

export default connect(mapStateToProps)(CreditLogPage);
