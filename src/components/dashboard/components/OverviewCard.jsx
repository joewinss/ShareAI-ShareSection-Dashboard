import React from 'react';
import { Card, Typography, Flex } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OverviewCard = ({ data }) => {
    const hoverable = data?.hoverable ?? true;
    const show = hoverable === true ? true : false;
    const layout = data?.layout || 'column';
    const isRow = layout === 'row';
    const cardStyle = {
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        ...(data?.cardStyle || {}),
    };
    const bodyStyle = {
        padding: '20px 24px',
        ...(data?.bodyStyle || {}),
    };
    const cardClassName = data?.className || '';

    return (
        <Card
            hoverable={hoverable}
            className={cardClassName}
            style={cardStyle}
            bodyStyle={bodyStyle}
            onClick={data?.handleClick}
        >
            {isRow ? (
                <Flex justify="space-between" align="center">
                    <Flex align="center" gap="small">
                        {show && (<ArrowUpOutlined style={{ color: '#8c8c8c', fontSize: '16px', rotate: '45deg' }} />)}
                        <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {data?.title}
                        </Text>
                    </Flex>
                    <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#374151' }}>
                        {data?.value}
                    </Title>
                </Flex>
            ) : (
                <Flex vertical gap="small">
                    {/* Top Row: Title and Arrow Icon */}
                    <Flex justify="space-between" align="start">
                        <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {data?.title}
                        </Text>
                        {show && (<ArrowUpOutlined style={{ color: '#8c8c8c', fontSize: '16px', rotate: '45deg' }} />)}
                    </Flex>

                    {/* Main Value */}
                    <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#374151' }}>
                        {data?.value}
                    </Title>
                </Flex>
            )}
        </Card>
    );
};

export default OverviewCard;
