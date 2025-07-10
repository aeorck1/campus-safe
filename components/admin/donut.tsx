"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { useAuthStore } from "@/lib/auth";

const { Option } = Select;

export default function IncidentStatusComposedChart() {
  const listIncidents = useAuthStore((state) => state.listAdminIncidents);
  const [filteredStatus, setFilteredStatus] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Define allowed statuses
  const allowedStatuses = ["RESOLVED", "ACTIVE", "INVESTIGATING"];

  // Function to process fetched data
  type StatusCounts = {
    [status in "RESOLVED" | "ACTIVE" | "INVESTIGATING"]?: number;
  } & {
    date: string;
    _dateObj: Date;
    resolutionTime?: number;
  };

  const processData = (incidents: any[]) => {
    const dateMap: { [date: string]: StatusCounts } = {};
    const statuses = new Set();

    incidents.forEach((item) => {
      // Only count allowed statuses
      if (!allowedStatuses.includes(item.status)) return;

          const dateObj = new Date(item.date_created);
      const date = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      statuses.add(item.status);

      if (!dateMap[date]) {
        dateMap[date] = { date, _dateObj: dateObj }; // Store the Date object for sorting
      }

      // Count incidents per status
      dateMap[date][item.status] = (dateMap[date][item.status] || 0) + 1;

      // Calculate resolution time
      if (item.date_resolved) {
        const created = new Date(item.date_created);
        const resolved = new Date(item.date_resolved);
        const hours = Math.round((resolved - created) / (1000 * 60 * 60));
        dateMap[date].resolutionTime =
          (dateMap[date].resolutionTime || 0) + hours;
      }
    });

    // Only use allowed statuses
    const filteredStatuses = Array.from(statuses).filter((s) =>
      allowedStatuses.includes(s)
    );
    setAllStatuses(filteredStatuses);
    setFilteredStatus(filteredStatuses);

    // Sort by the stored _dateObj
    const sortedData = Object.values(dateMap)
      .sort((a, b) => a._dateObj - b._dateObj)
      .map(({ _dateObj, ...rest }) => rest); // Remove _dateObj before setting

    setChartData(sortedData);
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await listIncidents();
        if (res?.data) {
          processData(res.data);
        }
      } catch (error) {
        console.error("Error fetching incident data:", error);
      }
    };

    fetchData();
  }, [listIncidents]);

  const filteredKeys =
    filteredStatus.length > 0
      ? filteredStatus.filter((s) => allowedStatuses.includes(s))
      : allowedStatuses;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Incident Status Overview
      </h2>

      <div className="mb-4">
        <span className="text-gray-600 dark:text-gray-300 mr-2">
          Filter status:
        </span>
        <Select
          mode="multiple"
          value={filteredStatus}
          onChange={setFilteredStatus}
          style={{ minWidth: 250 }}
          allowClear
        >
          {allStatuses.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {filteredKeys.map((key, index) => {
            // Assign colors based on status key
            let color = "#ef4444"; // Default: ACTIVE (red)
            if (key === "RESOLVED") color = "#22c55e"; // orange (was green)
            else if (key === "INVESTIGATING") color = "#f97316"; // green (was orange)
            // ACTIVE remains blue

            return (
              <Bar
                key={key}
                dataKey={key}
                fill={color}
                stackId="a"
              />
            );
          })}
          {/* Removed the Line for resolutionTime */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
