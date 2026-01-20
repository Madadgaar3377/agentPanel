import React from "react";

const StatCard = ({ title, value, icon, color = "primary", subtitle }) => {
  const colorClasses = {
    primary: "bg-primary text-white",
    green: "bg-green-500 text-white",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-500 text-white",
    purple: "bg-purple-500 text-white",
    red: "bg-red-500 text-white",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`${colorClasses[color]} p-3 rounded-full`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
