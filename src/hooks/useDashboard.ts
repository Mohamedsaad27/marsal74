import { useQueries } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getCollectionsBalance,
  getDeliveryPerformance,
  getAvgDeliveryTime,
  getTopAgents,
} from "../lib/admin/dashboard.ts";

export function useDashboard() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["dashboard-summary"],
        queryFn: getDashboardSummary,
      },
      {
        queryKey: ["collections-balance"],
        queryFn: getCollectionsBalance,
      },
      {
        queryKey: ["delivery-performance"],
        queryFn: getDeliveryPerformance,
      },
      {
        queryKey: ["avg-delivery-time"],
        queryFn: getAvgDeliveryTime,
      },
      {
        queryKey: ["top-agents"],
        queryFn: getTopAgents,
      },
    ],
  });

  return {
    summary: results[0].data,
    collections: results[1].data,
    performance: results[2].data,
    avgDelivery: results[3].data,
    topAgentsData: results[4].data,
    isLoading: results.some((q) => q.isLoading),
    isFetching: results.some((q) => q.isFetching),
  };
}
