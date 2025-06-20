"use client";

import React, { FC } from "react";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

const AllTicketsPage: FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Coming Soon
            </h3>
            <p className="text-blue-700">
              This feature is currently under development. In the meantime, you
              can manage your tickets from the main dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTicketsPage;
