"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      lastLoginAt
    }
  }
`;

const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      firstName
      lastName
      role
      isActive
      city
      country
      lastLoginAt
      updatedAt
    }
  }
`;

export default function AdminDashboard() {
  const router = useRouter();
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!meLoading && (meError || !meData?.me)) {
      router.replace("/admin/login");
    }
  }, [meLoading, meError, meData, router]);

  const me = meData?.me;
  const isAdminLike = useMemo(
    () => Boolean(me?.role && String(me.role).toLowerCase().includes("admin")),
    [me]
  );

  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, {
    skip: !isAdminLike,
  });

  const [search, setSearch] = useState("");
  const users = usersData?.users ?? [];

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: any) =>
      [u.name, u.email, u.firstName, u.lastName, u.city, u.country]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
    );
  }, [users, search]);

  if (meLoading || (!isAdminLike && !meError && me)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0b0b12] text-[#E6E8EB]">
        <p>Loading admin...</p>
      </div>
    );
  }

  if (!isAdminLike) return null;

  const totalUsers = users.length;
  const totalAdmins = users.filter((u: any) => String(u.role).toLowerCase().includes("admin")).length;
  const activeUsers = users.filter((u: any) => u.isActive).length;
  const superAdmins = users.filter((u: any) => String(u.role).toLowerCase() === "super_admin").length;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold">GlobalTrotter</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[#9AA0A6]">Welcome, {me?.name}</div>
            <button
              onClick={() => {
                document.cookie = "gn_token=; path=/; max-age=0";
                router.replace("/admin/login");
              }}
              className="px-3 py-1 rounded-md bg-[#15151f] border border-[#2a2a35]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-stretch gap-3 mb-6">
            <input
              placeholder="Search bar ....."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] placeholder-[#9AA0A6]"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35]">Group by</button>
              <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35]">Filter</button>
              <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35]">Sort by…</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button className="px-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35]">Manage Users</button>
            <button className="px-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] opacity-50 cursor-not-allowed">Popular cities</button>
            <button className="px-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] opacity-50 cursor-not-allowed">Popular Activities</button>
            <button className="px-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] opacity-50 cursor-not-allowed">User Trends and Analytics</button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users", value: totalUsers },
              { label: "Admins", value: totalAdmins },
              { label: "Active", value: activeUsers },
              { label: "Super Admins", value: superAdmins },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-[#0f0f17] border border-[#2a2a35] p-4">
                <div className="text-sm text-[#9AA0A6]">{k.label}</div>
                <div className="text-2xl font-semibold mt-1">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div className="rounded-2xl overflow-hidden border border-[#2a2a35]">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f17] text-[#9AA0A6]">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Active</th>
                  <th className="text-left px-4 py-3">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-[#9AA0A6]">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-[#9AA0A6]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr key={u.id} className="border-t border-[#2a2a35]">
                      <td className="px-4 py-3">{u.name || `${u.firstName} ${u.lastName}`}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 capitalize">{String(u.role).replace("_", " ")}</td>
                      <td className="px-4 py-3">{u.city ?? "-"}</td>
                      <td className="px-4 py-3">{u.country ?? "-"}</td>
                      <td className="px-4 py-3">{u.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right-side info panel */}
        <aside className="fixed right-6 top-24 w-[320px] hidden xl:block text-sm text-[#c9ced6]">
          <div className="space-y-4 p-4 rounded-xl border border-[#2a2a35] bg-[#0f0f17]">
            <p className="font-semibold">Manage Users</p>
            <p>View all users, roles, activity status, and recent logins. Search and filter to manage easily.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}


