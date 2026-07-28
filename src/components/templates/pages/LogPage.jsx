import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Badge, Tabs } from 'antd';
import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
import { useRouter } from 'next/router';
import GenerationLogPage from './GenerationLogPage';
import ScanLogListing from '../components/ScanLogListing';

export const LogPage = (props) => {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState("content");
    const { t } = useTranslation();
    const { user } = props;
    const userIdentity = user?.role;

    useEffect(() => {
        // Check for tab query parameter on component mount
        if (router.query.tab && (router.query.tab === "content" || router.query.tab === "visual" || router.query.tab === "scan")) {
            setCurrentTab(router.query.tab);
        }
    }, [router.query.tab]);

    const handleTabChange = (key) => {
        setCurrentTab(key);
        // Optional: update URL query param
        router.replace({
            pathname: router.pathname,
            query: { ...router.query, tab: key }
        }, undefined, { shallow: true });
    };

    let tabContent = null;
    if (currentTab === "content") {
        tabContent = <GenerationLogPage activeTab="content" showTabs={false} />;
    } else if (currentTab === "visual") {
        tabContent = <GenerationLogPage activeTab="visual" showTabs={false} />;
    } else if (currentTab === "scan") {
        tabContent = <ScanLogListing />;
    }

    const tabItems = [
        {
            key: "content",
            label: (
                <span>
                    {t("content", sourceKey.user)}
                </span>
            ),
        },
        ...(userIdentity === "masterHQ" ? [
            {
                key: "visual",
                label: (
                    <span>
                        {t("nTvisual", sourceKey.user)}
                    </span>
                ),
            }
        ] : []),
        {
            key: "scan",
            label: (
                <span>
                    {t("nTscan", sourceKey.user)}
                </span>
            ),
        },
    ];

    return (
        <>
            <div className="p-3">
                {/* <div className="mb-5 flex flex-row justify-between">

                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {t("generationLog", sourceKey.user)}
                        </h1>
                    </div>
                    <div />
                </div> */}
                <div className='justify-end'>
                    <Tabs
                        type="card"
                        onChange={handleTabChange}
                        activeKey={String(currentTab)}
                        tabBarStyle={{ marginBottom: 0 }}
                        items={tabItems}
                    />
                    <div>{tabContent}</div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(LogPage);
