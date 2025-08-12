"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  Users, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Search, 
  Filter, 
  SortAsc, 
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Star,
  Settings,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { 
  GET_ADMIN_DASHBOARD, 
  GET_ADMIN_USERS, 
  GET_ADMIN_TRIPS,
  GET_ACTIVITIES,
  GET_CITIES,
  GET_USER_PROFILE
} from "@/graphql/queries";
import { 
  TOGGLE_USER_STATUS, 
  DELETE_TRIP, 
  TOGGLE_TRIP_PUBLIC 
} from "@/graphql/mutations";

type TabType = 'dashboard' | 'users' | 'trips' | 'cities' | 'activities' | 'analytics';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Authentication check - using the proper GraphQL query
  const { data: meData, loading: meLoading, error: meError } = useQuery(GET_USER_PROFILE, {
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

  // Data queries
  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useQuery(GET_ADMIN_DASHBOARD, {
    skip: !isAdminLike,
  });

  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_ADMIN_USERS, {
    variables: { limit: itemsPerPage * 1.0, offset: (currentPage - 1) * itemsPerPage * 1.0 },
    skip: !isAdminLike || activeTab !== 'users',
  });

  const { data: tripsData, loading: tripsLoading, refetch: refetchTrips } = useQuery(GET_ADMIN_TRIPS, {
    variables: { limit: itemsPerPage * 1.0, offset: (currentPage - 1) * itemsPerPage * 1.0 },
    skip: !isAdminLike || activeTab !== 'trips',
  });

  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_ACTIVITIES, {
    skip: !isAdminLike || activeTab !== 'activities',
  });

  const { data: citiesData, loading: citiesLoading } = useQuery(GET_CITIES, {
    skip: !isAdminLike || activeTab !== 'cities',
  });

  // Mutations
  const [toggleUserStatus] = useMutation(TOGGLE_USER_STATUS);
  const [deleteTrip] = useMutation(DELETE_TRIP);
  const [toggleTripPublic] = useMutation(TOGGLE_TRIP_PUBLIC);

  // Handlers
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await toggleUserStatus({ variables: { userId, isActive: !isActive } });
      refetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip({ variables: { id: tripId } });
        refetchTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const handleToggleTripPublic = async (tripId: string, isPublic: boolean) => {
    try {
      await toggleTripPublic({ variables: { tripId, isPublic: !isPublic } });
      refetchTrips();
    } catch (error) {
      console.error('Error toggling trip public status:', error);
    }
  };

  const handleLogout = () => {
    document.cookie = "gn_token=; path=/; max-age=0";
    router.replace("/admin/login");
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'dashboard':
        refetchDashboard();
        break;
      case 'users':
        refetchUsers();
        break;
      case 'trips':
        refetchTrips();
        break;
    }
  };

  if (meLoading || (!isAdminLike && !meError && me)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0b0b12] text-[#E6E8EB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-1)] mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLike) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'trips', label: 'Manage Trips', icon: MapPin },
    { id: 'cities', label: 'Popular Cities', icon: Globe },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#E6E8EB]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-[var(--accent-1)]">GlobeNomad Admin</h1>
            <span className="px-2 py-1 text-xs rounded-full bg-[var(--accent-1)]/20 text-[var(--accent-1)]">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-md hover:bg-[#15151f] text-[#9AA0A6] hover:text-[#E6E8EB] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="text-sm text-[#9AA0A6]">Welcome, {me?.name}</div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-red-500/20 hover:border-red-500/30 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#2a2a35] min-h-[calc(100vh-73px)] bg-[#0f0f17]">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setCurrentPage(1);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--accent-1)]/20 text-[var(--accent-1)] border border-[var(--accent-1)]/30'
                        : 'hover:bg-[#15151f] text-[#9AA0A6] hover:text-[#E6E8EB]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardTab data={dashboardData} loading={dashboardLoading} />
                )}
                {activeTab === 'users' && (
                  <UsersTab 
                    data={usersData} 
                    loading={usersLoading}
                    search={search}
                    setSearch={setSearch}
                    onToggleStatus={handleToggleUserStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                  />
                )}
                {activeTab === 'trips' && (
                  <TripsTab 
                    data={tripsData} 
                    loading={tripsLoading}
                    search={search}
                    setSearch={setSearch}
                    onDeleteTrip={handleDeleteTrip}
                    onTogglePublic={handleToggleTripPublic}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                  />
                )}
                {activeTab === 'cities' && (
                  <CitiesTab data={citiesData} loading={citiesLoading} />
                )}
                {activeTab === 'activities' && (
                  <ActivitiesTab data={activitiesData} loading={activitiesLoading} />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab dashboardData={dashboardData} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const stats = data?.adminDashboard || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <div className="text-sm text-[#9AA0A6]">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Users", 
            value: stats.totalUsers || 0, 
            icon: Users, 
            color: "text-blue-400",
            bgColor: "bg-blue-500/20"
          },
          { 
            label: "Total Trips", 
            value: stats.totalTrips || 0, 
            icon: MapPin, 
            color: "text-green-400",
            bgColor: "bg-green-500/20"
          },
          { 
            label: "Active Users", 
            value: stats.activeUsers || 0, 
            icon: CheckCircle, 
            color: "text-yellow-400",
            bgColor: "bg-yellow-500/20"
          },
          { 
            label: "Public Trips", 
            value: stats.publicTrips || 0, 
            icon: Globe, 
            color: "text-purple-400",
            bgColor: "bg-purple-500/20"
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border border-[#2a2a35] p-6 ${stat.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#9AA0A6] mb-1">{stat.label}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md bg-[#15151f] hover:bg-[#1a1a24] transition-colors">
              <Plus className="w-4 h-4" />
              Add New User
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md bg-[#15151f] hover:bg-[#1a1a24] transition-colors">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md bg-[#15151f] hover:bg-[#1a1a24] transition-colors">
              <Settings className="w-4 h-4" />
              System Settings
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>New user registered</span>
              <span className="text-[#9AA0A6] ml-auto">2m ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Trip published</span>
              <span className="text-[#9AA0A6] ml-auto">5m ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>Activity updated</span>
              <span className="text-[#9AA0A6] ml-auto">10m ago</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ 
  data, 
  loading, 
  search, 
  setSearch, 
  onToggleStatus, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage 
}: {
  data: any;
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}) {
  const users = data?.adminUsers?.users || [];
  const total = data?.adminUsers?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: any) =>
      [u.name, u.email, u.firstName, u.lastName]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">User Management</h2>
        <button className="px-4 py-2 rounded-md bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)]/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9AA0A6]" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] placeholder-[#9AA0A6] focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl overflow-hidden border border-[#2a2a35] bg-[#0f0f17]">
        <table className="w-full text-sm">
          <thead className="bg-[#15151f] text-[#9AA0A6]">
            <tr>
              <th className="text-left px-6 py-4">User</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Location</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Last Login</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#9AA0A6]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--accent-1)]"></div>
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#9AA0A6]">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user.id} className="border-t border-[#2a2a35] hover:bg-[#15151f] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-1)]/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--accent-1)]">
                          {(user.name || user.firstName || user.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name || `${user.firstName} ${user.lastName}`}</div>
                        <div className="text-xs text-[#9AA0A6]">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 capitalize">
                      {String(user.role).replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#9AA0A6]">
                    {user.city && user.country ? `${user.city}, ${user.country}` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(user.id, user.isActive)}
                      className={`flex items-center gap-2 px-2 py-1 text-xs rounded-full transition-colors ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[#9AA0A6]">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#9AA0A6]">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-[#2a2a35] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#15151f] transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-[#2a2a35] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#15151f] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Trips Tab Component
function TripsTab({ 
  data, 
  loading, 
  search, 
  setSearch, 
  onDeleteTrip, 
  onTogglePublic,
  currentPage, 
  setCurrentPage, 
  itemsPerPage 
}: {
  data: any;
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onTogglePublic: (tripId: string, isPublic: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}) {
  const trips = data?.adminTrips?.trips || [];
  const total = data?.adminTrips?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t: any) =>
      [t.title, t.description, t.owner?.email]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
    );
  }, [trips, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Trip Management</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9AA0A6]" />
          <input
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] placeholder-[#9AA0A6] focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-xl overflow-hidden border border-[#2a2a35] bg-[#0f0f17]">
        <table className="w-full text-sm">
          <thead className="bg-[#15151f] text-[#9AA0A6]">
            <tr>
              <th className="text-left px-6 py-4">Trip</th>
              <th className="text-left px-6 py-4">Owner</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Created</th>
              <th className="text-left px-6 py-4">Updated</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#9AA0A6]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--accent-1)]"></div>
                    Loading trips...
                  </div>
                </td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#9AA0A6]">
                  No trips found
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip: any) => (
                <tr key={trip.id} className="border-t border-[#2a2a35] hover:bg-[#15151f] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{trip.title}</div>
                      <div className="text-xs text-[#9AA0A6] mt-1 line-clamp-2">
                        {trip.description || "No description"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#9AA0A6]">{trip.owner?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onTogglePublic(trip.id, trip.isPublic)}
                      className={`flex items-center gap-2 px-2 py-1 text-xs rounded-full transition-colors ${
                        trip.isPublic 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {trip.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {trip.isPublic ? 'Public' : 'Private'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[#9AA0A6]">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-[#9AA0A6]">
                    {new Date(trip.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#9AA0A6]">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} trips
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-[#2a2a35] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#15151f] transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-[#2a2a35] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#15151f] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Cities Tab Component
function CitiesTab({ data, loading }: { data: any; loading: boolean }) {
  const cities = data?.getCities || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Popular Cities</h2>
        <button className="px-4 py-2 rounded-md bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)]/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add City
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-1)] mx-auto mb-4"></div>
          Loading cities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city: string, index: number) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17] hover:bg-[#15151f] transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-1)]/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--accent-1)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{city}</h3>
                  <p className="text-sm text-[#9AA0A6]">Popular destination</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
                <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Activities Tab Component
function ActivitiesTab({ data, loading }: { data: any; loading: boolean }) {
  const activities = data?.getActivities || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Activities Management</h2>
        <button className="px-4 py-2 rounded-md bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)]/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-1)] mx-auto mb-4"></div>
          Loading activities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.slice(0, 12).map((activity: any, index: number) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17] hover:bg-[#15151f] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-1)]/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[var(--accent-1)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-1">{activity.name}</h3>
                    <p className="text-sm text-[#9AA0A6]">
                      {activity.location?.city}, {activity.location?.country}
                    </p>
                  </div>
                </div>
                <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#9AA0A6] mb-4 line-clamp-2">
                {activity.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-[var(--accent-1)] font-semibold">
                    {activity.pricing?.currency} {activity.pricing?.basePrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-[#2a2a35] transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Analytics Tab Component - Part 1
function AnalyticsTab({ dashboardData }: { dashboardData: any }) {
  const stats = dashboardData?.adminDashboard || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Analytics & Reports</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-[#15151f] border border-[#2a2a35] hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="px-4 py-2 rounded-md bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)]/90 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{stats.totalUsers || 650}</div>
          <div className="text-sm text-green-400">+12% from last month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Trip Creation</h3>
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{stats.totalTrips || 1250}</div>
          <div className="text-sm text-blue-400">+8% from last month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Users</h3>
            <Users className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{stats.activeUsers || 580}</div>
          <div className="text-sm text-yellow-400">+5% from last month</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <AnalyticsChartsSection />
    </div>
  );
}

// Analytics Charts Section Component - Part 2A (Main Charts)
function AnalyticsChartsSection() {
  // Sample data for User Activity Over Time
  const userActivityData = [
    { month: 'Jan', users: 120, newUsers: 45, activeUsers: 98 },
    { month: 'Feb', users: 150, newUsers: 52, activeUsers: 125 },
    { month: 'Mar', users: 180, newUsers: 38, activeUsers: 145 },
    { month: 'Apr', users: 220, newUsers: 65, activeUsers: 180 },
    { month: 'May', users: 280, newUsers: 78, activeUsers: 220 },
    { month: 'Jun', users: 320, newUsers: 85, activeUsers: 260 },
    { month: 'Jul', users: 380, newUsers: 92, activeUsers: 310 },
    { month: 'Aug', users: 420, newUsers: 88, activeUsers: 350 },
    { month: 'Sep', users: 480, newUsers: 95, activeUsers: 400 },
    { month: 'Oct', users: 520, newUsers: 102, activeUsers: 450 },
    { month: 'Nov', users: 580, newUsers: 110, activeUsers: 500 },
    { month: 'Dec', users: 650, newUsers: 125, activeUsers: 580 }
  ];

  // Sample data for Trip Distribution
  const tripDistributionData = [
    { name: 'Adventure', value: 35, color: '#8B5CF6' },
    { name: 'Cultural', value: 25, color: '#06B6D4' },
    { name: 'Relaxation', value: 20, color: '#10B981' },
    { name: 'Business', value: 12, color: '#F59E0B' },
    { name: 'Family', value: 8, color: '#EF4444' }
  ];

  // Custom tooltip for the area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-3 shadow-lg">
          <p className="text-[#E6E8EB] font-medium">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-3 shadow-lg">
          <p className="text-[#E6E8EB] font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-sm">
            {`${data.value}% of trips`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17] hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">User Activity Over Time</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                <span className="text-[#9AA0A6]">Total Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
                <span className="text-[#9AA0A6]">Active Users</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userActivityData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
              <XAxis 
                dataKey="month" 
                stroke="#9AA0A6" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9AA0A6" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#06B6D4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActiveUsers)"
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trip Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17] hover:bg-[#15151f] transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Trip Distribution</h3>
            <div className="text-sm text-[#9AA0A6]">By Category</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={tripDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {tripDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {tripDistributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-[#9AA0A6]">{item.name}</span>
                <span className="text-sm font-medium ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart Section */}
      <RevenueChartSection userActivityData={userActivityData} />
    </div>
  );
}

// Revenue Chart Section Component - Part 2B
function RevenueChartSection({ userActivityData }: { userActivityData: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-xl border border-[#2a2a35] p-6 bg-[#0f0f17]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Monthly Revenue Trend</h3>
        <div className="flex items-center gap-2 text-sm text-[#9AA0A6]">
          <TrendingUp className="w-4 h-4" />
          <span>+15% vs last quarter</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={userActivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
          <XAxis 
            dataKey="month" 
            stroke="#9AA0A6" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9AA0A6" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#0f0f17',
              border: '1px solid #2a2a35',
              borderRadius: '8px',
              color: '#E6E8EB'
            }}
          />
          <Bar 
            dataKey="newUsers" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}


