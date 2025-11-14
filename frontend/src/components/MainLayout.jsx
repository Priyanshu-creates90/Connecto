import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <LeftSidebar />
      <div className="pt-16 md:pt-0 md:ml-[16%] pb-16 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
