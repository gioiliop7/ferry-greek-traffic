import { DateRange, FerryData } from "./types";

export const getTimeAnalysis = () => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i < 10 ? "0" + i : i}:00`,
    passengers: Math.floor(Math.random() * 200) + 50, // Mock data
    vehicles: Math.floor(Math.random() * 50) + 10, // Mock data
  }));
  return hours.filter((_, i) => i % 3 === 0);
};

export const getTotalStats = (allData: FerryData[]) => {
  const totalPassengers = allData.reduce(
    (sum, item) => sum + item.passengercount,
    0
  );
  const totalVehicles = allData.reduce(
    (sum, item) => sum + item.vehiclecount,
    0
  );
  const totalRoutes = new Set(allData.map((item) => item.routecode)).size;
  const totalPorts = new Set([
    ...allData.map((item) => item.departureportname),
    ...allData.map((item) => item.arrivalportname),
  ]).size;

  const passengerGrowth = 12.5; // Mock data
  const vehicleGrowth = 8.3; // Mock data
  const routeGrowth = 4.7; // Mock data
  const portGrowth = 2.1; // Mock data

  return {
    totalPassengers,
    totalVehicles,
    totalRoutes,
    totalPorts,
    passengerGrowth,
    vehicleGrowth,
    routeGrowth,
    portGrowth,
  };
};

export const getPortTraffic = (allData: FerryData[]) => {
  const portTraffic = allData.reduce((acc, item) => {
    const dept = item.departureportname;
    const arr = item.arrivalportname;

    if (!acc[dept])
      acc[dept] = { departures: 0, arrivals: 0, passengers: 0, vehicles: 0 };
    if (!acc[arr])
      acc[arr] = { departures: 0, arrivals: 0, passengers: 0, vehicles: 0 };

    acc[dept].departures += 1;
    acc[dept].passengers += item.passengercount;
    acc[dept].vehicles += item.vehiclecount;
    acc[arr].arrivals += 1;

    return acc;
  }, {} as Record<string, { departures: number; arrivals: number; passengers: number; vehicles: number }>);

  return Object.entries(portTraffic)
    .map(([port, stats]) => {
      const total = stats.departures + stats.arrivals; // Calculate total here
      return {
        port,
        ...stats,
        total: total,
        efficiency:
          Math.round((stats.passengers / Math.max(total, 1)) * 10) / 10,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

// Changed to passenger distribution for Pie Chart
export const getRoutePassengerDistribution = (allData: FerryData[]) => {
  const routePassengerStats = allData.reduce((acc, item) => {
    const route = item.routecodenames;
    if (!acc[route]) {
      acc[route] = { passengers: 0 };
    }
    acc[route].passengers += item.passengercount;
    return acc;
  }, {} as Record<string, { passengers: number }>);

  return Object.entries(routePassengerStats)
    .map(([route, stats]) => ({
      route,
      passengers: stats.passengers,
    }))
    .sort((a, b) => b.passengers - a.passengers)
    .slice(0, 8); // Limit to top 8 routes for readability
};

export const getRoutePerformanceData = (allData: FerryData[]) => {
  const routeStats = allData.reduce((acc, item) => {
    const route = item.routecodenames;
    if (!acc[route]) {
      acc[route] = { count: 0, passengers: 0, vehicles: 0 };
    }
    acc[route].count += 1;
    acc[route].passengers += item.passengercount;
    acc[route].vehicles += item.vehiclecount;
    return acc;
  }, {} as Record<string, { count: number; passengers: number; vehicles: number }>);

  return Object.entries(routeStats)
    .map(([route, stats]) => ({
      route,
      ...stats,
      avgPassengers: Math.round(stats.passengers / stats.count),
      avgVehicles: Math.round(stats.vehicles / stats.count),
    }))
    .sort((a, b) => b.passengers - a.passengers)
    .slice(0, 8);
};

export const formatDateRange = (dateRange: DateRange) => {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromTime = from.getTime();
  const toTime = to.getTime();
  const todayTime = today.getTime();

  if (fromTime === toTime) {
    if (fromTime === todayTime) {
      return "Σημερινά Δεδομένα";
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (fromTime === yesterday.getTime()) {
      return "Χθεσινά Δεδομένα";
    }
    return `Δεδομένα για ${from.toLocaleDateString("el-GR")}`;
  }

  const diffTime = Math.abs(toTime - fromTime);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return `Τελευταίες ${diffDays + 1} Ημέρες`;
  if (diffDays <= 30) return `Τελευταίες ${Math.ceil(diffDays / 7)} Εβδομάδες`;
  return `Περίοδος ${from.toLocaleDateString(
    "el-GR"
  )} έως ${to.toLocaleDateString("el-GR")}`;
};
