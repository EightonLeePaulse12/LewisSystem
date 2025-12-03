import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Loader2, Search, ArrowUpDown } from "lucide-react";
import { FetchAuditLogs } from "@/api/manage";

export default function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterInput, setFilterInput] = useState("");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterText(filterInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterInput]);

  const {
    data: auditData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auditlogs", "all"],
    queryFn: () => FetchAuditLogs(1, 100000, ""),
    refetchOnWindowFocus: false,
  });

  const allLogs = auditData?.logs ?? [];

  // Client-Side Filtering & Sorting (Memoized for performance)
  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];

    let processedData = [...allLogs];

    // A. Filter Logic
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      processedData = processedData.filter((log) => {
        // Search across all relevant fields for comprehensive filtering
        return (
          (log.action?.toLowerCase().includes(lowerFilter) ?? false) ||
          (log.entityType?.toLowerCase().includes(lowerFilter) ?? false) ||
          (log.entityId?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
          (log.userId?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
          (log.details?.toLowerCase().includes(lowerFilter) ?? false)
        );
      });
    }

    // B. Sort Logic (Default: Newest first) - Sorting on the frontend is necessary here
    processedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return processedData;
  }, [allLogs, filterText]);

  // Client-Side Pagination Logic
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Helper to handle search input changes
  const handleSearchChange = (e) => {
    setFilterInput(e.target.value);
  };

  if (error) return <p className="p-8 text-red-600">Error: {error.message}</p>;

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-6 py-12 mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1
            className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-900"
            id="audit-logs-heading"
          >
            <ClipboardList
              className="w-8 h-8 text-red-600"
              id="audit-logs-icon"
            />
            Audit Logs
          </h1>
          <div className="text-sm text-slate-500">
            {totalItems} records found
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl" id="audit-logs-search">
          <Input
            placeholder="Search by Action, Entity ID, User, or Details..."
            value={filterInput}
            onChange={handleSearchChange}
            className="pl-10 pr-4 transition-all rounded-full shadow-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-200"
          />
          <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border shadow-xl rounded-2xl border-slate-100">
          {isLoading && allLogs.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow
                      className="bg-red-50/50"
                      id="audit-logs-table-header"
                    >
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-timestamp"
                      >
                        <div className="flex items-center gap-2">
                          Timestamp <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-user-id"
                      >
                        User ID
                      </TableHead>
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-action"
                      >
                        Action
                      </TableHead>
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-entity-type"
                      >
                        Entity Type
                      </TableHead>
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-entity-id"
                      >
                        Entity ID
                      </TableHead>
                      <TableHead
                        className="px-6 py-4 font-semibold text-slate-600"
                        id="audit-logs-details"
                      >
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-16 text-center text-slate-500"
                          id="audit-logs-no-logs-found"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-slate-300" />
                            <p>No logs found matching "{filterText}"</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => (
                        <TableRow
                          key={log.logId || Math.random()} // Fallback key if logId missing
                          className="transition-colors border-b hover:bg-red-50/30 border-slate-100 last:border-none"
                        >
                          <TableCell className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-700">
                            {log.userId}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-700">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                              ${
                                log.action === "DELETE"
                                  ? "bg-red-100 text-red-800"
                                  : log.action === "CREATE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-700">
                            {log.entityType}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-mono text-sm text-slate-700">
                            {log.entityId}
                          </TableCell>
                          <TableCell
                            className="max-w-md px-6 py-4 text-base truncate text-slate-600"
                            title={log.details}
                          >
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col items-center justify-between px-6 py-6 border-t bg-slate-50 border-slate-100 md:flex-row">
                <div className="mb-4 text-sm font-medium text-slate-500 md:mb-0">
                  Showing{" "}
                  {paginatedLogs.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{" "}
                  to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-6 py-2 rounded-full text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    id="audit-logs-previous-page-button"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50">
                    <span className="text-sm font-bold text-red-700">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="px-6 py-2 rounded-full text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700"
                    disabled={currentPage >= totalPages || totalPages === 0}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    id="audit-logs-next-page-button"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}