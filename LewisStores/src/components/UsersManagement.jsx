import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetAllUsers, BanUser, UnBanUser } from "@/api/manage";
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
import { Badge } from "@/components/ui/badge";

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

  const unBanMutation = useMutation({
    mutationFn: (id) => UnBanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const users = data || [];
  const total = data?.length || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <div className="container px-6 py-12 mx-auto max-w-7xl space-y-12">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-900" id='user-management-heading'>
          <Users className="w-8 h-8 text-red-600" id="user-management-icon" /> User Management
        </h1>

        {/* LOADING SKELETON */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-600 font-medium" id="usersTableError">Failed to load users.</div>
        ) : (
          <div className="overflow-hidden shadow-sm rounded-xl bg-white" id="usersTableContainer">
            {/* TABLE */}
            <Table>
              <TableCaption className="text-slate-500 py-4" id="usersTableCaption">Users in the system.</TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50" id="usersTableHeader">
                  <TableHead className="text-slate-600" id="usersTableName">Name</TableHead>
                  <TableHead className="text-slate-600" id="usersTableEmail">Email</TableHead>
                  <TableHead className="text-slate-600" id="usersTableStatus">Status</TableHead>
                  <TableHead className="text-right text-slate-600" id="usersTableActions">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow
                      key={u.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                      <TableCell className="text-slate-700">{u.email}</TableCell>
                      <TableCell>
                        {u.isBanned ? (
                          <Badge className="bg-red-600 text-white font-medium" id="userStatusBanned">
                            Banned
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white font-medium" id="userStatusActive">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Determine if the user is currently banned based on lockoutEnd */}
                        {u.lockoutEnd ? (
                          // --- UNBAN BUTTON ---
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            disabled={
                              unBanMutation.isPending || banMutation.isPending
                            }
                            onClick={() => unBanMutation.mutate(u.id)}
                            id="unbanUserButton"
                          >
                            {unBanMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Unban"
                            )}
                          </Button>
                        ) : (
                          // --- BAN BUTTON (Inside AlertDialog) ---
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white"
                                disabled={banMutation.isPending}
                                id="banUserButton"
                              >
                                {banMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <ShieldX className="w-4 h-4 mr-2" /> Ban
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl bg-white border-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-900">
                                  Ban user: {u.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-500">
                                  This will permanently ban the user and prevent
                                  them from accessing the system until unbanned.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-red-600 border-red-200 hover:bg-red-50" id="cancelBanUserButton">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => banMutation.mutate(u.id)}
                                  id="confirmBanUserButton"
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
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100" id="paginationControls">
              <Button
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                id="previousManageUsers"
              >
                Previous
              </Button>

              <p className="text-sm text-slate-600 font-medium">
                Page <span className="font-bold">{page}</span> of{" "}
                <span className="font-bold">{totalPages}</span>
              </p>

              <Button
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                id="nextManageUsers"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;