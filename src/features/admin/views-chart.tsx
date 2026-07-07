"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ViewsChartProps {
  data: { date: string; views: number }[];
}

export function ViewsChart({ data }: ViewsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted">
        Chưa có dữ liệu lượt xem trong 30 ngày qua.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(d: string) => d.slice(5)}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 13,
              boxShadow: "0 8px 24px -8px rgb(17 24 39 / 0.15)",
            }}
            labelFormatter={(d) => `Ngày ${d}`}
            formatter={(value) => [`${value} lượt xem`, ""]}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#viewsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
