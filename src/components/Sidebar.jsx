import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShareAiBigIcon } from '../../public/assets';
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CreditBalance from "@/components/credit/components/CreditBalance";

const Sidebar = ({ menuItems = [], user, expandedMenu, onExpandedMenuChange }) => {
  const router = useRouter();
  const toggleMenu = (menuId) => {
    if (!onExpandedMenuChange) {
      return;
    }
    onExpandedMenuChange(expandedMenu === menuId ? null : menuId);
  };

  return (
    <div
      className="bg-white shadow-lg transition-all duration-300 h-screen flex flex-col w-64"
    >
      {/* HEADER */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-full">
          <img src={ShareAiBigIcon} alt="ShareAI Logo" className="h-10 w-auto" />
        </div>
      </div>

      {/* MAIN MENU AREA */}
      <nav className="mt-6 flex-1">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-y-auto">
            {menuItems.map((item) => {
              const itemPath = item.path.split("?")[0];
              const isExpanded = expandedMenu === item.id;
              const isActive = router.pathname === itemPath;

              return (
                <div
                  key={item.id}
                  className="relative"
                >
                  {/* MAIN MENU ITEM */}
                  <div
                    className={`flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${isActive
                      ? "text-green-600 bg-green-50 border-r-2 border-green-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    onClick={() => {
                      if (item.submenu) {
                        toggleMenu(item.id);
                      } else if (!item.submenu) {
                        router.push(item.path);
                      }
                    }}
                  >
                    <div className="flex items-center flex-1">
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="h-5 w-5 mr-3"
                      />
                      {item.label}
                    </div>

                    {/* ARROW */}
                    {item.submenu && (
                      <div className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* SUBMENU — EXPANDED */}
                  {item.submenu && isExpanded && (
                    <motion.div
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
                              className={`flex items-center px-12 py-3 text-sm font-medium transition-colors ${isSubActive
                                ? "text-green-600 bg-green-50 border-r-2 border-green-600"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
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

          {/* FOOTER — CREDIT */}
          <div className="px-6 py-6">
            <CreditBalance user={user} />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
