import React, { useEffect, useState } from "react";
import { Form, Checkbox, Typography, Divider, message, Button, Spin } from "antd";
import { useTranslation } from "../../../locales/useTranslation";
import { sourceKey } from "../../../locales/config";
import { useMediaQuery } from "react-responsive";
import { isEmpty } from "lodash";
import StringInput from "@/general/input/StringInput";
import DropdownInput from "@/general/input/DropdownInput";
import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";
// import StringInput from "@/components/general/components/input/StringInput";
// import DropdownInput from "@/components/general/components/input/DropdownInput";
// import editModule from "@/pages/api/roleManagement/editModule";
// import createModule from "@/pages/api/roleManagement/createModule";
// import getModule from "@/pages/api/roleManagement/getModule";
// import MobileFormDrawer from "@/components/general/components/MobileFormDrawer";

const ModuleDrawer = (props) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 650 });
    const [subNavbars, setSubNavbars] = useState([]);
    const [addSubVisible, setAddSubVisible] = useState(true);

    useEffect(() => {
        setVisible(props.visible === true);
        setAddSubVisible(true);
        if (props.selectedModuleId && (props.upload === "editModule" || props.upload === "addSubModule")) {
            setLoading(true);
            getModule("all", 0, { moduleId: props.selectedModuleId })
                .then((response) => {

                    if (!isEmpty(response)) {
                        const selectedModule = response.modules.data.find(
                            (mod) => mod._id === props.selectedModuleId
                        );

                        if (selectedModule) {
                            const subModules = selectedModule.submenu || [];

                            const subNavbarFields = {};
                            subModules.forEach((sub, index) => {
                                subNavbarFields[`subNavbars[${index}].subtitle`] = sub.name || "";
                                subNavbarFields[`subNavbars[${index}].link`] = sub.path || "";
                            });

                            const formValues = {
                                name: selectedModule.name,
                                path: selectedModule.path || "",
                                tab: selectedModule.tab,
                                ...subNavbarFields,
                            };

                            setSubNavbars(
                                subModules.map((sub, index) => ({
                                    subtitle: sub.name || "",
                                    link: sub.path || "",
                                    id: sub._id,
                                    key: `sub-${index}`,
                                }))
                            );

                            if (selectedModule.parentInfo?.masterParentId === null && props.upload !== "editModule") {
                                // parentId is null
                                setAddSubVisible(true);
                            } else if (props.upload === "editModule") {
                                setAddSubVisible(false);
                            }
                            else {
                                // parentId is not null
                                setAddSubVisible(false);
                            }
                            form.setFieldsValue(formValues);
                        } else {
                            message.warning(t("Module not found"));
                        }
                    }
                })
                .catch((error) => {
                    message.error(t(error?.message));
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [props.selectedModuleId, props.upload, props.visible]);


    useEffect(() => {
        form.setFieldsValue({ subNavbars });
    }, [subNavbars, form]);

    const handleAddSubNavbar = () => {
        setSubNavbars([
            ...subNavbars,
            { subtitle: "", link: "", key: `sub-${subNavbars.length}` },
        ]);
    };

    const handleDeleteSubNavbar = (key) => {
        setSubNavbars((prev) => {
            const updatedSubNavbars = prev.filter((sub) => sub.key !== key);
            const fieldsToRemove = prev
                .filter((sub) => sub.key === key)
                .map((_, index) => [
                    `subNavbars[${index}].subtitle`,
                    `subNavbars[${index}].link`,
                ])
                .flat();

            form.resetFields(fieldsToRemove);

            return updatedSubNavbars;
        });
    };


    const close = () => {
        form.resetFields();
        setSubNavbars([]);
        setAddSubVisible(false)
        if (props.onClose) {
            props.onClose();
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();

            const parentModule = {
                ...(props.upload !== "addSubModule" && {
                    name: values.name,
                    path: values.path,
                    tab: values.tab,
                    isParent: 1,
                }),
                ...(props.upload === "editModule" && { moduleId: props.selectedModuleId }),
            };

            const submodules = subNavbars
                .map((_, index) => ({
                    name: values[`subNavbars[${index}].subtitle`],
                    path: values[`subNavbars[${index}].link`],
                    isParent: 0,
                    tab: values.tab,
                    ...(props.upload === "addSubModule" && {
                        parentInfo: {
                            masterParentId: props.selectedModuleId,
                        },
                    }),
                }))
                .filter((sub) => sub.name || sub.path);

            const payload = {
                modules: [parentModule, ...submodules],
            };
            const subModule = {
                modules: [...submodules],
            };

            let response;

            switch (props.upload) {
                case "editModule":
                    response = await editModule(payload);
                    message.success(response ? t("Module updated successfully.") : "Failed to update module.");
                    break;

                case "addSubModule":
                    response = await createModule(subModule);
                    message.success(response ? t("Module created successfully.") : "Failed to create submodule.");
                    break;

                default:
                    response = await createModule(payload);
                    message.success(response ? t("Module created successfully.") : "Failed to create module.");
            }

            if (!response) {
                throw new Error("Module operation failed.");
            }

        } catch (error) {
            console.error("Error saving module:", error);
            message.error(t("Failed to save module."));
        } finally {
            setLoading(false);
            close();
            props.onRefresh();
        }
    };


    const _renderBottomNavBar = (
        <div className="absolute bottom-0 left-0 w-full px-3 py-3 bg-white flex justify-center items-center space-x-1">
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
                props.upload === "editModule"
                    ? t("editModule", sourceKey.staff)
                    : props.upload === "addSubModule"
                        ? t("addSubModule", sourceKey.staff)
                        : t("addNewModule", sourceKey.staff)
            }
            customBottomNavBar={_renderBottomNavBar}
            width={isMobile ? "100%" : "360px"}
        >
            <div>
                <Spin spinning={loading}>
                    <Form layout="vertical" form={form}>
                        <StringInput
                            label={t("sideNavBarMainTitle", sourceKey.staff)}
                            required
                            fieldName="name"
                            placeholder={t("sideNavBarMainTitle", sourceKey.staff)}
                            disabled={props.upload === "addSubModule"}
                        />
                        <StringInput
                            label={t("link", sourceKey.staff)}
                            required
                            fieldName="path"
                            placeholder={t("link", sourceKey.staff)}
                            disabled={props.upload === "addSubModule"}
                        />
                        <DropdownInput
                            label={
                                t("Tab", sourceKey.futureBot)
                            }
                            fieldName="tab"
                            placeholder={t("selectTab", sourceKey.futureBot)}
                            lightgrey={false}
                            required={true}
                            disabled={props.upload === "addSubModule"}
                            options={[
                                { value: 1, title: t('admin', sourceKey.futureBot) },
                                { value: 2, title: t('bots', sourceKey.futureBot) },
                            ]}

                        />
                        <Divider />

                        {subNavbars.map((sub, index) => (
                            <div key={`sub-${index}`}>
                                <div className="flex justify-between items-center  mb-1">
                                    <button
                                        type="button"
                                        style={{ color: "#FF4D4F" }}
                                        className="text-sm font-semibold hover:underline ml-auto"
                                        onClick={() => handleDeleteSubNavbar(sub.key)}
                                    >
                                        {t("deleteSub", sourceKey.staff)}
                                    </button>
                                </div>

                                <StringInput
                                    label={t("sideNavbarSubTitle", sourceKey.staff)}
                                    required
                                    fieldName={`subNavbars[${index}].subtitle`}
                                    placeholder={t("sideNavbarSubTitle", sourceKey.staff)}
                                />
                                <StringInput
                                    label={t("link", sourceKey.staff)}
                                    required
                                    fieldName={`subNavbars[${index}].link`}
                                    placeholder={t("link", sourceKey.staff)}
                                />
                                <Divider />
                            </div>
                        ))}
                        {addSubVisible === true && (<>
                            <Button
                                type="dashed"
                                block
                                icon={<span>+</span>}
                                onClick={handleAddSubNavbar}
                            >
                                {t(`addSubNavBar`, sourceKey.staff)}
                            </Button>
                        </>)
                        }


                    </Form>
                    <div className="py-3"></div>
                </Spin>
            </div>
        </MobileFormDrawer>
    );
};

export default ModuleDrawer;