import { useState } from "react";
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
import { ClipboardList, Loader2, Search } from "lucide-react";
import { FetchAuditLogs } from "@/api/manage";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["auditlogs", page, filter],
    queryFn: () => FetchAuditLogs(page, limit, filter),
  });

  // Assume total from response or calculate; placeholder for now
  const totalPages = 10; // Adjust based on backend response if it returns total

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-6 py-12 mx-auto max-w-7xl space-y-12">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-900">
          <ClipboardList className="w-8 h-8 text-red-600" /> Audit Logs
        </h1>

        <div className="relative max-w-xl">
          <Input
            placeholder="Filter logs by action, entity, or details..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-hidden shadow-sm rounded-xl bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-600">Timestamp</TableHead>
                    <TableHead className="text-slate-600">User ID</TableHead>
                    <TableHead className="text-slate-600">Action</TableHead>
                    <TableHead className="text-slate-600">
                      Entity Type
                    </TableHead>
                    <TableHead className="text-slate-600">Entity ID</TableHead>
                    <TableHead className="text-slate-600">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-slate-500"
                      >
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((log) => (
                      <TableRow
                        key={log.logId}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <TableCell className="font-medium text-slate-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {log.userId}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {log.action}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {log.entityType}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {log.entityId}
                        </TableCell>
                        <TableCell className="text-slate-700 truncate max-w-md">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-slate-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
