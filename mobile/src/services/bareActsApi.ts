import { api } from "@/services/api";

export type BareAct = {
  _id?: string;
  slug?: string;
  title?: string;
  actName?: string;
  shortName?: string;
  sectionNumber?: string;
  jurisdiction?: string;
  language?: string;
  status?: string;
  content?: string;
  tags?: string[];
  year?: number | string;
  category?: string;
  ministry?: string;
  keywords?: string[];
  pdfUrl?: string;
  isPopular?: boolean;
  isNewLaw?: boolean;
  publishedAt?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginationMeta = {
  totalItems?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
};

export type GetBareActsResponse = {
  success?: boolean;
  count?: number;
  bareActs?: BareAct[];
  data?: {
    bareActs?: BareAct[];
  };
  pagination?: PaginationMeta;
};

export async function getBareActs(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}): Promise<GetBareActsResponse> {
  const res = await api.get("/bare-acts", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      category: params.category,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
  return res.data;
}

