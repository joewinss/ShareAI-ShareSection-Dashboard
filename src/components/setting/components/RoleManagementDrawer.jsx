import React, { useEffect, useState } from "react";
import { Button, Checkbox, Dropdown, Menu, message, Spin, Table } from "antd";
import { ArrowUpOutlined, DeleteOutlined, DownOutlined, EditOutlined, MoreOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { sourceKey } from "../../../locales/config";
import { useTranslation } from "../../../locales/useTranslation";
import { map } from "lodash";
import { useMediaQuery } from "react-responsive";
import { RefreshIcon } from "../../../../public/assets";
// import SinglePopUpModal from "@/components/general/popUp/SinglePopUpModal";
import RoleDrawer from "./RoleDrawer";
// import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import ModuleDrawer from "./ModuleDrawer";
import SinglePopUpModal from "@/general/components/SinglePopUpModal";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
import ListingTable from "@/general/components/ListingTable";
// import deleteRole from "@/pages/api/roleManagement/deleteRole";
// import deleteModule from "@/pages/api/roleManagement/deleteModule";
// import getModule from "@/pages/api/roleManagement/getModule";
// import getRoleModule from "@/pages/api/roleManagement/getRoleModule";
// import getRole from "@/pages/api/roleManagement/getRole";

const RoleManagementDrawer = (props) => {
    const [visible, setVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState([]);
    const [roles, setRoles] = useState([]);
    const [createUserVisible, setCreateUserVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [upload, setUpload] = useState({})
    const [columns, setColumns] = useState([]);
    const [dataList, setDataList] = useState([]);
    const PAGE_SIZE = 10;
    const isMobile = useMediaQuery({ maxWidth: 650 });
    const { t } = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDeleteMainModuleModal, setShowDeleteMainModuleModal] = useState(false)
    const [createModuleVisible, setCreateModuleVisible] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false)

    useEffect(() => {
        if (props.visible) {
            fetchData();
        }
    }, [props.visible]);

    function refreshData() {
        setIsAnimating(true);
        fetchData();
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const [moduleResponse, roleResponse, roleListResponse] = await Promise.all([
                getModule("all", 0, {}),
                getRoleModule("all", 0, {}),
                getRole("all", 0, {})
            ]);

            const modulesData = moduleResponse?.modules?.data || [];
            const rolesData = roleResponse?.roleModule?.data || [];
            const allRoles = roleListResponse?.role?.data || [];
            setModules(modulesData);

            // Group roles by name
            const groupedRoles = groupRolesByName(rolesData, allRoles);
            setRoles(groupedRoles);
            // console.log(groupedRoles)
            generateColumns(groupedRoles);
            generateRows(modulesData, groupedRoles, allRoles, rolesData);
        } catch (error) {
            console.error("Fetch Data Error:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const groupRolesByName = (roles, allRoles) => {
        const grouped = roles.reduce((acc, role) => {
            const existingRole = acc.find((r) => r.name === role.name);
            if (existingRole) {
                existingRole.data.push(role);
            } else {
                acc.push({
                    name: role.name,
                    data: [role],
                });
            }
            return acc;
        }, []);

        allRoles.forEach((role) => {
            if (!grouped.some(r => r.name === role.name)) {
                grouped.push({
                    name: role.name,
                    data: [{
                        _id: role._id,
                        name: role.name,
                        moduleAccess: null, // Set permission to null for missing roles
                    }]
                });
            }
        });

        return grouped;
    };


    const generateRows = (modules, roles, allRoles, rolesData) => {

        const customOrder = ["Dashboard", "User", "Wallet", "Product", "Program", "Company", "Marketing Management",];

        const sortedModules = [...modules].sort((a, b) => {
            const indexA = customOrder.indexOf(a.name);
            const indexB = customOrder.indexOf(b.name);
            return indexA - indexB;
        });

        const createActionDropdown = (moduleId, isMainModule) => {
            const menu = (
                <Menu>
                    {isMainModule === 1 && (
                        <>
                            <Menu.Item
                                key="addSubModule"
                                onClick={() => {
                                    setCreateModuleVisible(true);
                                    setUpload("addSubModule");
                                    setSelectedModuleId(moduleId);
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <PlusOutlined style={{ marginRight: 5 }} />
                                    {t("addSubModule", sourceKey.staff)}
                                </div>
                            </Menu.Item>
                        </>
                    )}
                    <>
                        <Menu.Item
                            key="editModule"
                            onClick={() => {
                                setCreateModuleVisible(true);
                                setUpload("editModule");
                                setSelectedModuleId(moduleId);
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <SettingOutlined style={{ marginRight: 5 }} />
                                {t("editModule", sourceKey.staff)}
                            </div>
                        </Menu.Item>
                    </>
                    {isMainModule === 1 && (
                        <>
                            <Menu.Item
                                key="deleteMainModule"
                                onClick={() => {
                                    setShowDeleteMainModuleModal(true);
                                    setSelectedModuleId(moduleId);
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "red",
                                    }}
                                >
                                    <DeleteOutlined style={{ marginRight: 5 }} />
                                    {t("deleteMainModule", sourceKey.staff)}
                                </div>
                            </Menu.Item>
                        </>
                    )}
                    {isMainModule !== 1 && (
                        <>
                            <Menu.Item
                                key="deleteModule"
                                onClick={() => {
                                    setShowDeleteModuleModal(true);
                                    setSelectedModuleId(moduleId);
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "red",
                                    }}
                                >
                                    <DeleteOutlined style={{ marginRight: 5 }} />
                                    {t("deleteModule", sourceKey.staff)}
                                </div>
                            </Menu.Item>
                        </>
                    )}
                </Menu>
            );
            return (
                <Dropdown overlay={menu} trigger={["click"]}>
                    <span
                        style={{
                            fontSize: "20px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            textAlign: "center",
                        }}
                    >
                        <MoreOutlined />
                    </span>
                </Dropdown>
            );
        };

        const rows = sortedModules
            .filter((module) => !module.parentInfo?.masterParentId)
            .map((module) => {
                const row = {
                    key: module._id,
                    moduleName: module.name,
                    permissions: {},
                    action: props.user?.user?.userRoles === "Super Admin" ? createActionDropdown(module._id, 1) : null,
                };

                // Assign roles to parent modules
                roles.forEach((roleGroup) => {
                    roleGroup.data.forEach((role) => {
                        if (role.moduleId === module._id) {
                            row.permissions[role._id] = role.moduleAccess || null;
                        }
                    });
                });

                // Add missing roles from roleListResponse
                allRoles.forEach((role) => {
                    if (role.moduleId === module._id && !row.permissions[role._id]) {
                        row.permissions[role._id] = null; // Role exists but permission is null
                    }
                });

                const childModules = modules.filter(
                    (sub) => sub.parentInfo?.masterParentId === module._id
                );

                if (childModules.length > 0) {
                    row.children = childModules.map((submodule) => {
                        const subRow = {
                            key: submodule._id,
                            moduleName: submodule.name,
                            permissions: {},
                            action: props.user?.user?.userRoles === "Super Admin 2" ? createActionDropdown(submodule._id, 0) : null,
                        };

                        roles.forEach((roleGroup) => {
                            roleGroup.data.forEach((role) => {
                                if (role.moduleId === submodule._id) {
                                    subRow.permissions[role._id] = role.moduleAccess || null;
                                }
                            });
                        });

                        return subRow;
                    });
                }

                return row;
            });

        const actionRow = {
            key: "action-row",
            moduleName: "Action",
            permissions: roles.reduce((acc, roleGroup) => {
                roleGroup.data.forEach((role) => {
                    const menu = (
                        <Menu>
                            <Menu.Item
                                key="editRole"
                                onClick={() => {
                                    setCreateUserVisible(true);
                                    setSelectedRecord(role);
                                    setUpload("edit");
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <SettingOutlined style={{ marginRight: 5 }} />
                                    {t("editRole", sourceKey.staff)}
                                </div>
                            </Menu.Item>
                            <Menu.Item
                                key="deleteRole"
                                onClick={() => {
                                    setShowDeleteModal(true);
                                    setSelectedRecord(role?.roleId);
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "red",
                                    }}
                                >
                                    <DeleteOutlined style={{ marginRight: 5 }} />
                                    {t("deleteRole", sourceKey.staff)}
                                </div>
                            </Menu.Item>
                        </Menu>
                    );

                    acc[role._id] = (
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <span
                                style={{
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    textAlign: "center",
                                }}
                            >
                                <MoreOutlined />
                            </span>
                        </Dropdown>
                    );
                });
                return acc;
            }, {}),
        };

        setDataList([actionRow, ...rows]);
    };

    const generateColumns = (roles) => {
        const roleColumns = roles.map((roleGroup) => ({
            title: (
                <div
                    style={{
                        transform: "rotate(270deg)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "left",
                        paddingTop: 30,
                        height: 100,
                    }}
                >
                    {roleGroup.name}
                </div>
            ),
            dataIndex: roleGroup.name,
            key: roleGroup.name,
            width: "5%",
            render: (_, record) => {
                if (record.key === "action-row") {
                    const columnDropdown = record.permissions[roleGroup.data[0]._id];
                    return (
                        <div style={{ textAlign: "left" }}>
                            {columnDropdown}
                        </div>
                    );
                }

                const value = roleGroup.data.reduce((maxAccess, role) => {
                    return Math.max(maxAccess, record.permissions[role._id] || 0);
                }, null);

                let cssClass = "checkbox-default";
                let label = "No Access";

                if (value === 2) {
                    cssClass = "checkbox-blue";
                    label = "Full Access";
                } else if (value === 1) {
                    cssClass = "checkbox-yellow";
                    label = "Read Only";
                }

                const isParentModule = record.children && record.children.length > 0;
                if (isParentModule) {
                    return <div style={{ textAlign: "center" }}></div>;
                }

                return (
                    <div style={{ textAlign: "center" }}>
                        <div className={cssClass}>
                            <Checkbox checked={value > 0} disabled />
                        </div>
                        <div>{label && <label className="access-label">{label}</label>}</div>
                    </div>
                );
            },
        }));

        const newColumns = [
            {
                title: (
                    <div style={{ textAlign: "center" }}>
                        {t("pages", sourceKey.user)}
                    </div>
                ),
                dataIndex: "moduleName",
                key: "moduleName",
                fixed: "left",
                width: "20%",
            },
            ...roleColumns,
            {
                dataIndex: "action",
                key: "action",
                width: "1%",
                render: (_, record) => record.action,
            },
        ];

        setColumns(newColumns);
    };


    const listingActions = [
        // ...(props.user?.userRoles === "Developer" ? [{
        {
            value: "addNewModule",
            render: () => (
                <Button type="primary" className="blue-bg rounded-lg px-2 py-1 flex flex-row cursor-pointer">
                    <span className="flex items-center mr-1">
                        <PlusOutlined style={{ fontSize: "12px" }} />
                    </span>
                    <span className="">
                        {t("addNewModule", sourceKey.staff)}
                    </span>
                </Button >
            ),
            exec: () => {
                setCreateModuleVisible(true);
                setUpload("addNewModule");

            }
        },
        // }] : []),
        {
            value: "addNewUser",
            render: () => (
                <Button type="primary" className="flex items-center gap-2 rounded-lg" >
                    <span className="flex items-center mr-1">
                        <PlusOutlined style={{ fontSize: "12px" }} />
                    </span>
                    <span className="">
                        {t("addNewRole", sourceKey.staff)}
                    </span>
                </Button>
            ),
            exec: () => {
                setCreateUserVisible(true);
                setUpload("");

            }
        },

        {
            value: "refresh",
            render: () => (
                <div
                    className={`cursor-pointer ${isAnimating ? 'rotate' : ''}`}
                    onClick={refreshData}
                >
                    <img src={RefreshIcon} height={14} />
                </div>
            ),
            exec: refreshData,
        },
    ];

    const handleClose = () => {
        if (props.onClose) {
            props.onClose();
        }
    };

    return (
        <MobileFormDrawer
            closable={true}
            onClose={handleClose}
            open={props.visible}
            className="lightgrey-bg-drawer"
            title={t("roleManagement", sourceKey.staff)}
        >

            {/* <div className="flex justify-end items-center">
                    {map(listingActions, (item, index) => (
                        <div
                            className="ml-4"
                            key={index}
                            onClick={() => {
                                item.exec();
                            }}
                        >
                            {item.render()}
                        </div>
                    ))}
                </div>
                <div className="my-4" />
                <div className="text-right mb-4" /> */}
            <Spin spinning={loading}>
                <ListingTable
                    className="role-management-table"
                    columns={columns}
                    dataSource={dataList}
                    listingActions={listingActions}
                    scroll={{
                        x: 500,
                    }}
                    rowKey="key"
                    pagination={false}
                    expandable={{
                        defaultExpandAllRows: true,
                    }}
                    rowClassName={(record, index) => {
                        return record.children ? 'default-row' : 'expanded-row';
                    }}
                />

            </Spin>

            <RoleDrawer
                visible={createUserVisible}
                onRefresh={refreshData}
                selectedRecord={selectedRecord}
                upload={upload}
                onClose={() => {
                    setCreateUserVisible(false);
                    setSelectedRecord({})
                    setUpload()
                    refreshData()

                }} />
            <ModuleDrawer
                visible={createModuleVisible}
                onRefresh={refreshData}
                selectedModuleId={selectedModuleId}
                upload={upload}
                onClose={() => {
                    setCreateModuleVisible(false);
                    setUpload()
                    setSelectedModuleId({})
                    refreshData()
                }} />
            <SinglePopUpModal
                closeable={true}
                open={showDeleteModal}
                type={"deleteRole"}
                onClose={() => setShowDeleteModal(false)}
                extraData={selectedRecord}
                modalLoading={loading}
                confirmBtn1={async () => {
                    setLoading(true);
                    try {
                        const response = await deleteRole({
                            roleId: selectedRecord,
                        });
                        if (response) {
                            message.success(t("successfulDeleteStaff", sourceKey.staff));
                        }
                    } catch (err) {
                        message.error(err.message);
                    } finally {
                        setLoading(false);
                        setShowDeleteModal(false)
                        refreshData();
                    }
                }}
            />
            <SinglePopUpModal
                closeable={true}
                open={showDeleteMainModuleModal}
                type={"deleteMainModule"}
                modalLoading={loading}
                onClose={() => setShowDeleteMainModuleModal(false)}
                confirmBtn1={async () => {
                    setLoading(true);
                    try {
                        const response = await deleteModule({
                            moduleId: selectedModuleId
                        });
                        if (response) {
                            message.success(t("successfulDeleteMainModule", sourceKey.staff));
                        }
                    } catch (err) {
                        message.error(err.message);
                    }
                    finally {
                        setLoading(false);
                        setShowDeleteMainModuleModal(false)
                        refreshData();
                    }
                }}
                extraData={selectedModuleId}
            />
            <SinglePopUpModal
                closeable={true}
                open={showDeleteModuleModal}
                type={"deleteModule"}
                modalLoading={loading}
                onClose={() => setShowDeleteModuleModal(false)}
                confirmBtn1={async () => {
                    setLoading(true)
                    try {
                        const response = await deleteModule({
                            moduleId: selectedModuleId
                        });
                        if (response) {
                            message.success(t("successfulDeleteSubModule", sourceKey.staff));
                        }
                    } catch (err) {
                        message.error(err.message);
                    } finally {
                        setLoading(false);
                        setShowDeleteModuleModal(false)
                        refreshData();
                    }
                }}
                extraData={selectedModuleId}
            />
        </MobileFormDrawer>
    );
};

export default RoleManagementDrawer;
