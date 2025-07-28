"use client";

import { useState, useEffect } from "react";
import { FerryData } from "./lib/types";
import { COLORS, GRADIENTS } from "./lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Ship,
  Users,
  Car,
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Zap,
  Info, // Add Info icon for no data
  Search, // Add search icon
} from "lucide-react";
import {
  formatDateRange,
  getPortTraffic,
  getRoutePassengerDistribution,
  getRoutePerformanceData,
  getTimeAnalysis,
  getTotalStats,
} from "./lib/helpers";
import Footer from "@/components/Footer";

export default function FerryAnalytics() {
  // Calculate today's date and 7 days ago
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoString = sevenDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD

  const [data, setData] = useState<FerryData[]>([]);
  const [allData, setAllData] = useState<FerryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [dateRange, setDateRange] = useState({
    from: sevenDaysAgoString, // Set from date to 7 days ago
    to: todayString, // Set to date to today
  });
  const [hasFetched, setHasFetched] = useState(false); // Track if initial fetch occurred
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const fetchData = async () => {
    setLoading(true);
    setData([]); // Clear current data before fetching
    setAllData([]);
    setDisplayCount(8); // Reset display count

    // Ensure 'from' date is not after 'to' date
    if (new Date(dateRange.from) > new Date(dateRange.to)) {
      alert(
        "Η 'Από Ημερομηνία' δεν μπορεί να είναι μετά την 'Έως Ημερομηνία'."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://data.gov.gr/api/v1/query/sailing_traffic?date_from=${dateRange.from}&date_to=${dateRange.to}`
      );
      const result = await response.json();
      setAllData(result);
      setData(result.slice(0, 8)); // Display initial 8 items
      console.log(data);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback sample data with Greek text
      const fallbackData = [
        {
          departureportname: "ΠΕΙΡΑΙΑΣ",
          vehiclecount: 127,
          date: "2025-04-18",
          arrivalport: "JMK",
          departureport: "PIR",
          passengercount: 789,
          routecode: "PIRJMKJNXJTR",
          routecodenames: "ΠΕΙΡΑΙΑΣ-ΜΥΚΟΝΟΣ-ΝΑΞΟΣ-ΘΗΡΑ",
          arrivalportname: "ΜΥΚΟΝΟΣ",
        },
      ];
      setAllData(fallbackData);
      setData(fallbackData.slice(0, 8)); // Display initial 8 items from fallback
      setHasFetched(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]); // Rerun fetchData when dateRange changes (e.g., from quick select)

  const handleSearch = () => {
    fetchData();
  };

  const downloadData = () => {
    if (allData.length === 0) {
      alert("Δεν υπάρχουν δεδομένα για εξαγωγή.");
      return;
    }
    const csvContent = [
      "Ημερομηνία,Λιμάνι Αναχώρησης,Λιμάνι Άφιξης,Επιβάτες,Οχήματα,Κωδικός Δρομολογίου,Όνομα Δρομολογίου",
      ...allData.map(
        (item) =>
          `${item.date},"${item.departureportname}","${item.arrivalportname}",${item.passengercount},${item.vehiclecount},"${item.routecode}","${item.routecodenames}"`
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `greek_ferry_data_${dateRange.from}_to_${dateRange.to}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadMoreData = () => {
    setDisplayCount((prev) => Math.min(prev + 8, filteredAndSortedData.length));
  };

  const stats = getTotalStats(allData);
  const portTraffic = getPortTraffic(allData);
  const routePassengerDistribution = getRoutePassengerDistribution(allData); // New data for Pie
  const routePerformanceData = getRoutePerformanceData(allData);
  const timeAnalysis = getTimeAnalysis();

  // Filter and sort data for the table
  const filteredAndSortedData = allData
    .filter((item) =>
      searchQuery
        ? item.departureportname
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.arrivalportname
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.routecodenames.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (loading && !hasFetched) {
    // Show initial loading only if no data has been fetched yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Φόρτωση δεδομένων πλοίων...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Ship className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Αναλυτικά Στοιχεία Ελληνικών Πλοίων
                </h1>
                <p className="text-slate-500 text-sm">
                  {formatDateRange(dateRange)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadData}
                className="p-2 cursor-pointer rounded-xl bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/20 transition-all duration-200 group"
                title="Κατέβασμα Δεδομένων"
              >
                <Download className="h-5 w-5 text-slate-600 group-hover:text-indigo-600" />
              </button>
              <button
                onClick={handleSearch} // Use handleSearch to re-fetch with current date range
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Ανανέωση
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Επιλογή Εύρους Ημερομηνιών
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              Τελευταία ενημέρωση: {new Date().toLocaleTimeString("el-GR")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Από Ημερομηνία
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  const newFromDate = e.target.value;
                  // Ensure newFromDate is not after current 'to' date
                  if (new Date(newFromDate) > new Date(dateRange.to)) {
                    setDateRange({ from: newFromDate, to: newFromDate }); // Set both to same date
                  } else {
                    setDateRange((prev) => ({ ...prev, from: newFromDate }));
                  }
                }}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Έως Ημερομηνία
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => {
                  const newToDate = e.target.value;
                  // Ensure newToDate is not before current 'from' date
                  if (new Date(newToDate) < new Date(dateRange.from)) {
                    setDateRange({ from: newToDate, to: newToDate }); // Set both to same date
                  } else {
                    setDateRange((prev) => ({ ...prev, to: newToDate }));
                  }
                }}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Γρήγορη Επιλογή
              </label>
              <select
                onChange={(e) => {
                  const today = new Date();
                  const value = e.target.value;
                  if (value === "today") {
                    const todayStr = today.toISOString().split("T")[0];
                    setDateRange({ from: todayStr, to: todayStr });
                  } else if (value === "week") {
                    const weekAgo = new Date(
                      today.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                    setDateRange({
                      from: weekAgo.toISOString().split("T")[0],
                      to: today.toISOString().split("T")[0],
                    });
                  } else if (value === "month") {
                    const monthAgo = new Date(
                      today.getTime() - 30 * 24 * 60 * 60 * 1000
                    );
                    setDateRange({
                      from: monthAgo.toISOString().split("T")[0],
                      to: today.toISOString().split("T")[0],
                    });
                  }
                }}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm"
              >
                <option value="">Επιλέξτε περίοδο...</option>
                <option value="today">Σήμερα</option>
                <option value="week">Τελευταίες 7 ημέρες</option>
                <option value="month">Τελευταίες 30 ημέρες</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Αναζήτηση
              </label>
              <button
                onClick={handleSearch}
                className="cursor-pointer w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-sm font-medium"
              >
                Αναζήτηση Δεδομένων
              </button>
            </div>
          </div>
        </div>

        {allData.length === 0 && !loading && hasFetched ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-8 text-center text-slate-700">
            <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Δεν βρέθηκαν δεδομένα για την επιλεγμένη περίοδο.
            </h3>
            <p className="text-slate-600">
              Προσπαθήστε να επιλέξετε διαφορετική ημερομηνία ή εύρος
              ημερομηνιών.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Συνολικοί Επιβάτες",
                  value: stats.totalPassengers,
                  growth: stats.passengerGrowth,
                  icon: Users,
                  gradient: GRADIENTS[0],
                  color: "indigo",
                },
                {
                  title: "Συνολικά Οχήματα",
                  value: stats.totalVehicles,
                  growth: stats.vehicleGrowth,
                  icon: Car,
                  gradient: GRADIENTS[1],
                  color: "cyan",
                },
                {
                  title: "Ενεργά Δρομολόγια",
                  value: stats.totalRoutes,
                  growth: stats.routeGrowth,
                  icon: TrendingUp,
                  gradient: GRADIENTS[2],
                  color: "emerald",
                },
                {
                  title: "Εξυπηρετούμενα Λιμάνια",
                  value: stats.totalPorts,
                  growth: stats.portGrowth,
                  icon: MapPin,
                  gradient: GRADIENTS[3],
                  color: "amber",
                },
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div
                    className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-white/80 text-sm">
                        {stat.growth > 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </div>

                    <div className="text-white">
                      <p className="text-white/80 text-sm font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">
                        {stat.value.toLocaleString("el-GR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Analysis Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Μοτίβο Ημερήσιας Κίνησης
                </h2>
                <div className="ml-auto text-sm text-slate-500">
                  Ωριαία Κατανομή
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeAnalysis}>
                  <defs>
                    <linearGradient
                      id="passengerGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                    formatter={(value: number) =>
                      `${value.toLocaleString("el-GR")} επιβάτες`
                    }
                    labelFormatter={(label) => `Ώρα: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="passengers"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#passengerGradient)"
                    name="Επιβάτες"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Port Traffic Chart */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Ανάλυση Κίνησης Λιμανιών
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={portTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="port"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={11}
                      stroke="#64748b"
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                      formatter={(value: number, name: string) => [
                        value.toLocaleString("el-GR"),
                        name === "departures" ? "Αναχωρήσεις" : "Αφίξεις",
                      ]}
                      labelFormatter={(label) => `Λιμάνι: ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="departures"
                      fill="#10b981"
                      name="Αναχωρήσεις"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="arrivals"
                      fill="#06b6d4"
                      name="Αφίξεις"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Passenger Distribution Pie Chart */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Κατανομή Επιβατών ανά Δρομολόγιο
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={routePassengerDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ route, passengers }) =>
                        `${route}: ${Math.round(passengers).toLocaleString(
                          "el-GR"
                        )}`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      strokeWidth={3}
                      stroke="#fff"
                      dataKey="passengers" // Now using passengers dataKey
                    >
                      {routePassengerDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toLocaleString("el-GR")} επιβάτες`,
                        "Συνολικοί Επιβάτες",
                      ]}
                      labelFormatter={(label) => `Δρομολόγιο: ${label}`}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    {/* Removed Legend from Pie Chart as requested */}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Ανάλυση Απόδοσης Δρομολογίων
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Ημερήσια στατιστικά απόδοσης για{" "}
                      {formatDateRange(dateRange)} • Σύγκριση Επιβατών έναντι
                      Οχημάτων
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    Περίοδος Ανάλυσης
                  </div>
                  <div className="text-lg font-semibold text-slate-800">
                    {formatDateRange(dateRange)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600">
                    Μέσος Όρος Επιβατών/Δρομολόγιο
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(
                      routePerformanceData.reduce(
                        (sum, r) => sum + r.avgPassengers,
                        0
                      ) / (routePerformanceData.length || 1)
                    ).toLocaleString("el-GR")}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600">
                    Μέσος Όρος Οχημάτων/Δρομολόγιο
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round(
                      routePerformanceData.reduce(
                        (sum, r) => sum + r.avgVehicles,
                        0
                      ) / (routePerformanceData.length || 1)
                    ).toLocaleString("el-GR")}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600">
                    Σύνολο Αναλυμένων Δρομολογίων
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {routePerformanceData.length.toLocaleString("el-GR")}
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={routePerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="route"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                    stroke="#64748b"
                    interval={0} // Allows all labels to be shown, may overlap if too many
                  />
                  <YAxis yAxisId="left" stroke="#64748b" name="Επιβάτες" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    name="Οχήματα"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString("el-GR"),
                      name === "passengers"
                        ? "Συνολικοί Επιβάτες"
                        : "Συνολικά Οχήματα",
                    ]}
                    labelFormatter={(label) => `Δρομολόγιο: ${label}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="passengers"
                    fill="#6366f1"
                    name="Επιβάτες"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="vehicles"
                    fill="#10b981"
                    name="Οχήματα"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Πρόσφατες Κινήσεις Πλοίων
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Ζωντανά δεδομένα από το δίκτυο των ελληνικών πλοίων
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Αναζήτηση δρομολογίου..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 pl-9 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm"
                    />
                  </div>
                  <button className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 w-full sm:w-auto">
                    <Filter className="h-4 w-4" />
                    Φίλτρο
                  </button>
                  <button
                    onClick={() =>
                      setDisplayCount(filteredAndSortedData.length)
                    }
                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4" />
                    Προβολή Όλων
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Ημερομηνία
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Δρομολόγιο
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Επιβάτες
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Οχήματα
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Χρησιμοποίηση
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedData
                      .slice(0, displayCount)
                      .map((item, index) => {
                        const utilization = Math.round(
                          (item.passengercount /
                            Math.max(
                              1,
                              item.passengercount + item.vehiclecount * 2.5
                            )) *
                            100
                        );
                        return (
                          <tr
                            key={index}
                            className="hover:bg-slate-50/50 transition-colors duration-150 group"
                          >
                            <td className="px-4 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                {item.date}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                  <Ship className="h-3 w-3 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800 text-sm">
                                    {item.departureportname}
                                  </div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <span>→</span>
                                    {item.arrivalportname}
                                  </div>
                                  <span className="text-[10px] text-blue-900">
                                    {" "}
                                    {item.routecodenames}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-indigo-100 rounded-md">
                                  <Users className="h-3 w-3 text-indigo-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {item.passengercount.toLocaleString("el-GR")}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-emerald-100 rounded-md">
                                  <Car className="h-3 w-3 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {item.vehiclecount.toLocaleString("el-GR")}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      utilization > 80
                                        ? "bg-red-500"
                                        : utilization > 60
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(utilization, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">
                                  {utilization}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Εμφανίζονται{" "}
                  {Math.min(displayCount, filteredAndSortedData.length)} από{" "}
                  {filteredAndSortedData.length} κινήσεις πλοίων
                </div>
                {displayCount < filteredAndSortedData.length && (
                  <button
                    onClick={loadMoreData}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                  >
                    <Zap className="h-4 w-4" />
                    Φόρτωση Περισσότερων Δεδομένων
                  </button>
                )}
                {displayCount >= filteredAndSortedData.length &&
                  filteredAndSortedData.length > 8 && (
                    <span className="text-sm text-slate-500">
                      Όλα τα δεδομένα φορτώθηκαν.
                    </span>
                  )}
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
