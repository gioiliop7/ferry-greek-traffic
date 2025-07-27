export const getTimeAnalysis = () => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i < 10 ? "0" + i : i}:00`,
    passengers: Math.floor(Math.random() * 200) + 50, // Mock data
    vehicles: Math.floor(Math.random() * 50) + 10, // Mock data
  }));
  return hours.filter((_, i) => i % 3 === 0);
};
