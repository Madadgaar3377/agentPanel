import React from "react";

const AssignmentFilters = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "loan", label: "Loan" },
    { value: "installment", label: "Installment" },
    { value: "property", label: "Property" },
  ];

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => onFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Category
          </label>
          <input
            type="text"
            value={filters.category || ""}
            onChange={(e) => onFilterChange("category", e.target.value)}
            placeholder="Filter by category"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            City
          </label>
          <input
            type="text"
            value={filters.city || ""}
            onChange={(e) => onFilterChange("city", e.target.value)}
            placeholder="Filter by city"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="mt-3 sm:mt-4 flex justify-end">
        <button
          onClick={onReset}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm sm:text-base"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AssignmentFilters;
