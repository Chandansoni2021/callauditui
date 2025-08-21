import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Box, Users } from "lucide-react";
import Badge from "../common/Badge";

interface MetricsData {
  total_calls: number;
  total_agents: number;
}

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({ total_calls: 0, total_agents: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-total-calls-agents/");
        const json = await response.json();

        if (json.success && json.data) {
          setMetrics(json.data);
        } else {
          console.error("API error:", json.error || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Total Agents Card */}
      <div className="relative rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 group">
        <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-blue-200/20"></div>
        <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-indigo-200/20"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm mb-4">
            <Users className="text-blue-600 size-7" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-medium text-blue-600/80">Total Agents</span>
              <h4 className="mt-1 text-3xl font-bold text-gray-800">{metrics.total_agents}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Total Calls Card */}
      <div className="relative rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-lg overflow-hidden border border-orange-100 hover:shadow-xl transition-all duration-300 group">
        <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-orange-200/20"></div>
        <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-amber-200/20"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm mb-4">
            <Box className="text-orange-600 size-7" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-medium text-orange-600/80">Total Calls</span>
              <h4 className="mt-1 text-3xl font-bold text-gray-800">{metrics.total_calls}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}