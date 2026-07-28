import React, { useEffect, useState } from "react";
import { Form, Checkbox, Typography, Divider, message, Button, Spin, Switch } from "antd";
import { useTranslation } from "../../../locales/useTranslation";
import { sourceKey } from "../../../locales/config";
import { useMediaQuery } from "react-responsive";
import { isEmpty } from "lodash";
import StringInput from "@/general/input/StringInput";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
// import getModule from "@/pages/api/roleManagement/getModule";
// import getRoleModule from "@/pages/api/roleManagement/getRoleModule";
// import createRole from "@/pages/api/roleManagement/createRole";
// import editRoleModule from "@/pages/api/roleManagement/editRoleModule";
// import editRole from "@/pages/api/roleManagement/editRole";
// import StringInput from "@/components/general/components/input/StringInput";
// import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
// import getRole from "@/pages/api/roleManagement/getRole";

const { Text } = Typography;

const ACCESS_STATES = {
    NONE: 0,
    READ_ONLY: 1,
    FULL_ACCESS: 2,
};

const RoleDrawer = (props) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [modules, setModules] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [actionAccess, setActionAccess] = useState(0);
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 650 });

    function mapRoleModulesToAccess(roleModules, allModules) {
        return allModules.map((module) => {
            // Find the matching role module for the main module
            const matchingRoleModule = roleModules.find(
                (roleModule) => roleModule.moduleId === module._id
            );

            const moduleAccess = matchingRoleModule
                ? matchingRoleModule.moduleAccess
                : 0;

            // Handle submodules
            const subModules = module.submenu.map((subModule) => {
                const matchingRoleSubModule = roleModules.find(
                    (roleModule) => roleModule.moduleId === subModule._id
                );

                // Assign submodule access level
                const subModuleAccess = matchingRoleSubModule
                    ? matchingRoleSubModule.moduleAccess
                    : 0;

                return {
                    ...subModule,
                    subModuleAccess,
                    roleModuleId: matchingRoleSubModule
                        ? matchingRoleSubModule._id
                        : subModule._id,
                };
            });

            return {
                ...module,
                moduleAccess,
                roleModuleId: matchingRoleModule ? matchingRoleModule._id : module._id,
                submenu: subModules,
            };
        });
    }

    const fetchRole = async () => {
        try {
            const res = await getRole("all", 0, { roleId: props.selectedRecord?.roleId || props.selectedRecord?._id });
            setActionAccess(res?.role?.data[0]?.actionAccess || 0)
            form.setFieldsValue({
                actionAccess: res?.role?.data[0]?.actionAccess || 0
            });

        } catch (err) {
            console.error("Failed to fetch profiles:", err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setVisible(props.visible === true);

        if (props.visible) {
            form.resetFields();
            setLoading(true);
            getModule("all", 0, {})
                .then((response) => {
                    if (!isEmpty(response)) {
                        const { data } = response.modules;
                        const parsedModules = parseModules(data);
                        setModules(parsedModules);

                        if (props.upload === "edit") {
                            getRoleModule("all", 0, { roleId: props?.selectedRecord?.roleId || props?.selectedRecord?._id })
                                .then((roleResponse) => {
                                    form.setFieldsValue({
                                        name: props?.selectedRecord?.name,
                                        roleId: props?.selectedRecord?.roleId || props?.selectedRecord?._id
                                    });
                                    if (
                                        roleResponse &&
                                        roleResponse.roleModule &&
                                        roleResponse.roleModule.data
                                    ) {
                                        const rolesData = roleResponse.roleModule.data;

                                        const selectedRoles = rolesData.filter(
                                            (role) => role.name === props?.selectedRecord?.name
                                        );

                                        if (selectedRoles.length > 0) {
                                            const updatedModules = mapRoleModulesToAccess(
                                                selectedRoles,
                                                parsedModules
                                            );

                                            setModules(updatedModules);
                                        }
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error fetching role details:", error);
                                });
                            fetchRole()
                        }
                    } else {
                        console.error(response);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching modules:", error);
                })
                .finally(() => setLoading(false));
        }
    }, [props.visible, props.upload, props.selectedRecord]);


    const customOrder = ["Dashboard", "User", "Wallet", "Product", "Program", "Company", "Marketing Management",];

    const parseModules = (data) => {

        const mainModules = [];
        const subModulesMap = new Map();

        data.forEach((module) => {
            if (module.parentInfo?.masterParentId) {

                const parentId = module.parentInfo.masterParentId;
                if (!subModulesMap.has(parentId)) {
                    subModulesMap.set(parentId, []);
                }
                subModulesMap.get(parentId).push({
                    ...module,
                    subModuleAccess: ACCESS_STATES.NONE,
                });
            } else {

                mainModules.push({
                    ...module,
                    moduleAccess: ACCESS_STATES.NONE,
                });
            }
        });


        const parsedModules = mainModules.map((mainModule) => {
            const submodules = subModulesMap.get(mainModule._id) || [];
            return {
                ...mainModule,
                submenu: submodules,
            };
        });

        return parsedModules.sort((a, b) => {
            const indexA = customOrder.indexOf(a.name);
            const indexB = customOrder.indexOf(b.name);

            if (indexA === -1) return 1; // Unmatched goes last
            if (indexB === -1) return -1; // Unmatched goes last

            return indexA - indexB;
        });
    };

    const close = () => {
        form.resetFields();
        if (props.onClose) {
            props.onClose();
        }
    };

    const getCheckboxClass = (accessLevel) => {
        switch (accessLevel) {
            case ACCESS_STATES.READ_ONLY:
                return "checkbox-yellow";
            case ACCESS_STATES.FULL_ACCESS:
                return "checkbox-blue";
            default:
                return "";
        }
    };

    const getAccessLabel = (accessLevel) => {
        switch (accessLevel) {
            case ACCESS_STATES.READ_ONLY:
                return <Text className="access-label" style={{ color: "#FCBE01" }}>{t("Read-only")}</Text>;
            case ACCESS_STATES.FULL_ACCESS:
                return <Text className="access-label" style={{ color: "#1766A4" }}>{t("Full Access")}</Text>;
            default:
                return <Text className="access-label" style={{ color: "#A9A9A9" }}>{t("No Access")}</Text>;
        }
    };

    const handleCheckboxChange = (moduleId, subModuleId, checked) => {
        const updatedModules = modules.map((module) => {
            if (module._id === moduleId) {
                if (subModuleId === null) {
                    // Update main module checkbox
                    module.moduleAccess = checked ? (actionAccess === 0 ? 1 : 2) : 0;
                } else {
                    // Update submodule checkbox
                    module.submenu = module.submenu.map((subModule) => {
                        if (subModule._id === subModuleId) {
                            subModule.subModuleAccess = checked ? (actionAccess === 0 ? 1 : 2) : 0;
                        }
                        return subModule;
                    });
                }
            }
            return module;
        });
        setModules(updatedModules);
    };

    const handleSave = async () => {
        setLoading(true)
        try {
            const values = await form.validateFields();
            const payload = {
                ...(props.upload !== "edit" && { name: values.name, actionAccess: values.actionAccess ? 1 : 0 }),
                ...(props.upload === "edit"
                    ? {
                        roleId: values.roleId,
                        roleModules: modules.flatMap((module) => {
                            const baseModule = {
                                moduleId: module._id,
                                // moduleName: module.name,
                                moduleAccess: module.moduleAccess,

                            };

                            const flattenedModules = module.submenu.map((sub) => ({
                                moduleId: sub._id,
                                // moduleName: sub.name,
                                moduleAccess: sub.subModuleAccess,

                            }));

                            return [baseModule, ...flattenedModules];
                        })
                    }
                    : {
                        modules: modules.flatMap((module) => {
                            const baseModule = {
                                moduleId: module._id,
                                moduleName: module.name,
                                moduleAccess: module.moduleAccess,
                                modulePath: module.modulePath || "",
                            };

                            const flattenedModules = module.submenu.map((sub) => ({
                                moduleId: sub._id,
                                moduleName: sub.name,
                                moduleAccess: sub.subModuleAccess,
                                modulePath: sub.subModulePath || "",
                            }));

                            return [baseModule, ...flattenedModules];
                        })
                    }
                ),
            };

            let response;

            if (props.upload === "edit") {
                const res = await editRole({
                    roleName: values.name,
                    roleId: values.roleId,
                    actionAccess: values.actionAccess ? 1 : 0
                });

                response = await editRoleModule(payload);

                if (response && res) {
                    message.success(t("roleUpdatedSuccessfully", sourceKey.staff));
                } else {
                    throw new Error("Failed to update role.");
                }
            } else {
                response = await createRole(payload);
                if (response) {
                    message.success(t("Role created successfully."));
                } else {
                    throw new Error("Failed to create role.");
                }
            }

        } catch (error) {
            console.error("Error saving role:", error);
            message.error(error.message);
        } finally {
            setLoading(false)
            close();
            props.onRefresh();
        }
    };


    const _renderBottomNavBar = (
        <div className="sticky bottom-0 left-0 w-full px-3 py-3 bg-white flex justify-center">
            <div
                className="blue-bg rounded w-full max-w-md py-2 flex justify-center text-white cursor-pointer"
                onClick={() => {
                    handleSave();
                }}
            >
                {loading ? <Spin size="small" /> : t("save")}
            </div>
        </div>

    );

    return (
        <MobileFormDrawer
            closable={true}
            onClose={close}
            open={visible}
            title={
                props.upload === 'edit'
                    ? t("editRole", sourceKey.staff)
                    : t("addRole", sourceKey.staff)
            }
            customBottomNavBar={_renderBottomNavBar}
            width={isMobile ? "100%" : "360px"}
        >
            <div>
                <Spin spinning={loading}>
                    <Form layout="vertical" form={form}>
                        <StringInput
                            label={t("Title of New Role")}
                            required
                            fieldName="name"
                            placeholder={t("Enter Role Name")}
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                        />
                        <StringInput
                            label={t("roleId", sourceKey.home)}
                            fieldName="roleId"
                            placeholder={t("roleId", sourceKey.home)}
                            hidden={true}
                        />
                        <div className="flex flex-col items-start">
                            <label
                                htmlFor="actionAccess"
                                style={{ color: "#00000080", fontSize: "11px", marginBottom: '5px' }}
                            >
                                {t("hasFullAccess", sourceKey.admin)}:
                            </label>

                            <Form.Item
                                name="actionAccess"
                                valuePropName="checked"
                                style={{ margin: 0 }}
                            >
                                <Switch
                                    checked={actionAccess === 1}
                                    onChange={(checked) => {
                                        const newAccess = checked ? 1 : 0;
                                        setActionAccess(newAccess);

                                        // Update all ticked checkboxes based on new switch value
                                        const updatedModules = modules.map((module) => {
                                            const newModuleAccess = module.moduleAccess !== 0 ? (newAccess === 0 ? 1 : 2) : 0;
                                            const updatedSubmenu = module.submenu.map((sub) => ({
                                                ...sub,
                                                subModuleAccess: sub.subModuleAccess !== 0 ? (newAccess === 0 ? 1 : 2) : 0,
                                            }));

                                            return {
                                                ...module,
                                                moduleAccess: module.submenu.length === 0 ? newModuleAccess : module.moduleAccess,
                                                submenu: updatedSubmenu,
                                            };
                                        });

                                        setModules(updatedModules); // Ensure state updates to trigger rerender
                                    }}
                                />
                            </Form.Item>

                        </div>
                    </Form>

                    <Divider />
                    <div className="pb-5">
                        <h6 style={{ margin: 0, color: '#1766A4' }}>{t("setUpAccess", sourceKey.staff)}</h6>
                    </div>

                    <div>
                        {modules.map((module, index) => (
                            <div key={module._id}>
                                <div
                                    style={{
                                        backgroundColor: "#f9f9f9",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 16px",
                                    }}
                                >
                                    <Text style={{ fontSize: "16px" }}>
                                        {`${index + 1}. ${module.name}`}
                                    </Text>
                                    {module.submenu.length === 0 && (
                                        <div
                                            className={`${getCheckboxClass(module.moduleAccess)} py-2`}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Checkbox
                                                checked={module.moduleAccess !== 0}
                                                onChange={(e) => handleCheckboxChange(module._id, null, e.target.checked)}
                                                className={getCheckboxClass(module.moduleAccess)}
                                            />
                                            {getAccessLabel(module.moduleAccess)}
                                        </div>
                                    )}
                                </div>
                                {module.submenu.length > 0 && (
                                    <div>
                                        {module.submenu.map((sub) => (
                                            <div
                                                key={sub._id}
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "8px 16px",
                                                    marginLeft: "24px",
                                                }}
                                            >
                                                <Text style={{ fontSize: "16px" }}>{sub.name}</Text>
                                                <div
                                                    className={getCheckboxClass(sub.subModuleAccess)}
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={sub.subModuleAccess !== 0}
                                                        onChange={(e) => handleCheckboxChange(module._id, sub._id, e.target.checked)}
                                                        className={getCheckboxClass(sub.subModuleAccess)}
                                                    />
                                                    {getAccessLabel(sub.subModuleAccess)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="py-3"></div>
                </Spin>
            </div>

            {/* {renderFooter()} */}
        </MobileFormDrawer>
    );
};

export default RoleDrawer;