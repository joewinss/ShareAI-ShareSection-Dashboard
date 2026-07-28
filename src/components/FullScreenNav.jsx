import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown, ChevronRight, LogOut, X, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShareAiBigIcon } from "../../public/assets";
import CreditBalance from "@/components/credit/components/CreditBalance";
import { USER_SOURCE } from "@/constants/user";
import { sourceKey } from "@/locales/config";
import { useTranslation } from "@/locales/useTranslation";
import { getIShareRedirectUrl } from "@/utility/common-functions";

const FullScreenNav = ({ isOpen, menuItems = [], onClose, onLogout, user }) => {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const isEnterpriseFromIShare = user?.user?.source === USER_SOURCE.ISHARE_ENTERPRISE;
  const { t } = useTranslation();
  useEffect(() => {
    if (!isOpen) {
      setExpandedMenu(null);
      return;
    }

    const currentPath = router.pathname;
    const activeMenu = menuItems.find((item) => {
      if (item.submenu) {
        return item.submenu.some((sub) => {
          const subPathname = sub.path.split("?")[0];
          return currentPath.startsWith(subPathname);
        });
      }
      return currentPath === item.path;
    });

    if (activeMenu?.submenu) {
      setExpandedMenu(activeMenu.id);
    }
  }, [router.pathname, menuItems, isOpen]);

  const toggleMenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <img src={ShareAiBigIcon} alt="ShareAI Logo" className="h-8 w-auto" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close navigation"
                className="h-10 w-10 text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
              {menuItems.map((item) => {
                const itemPath = item.path.split("?")[0];
                const isExpanded = expandedMenu === item.id;
                const isActive = router.pathname === itemPath;

                if (!item.submenu) {
                  return (
                    <Link key={item.id} href={item.path}>
                      <div
                        className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isActive
                          ? "text-green-600 bg-green-50"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        onClick={onClose}
                      >
                        <div className="flex items-center">
                          <img src={item.icon} alt={item.label} className="mr-3 h-5 w-5" />
                          {item.label}
                        </div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <div key={item.id} className="mb-1">
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isActive
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      onClick={() => toggleMenu(item.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center">
                        <img src={item.icon} alt={item.label} className="mr-3 h-5 w-5" />
                        {item.label}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <motion.div
                        className="space-y-1 pl-10"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.submenu.map((sub) => {
                          const subPath = sub.path.split("?")[0];
                          const isSubActive =
                            router.pathname.startsWith(subPath) ||
                            (subPath === "/templates/live" &&
                              router.pathname === "/templates/create");

                          return (
                            <Link key={sub.path} href={sub.path}>
                              <div
                                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${isSubActive
                                  ? "text-green-600 bg-green-50"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                  }`}
                                onClick={onClose}
                              >
                                {sub.label}
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-sm">
                  <CreditBalance user={user} layout="full" />
                </div>
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isEnterpriseFromIShare) {
                        onLogout();
                        window.location.href = getIShareRedirectUrl();
                      } else {
                        onLogout();
                      }
                    }}
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                  >
                    {isEnterpriseFromIShare ? (
                      <>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("nTback", sourceKey.user)}
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nTlogout", sourceKey.user)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenNav;
