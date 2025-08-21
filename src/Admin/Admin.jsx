import { useState } from "react";
import EcommerceMetrics from "./EcommerceMetrics";
import MonthlyTarget from "./MonthlyTarget";
import MonthlySalesChart from "./MonthlySalesChart";
import StatisticsChart from "./StatisticsChart";
import AgentPerformance from "./AgentPerformance";
import CallCalendar from "./CallCalendar"

const Admin = ({ isSidebarOpen, isSidebarCollapsed }) => {
  // Calculate dynamic margin based on sidebar state
  const getContentMargin = () => {
    if (isSidebarOpen) {
      return isSidebarCollapsed ? "ml-20" : "ml-52"; // 20=5rem (80px) for collapsed, 52=13rem (208px) for expanded
    }
    return "ml-0"; // When sidebar is completely closed (mobile view)
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar would be here */}

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className={`max-w-7xl mx-auto mt-12 transition-all duration-300 ${getContentMargin()}`}>
          
          {/* === Top Two-Column Section === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Side: Metrics + Sales Chart */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <EcommerceMetrics />
              <MonthlySalesChart />
            </div>

            {/* Right Side: Monthly Target */}
            <div className="lg:col-span-1">
              <MonthlyTarget />
            </div>
          </div>

          {/* === Full Width Section === */}
          <div className="mb-6">
            <StatisticsChart />
          </div>
          
          <div>
            <AgentPerformance />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;