import api from "@/services/api";

export async function getRevenueCourtPhase8() {
  const res = await api.get("/revenue-court/phase8");
  return res.data;
}

