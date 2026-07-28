import React from 'react';
import { Card, Typography, Divider, Flex, Avatar } from 'antd';
import { useRouter } from 'next/router';
import { ArrowUpOutlined } from '@ant-design/icons';
import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
import { formatDecimalNumber } from '@/utility/common-functions';
import { getPlatformIcon } from '@/utility/ImagesFunction';

const { Text, Title } = Typography;

export const CardSummary = ({ data, outletUserId }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const handleClick = () => {
        const query = { tab: 'scan', sharePlatform: data?.platform };
        if (outletUserId) {
            query.outletUserId = outletUserId;
        }
        router.push({ pathname: '/templates/log', query }, undefined, { shallow: true });
    };

    return (
        <Card
            hoverable
            className='card-social-mediaw-full'
            padding={12}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <Flex vertical gap="middle">
                {/* Top Section: Avatar & Link Icon */}
                <Flex justify="space-between" align="start">
                    <img
                        src={getPlatformIcon(data.platform)}
                        alt={data.platform || data.title || data.name}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            objectFit: 'cover',
                        }}
                    />
                    <ArrowUpOutlined style={{ color: '#8c8c8c', fontSize: '18px', rotate: '45deg' }} />
                </Flex>

                <Title level={3} className='flex flex-col' >
                    <Text type="secondary" >
                        {data?.platform}
                    </Text>
                    {formatDecimalNumber(data?.total, 0)}
                </Title>


                <Divider style={{ margin: '0' }} />

                {/* Language Breakdown */}
                <Flex vertical gap="small">
                    <Flex justify="space-between">
                        <Text type="secondary" strong>  {t('nTenglish', sourceKey.user)}</Text>
                        <Text strong>{formatDecimalNumber(data?.english, 0)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                        <Text type="secondary" strong>  {t('nTchinese', sourceKey.user)}</Text>
                        <Text strong>{formatDecimalNumber(data?.chinese, 0)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                        <Text type="secondary" strong>  {t('nTmalay', sourceKey.user)}</Text>
                        <Text strong>{formatDecimalNumber(data?.malay, 0)}</Text>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );
};
