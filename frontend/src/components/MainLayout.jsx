import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "sidebar-collapsed",
        isSidebarCollapsed ? "1" : "0",
      );
    }
  }, [isSidebarCollapsed]);

  return (
    <div className="app-shell">
      <LeftSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={`app-main pt-20 lg:pt-8 pb-24 lg:pb-8 px-3 sm:px-5 lg:px-7 animate-rise transition-[padding-left] duration-300 ${
          isSidebarCollapsed ? "lg:pl-28" : "lg:pl-80"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
