import { api } from "@/services/api";

export async function getKnowledgeHubPhase10() {
  const res = await api.get("/knowledge-hub");
  return res?.data;
}