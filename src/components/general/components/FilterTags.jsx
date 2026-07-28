import React from 'react';
import { Tag, Button } from 'antd';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';
import moment from 'moment';

/**
 * FilterTags Component
 * 
 * Renders active filter tags with close functionality that syncs with FilterDrawerV2
 * 
 * @param {Object} props
 * @param {Object} props.filterGroup - Current active filters object
 * @param {Function} props.setFilterGroup - Function to update filter group state
 * @param {Array} props.filterOptions - Array of filter configuration objects
 * @param {Array} props.excludeFields - Array of field names to exclude from tags (e.g., ['platform'])
 * @param {Function} props.onFilterRemove - Optional callback when a filter is removed
 * @param {Function} props.onClearAll - Optional callback when clear all is clicked
 * @param {Object} props.tagStyle - Optional custom tag styling
 * 
 * @example
 * <FilterTags
 *   filterGroup={filterGroup}
 *   setFilterGroup={setFilterGroup}
 *   filterOptions={filterOptions}
 *   excludeFields={['platform']}
 *   onFilterRemove={(fieldName) => setPage(1)}
 * />
 */
const FilterTags = ({
    filterGroup = {},
    setFilterGroup,
    filterOptions = [],
    excludeFields = [],
    onFilterRemove,
    onClearAll,
    tagStyle = {}
}) => {
    const { t } = useTranslation();

    // Default tag styling
    const defaultTagStyle = {
        // backgroundColor: '#e3f2fd',
        // border: '1px solid #90caf9',
        // color: '#1565c0',
        // fontSize: '14px',
        // ...tagStyle
    };

    /**
     * Render a single filter tag
     */
    const renderFilterTag = (fieldName, displayLabel, closable = true) => {
        // Special handling for date range fields (createdAt, createdDate)
        // Check if From/To variants exist instead of the field itself
        if (fieldName === 'createdAt' || fieldName === 'createdDate') {
            const fromField = `${fieldName}From`;
            const toField = `${fieldName}To`;

            // Check if the date range exists
            if (!filterGroup[fromField] || !filterGroup[toField]) {
                return null;
            }

            // Format date range: "DD MMM YYYY - DD MMM YYYY"
            const startDate = moment(filterGroup[fromField]).format('DD MMM YYYY');
            const endDate = moment(filterGroup[toField]).format('DD MMM YYYY');
            const displayValue = `${startDate} - ${endDate}`;

            const handleClose = (e) => {
                if (!closable) return;

                // Prevent event bubbling
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                // Remove the date range fields
                const newFilterGroup = { ...filterGroup };
                delete newFilterGroup[fromField];
                delete newFilterGroup[toField];

                // Update filter group - this will sync with FilterDrawerV2
                setFilterGroup(newFilterGroup);

                // Call optional callback
                if (onFilterRemove) {
                    onFilterRemove(fieldName);
                }
            };

            return (
                <Tag
                    key={fieldName}
                    closable={closable}
                    onClose={handleClose}
                    // className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={defaultTagStyle}
                >
                    <span className="font-semibold">{displayLabel}:</span>
                    <span className="truncate max-w-[200px]">{displayValue}</span>
                </Tag>
            );
        }

        // Check if the filter exists and has a value (allow 0 and false)
        const fieldValue = filterGroup[fieldName];
        if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
            return null;
        }

        // Get the display value
        let displayValue = fieldValue;

        // If it's a dropdown/select field, try to find the label from options
        const filterOption = filterOptions.find(opt => opt.dataIndex === fieldName);
        if (filterOption && filterOption.selections) {
            const selectedOption = filterOption.selections.find(
                sel => sel.value === filterGroup[fieldName]
            );
            if (selectedOption) {
                displayValue = selectedOption.title;
            }
        }

        // Handle array values (e.g., multiple selections)
        if (Array.isArray(displayValue) && !displayValue.length) {
            return null;
        }

        const handleClose = (e) => {
            if (!closable) return;

            // Prevent event bubbling
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // Remove the specific filter field
            const newFilterGroup = { ...filterGroup };
            delete newFilterGroup[fieldName];

            // Update filter group - this will sync with FilterDrawerV2
            setFilterGroup(newFilterGroup);

            // Call optional callback
            if (onFilterRemove) {
                onFilterRemove(fieldName);
            }
        };

        return (
            <Tag
                key={fieldName}
                closable={closable}
                onClose={handleClose}
                // className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={defaultTagStyle}
            >
                <span className="font-semibold">{displayLabel}:</span>
                <span className="truncate max-w-[200px]">{displayValue}</span>
            </Tag>
        );
    };

    /**
     * Get all active filter keys excluding specified fields
     */
    const getActiveFilterKeys = () => {
        const keys = Object.keys(filterGroup).filter(key => {
            // Exclude specified fields
            if (excludeFields.includes(key)) return false;

            // Exclude internal filter fields (From/To variants) - they will be handled specially
            if (key.endsWith('From') || key.endsWith('To')) return false;

            // Exclude empty values (but allow 0, false)
            const value = filterGroup[key];
            if (value === null || value === undefined || value === '') return false;

            // Exclude empty arrays
            if (Array.isArray(value) && value.length === 0) return false;

            return true;
        });

        // Add date range fields if they have From/To variants
        if (filterGroup.createdAtFrom && filterGroup.createdAtTo && !keys.includes('createdAt')) {
            keys.push('createdAt');
        }
        if (filterGroup.createdDateFrom && filterGroup.createdDateTo && !keys.includes('createdDate')) {
            keys.push('createdDate');
        }

        return keys;
    };

    const activeFilterKeys = getActiveFilterKeys();

    // Don't render if no active filters
    if (activeFilterKeys.length === 0) {
        return null;
    }

    /**
     * Handle clear all filters
     */
    const handleClearAll = () => {
        // Keep only excluded fields
        const newFilterGroup = {};
        excludeFields.forEach(field => {
            if (filterGroup[field] !== undefined) {
                newFilterGroup[field] = filterGroup[field];
            }
        });

        // Update filter group - this will reset FilterDrawerV2 form
        setFilterGroup(newFilterGroup);

        // Call optional callback
        if (onClearAll) {
            onClearAll();
        }
    };

    return (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
            {activeFilterKeys.map(key => {
                // Find the filter option to get the display label
                const filterOption = filterOptions.find(opt => opt.dataIndex === key);
                const displayLabel = filterOption?.title || key;

                return renderFilterTag(key, displayLabel, true);
            })}

        </div>
    );
};

export default FilterTags;
