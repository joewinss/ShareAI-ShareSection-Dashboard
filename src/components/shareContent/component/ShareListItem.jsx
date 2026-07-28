import { Button } from 'antd';
import React from 'react';

const ShareListItem = ({ imgSrc, text, buttonText = 'Share', onButtonClick }) => {
    return (
        <div
            className="flex items-center justify-between rounded-lg p-3"
            style={{
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.05)',
            }}
        >
            <div className="flex items-center gap-3">
                <img
                    src={imgSrc}
                    alt={text}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        background: '#fff',
                    }}
                />
                <span className="secondary-color-text" style={{ fontSize: 12 }}>{text}</span>
            </div>
            <Button type="primary" size="middle" onClick={onButtonClick}>
                {buttonText}
            </Button>
        </div>
    );
};

export default ShareListItem;
