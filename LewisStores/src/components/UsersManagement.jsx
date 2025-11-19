import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetAllUsers, BanUser } from "@/api/manage"; // ← YOU ALREADY HAVE THIS
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldX, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const UsersManagement = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  // GET USERS
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page],
    queryFn: () => GetAllUsers(page, limit),
    keepPreviousData: true,
  });

  // BAN USER
  const banMutation = useMutation({
    mutationFn: (id) => BanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const users = data || [];
  const total = data?.length || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <Users className="h-7 w-7" /> User Management
      </h1>

      {/* LOADING SKELETON */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      ) : isError ? (
        <div className="font-medium text-red-500">Failed to load users.</div>
      ) : (
        <div className="border rounded-xl bg-card">
          {/* TABLE */}
          <Table>
            <TableCaption>Users in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.isBanned ? (
                        <span className="font-semibold text-red-600">
                          Banned
                        </span>
                      ) : (
                        <span className="font-semibold text-green-600">
                          Active
                        </span>
                      )}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="text-right">
                      {!u.isBanned && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={banMutation.isPending}
                            >
                              {banMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <ShieldX className="w-4 h-4 mr-1" /> Ban
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Ban this user?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will immediately ban the user and prevent
                                them from accessing the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => banMutation.mutate(u.id)}
                              >
                                Confirm Ban
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <p className="text-sm">
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
