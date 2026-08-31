import { api } from "@/services/api";

export async function getTaxCorporatePhase9() {
  const res = await api.get("/tax-corporate");
  return res?.data;
}

