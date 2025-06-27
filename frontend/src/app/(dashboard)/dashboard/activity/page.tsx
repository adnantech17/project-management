"use client";

import React, { useState, useEffect } from "react";
import { TicketHistory } from "@/types/models";
import { getAllActivityLogs } from "@/service/tickets";
import { History, Eye } from "lucide-react";
import Button from "@/components/Button";
import ActivityItem from "@/components/activity/ActivityItem";
import ActivityDetailsModal from "./components/ActivityDetailsModal";

export default function ActivityLogPage() {
  const [activityLogs, setActivityLogs] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<TicketHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [onlyByMe, setOnlyByMe] = useState(false);

  const fetchActivityLogs = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      const response = await getAllActivityLogs(pageNum, 50, onlyByMe);
      const newLogs = response.data;

      if (append) {
        setActivityLogs((prev) => [...prev, ...newLogs]);
      } else {
        setActivityLogs(newLogs);
      }

      setHasMore(newLogs.length === 50);
      setError(null);
    } catch (err) {
      setError("Failed to fetch activity logs");
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [onlyByMe]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivityLogs(nextPage, true);
  };

  const handleFilterChange = (newOnlyByMe: boolean) => {
    setOnlyByMe(newOnlyByMe);
    setPage(1);
    setActivityLogs([]);
  };

  const handleActivityClick = (activity: TicketHistory) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  if (loading && activityLogs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <History className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading activity logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <History className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => fetchActivityLogs()}
            variant="primary"
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        </div>
        <button
          type="button"
          onClick={() => handleFilterChange(!onlyByMe)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            onlyByMe
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          Only By Me
        </button>
      </div>

      {activityLogs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Activity Yet
          </h3>
          <p className="text-gray-600">
            Start creating and managing tickets to see your activity history
            here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {activityLogs.map((activity, index) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    <ActivityItem
                      activity={activity}
                      variant="detailed"
                      onClick={handleActivityClick}
                      className="flex-1"
                    />
                    <div className="flex-shrink-0">
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200">
                <Button
                  onClick={loadMore}
                  variant="ghost"
                  disabled={loading}
                  className="text-sm"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ActivityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityLog={selectedActivity}
      />
    </div>
  );
}
