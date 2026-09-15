export interface BareAct {
  _id: string;
  actName: string;
  shortCode?: string;
  year?: number | string;
  category?: string;
  description?: string;
  totalSections?: number;
  sections?: Array<{
    sectionNumber: string | number;
    title: string;
    description: string;
    bailable?: boolean;
    compoundable?: boolean;
    punishment?: string;
  }>;
}

export interface CaseRecord {
  _id: string;
  caseTitle: string;
  caseNumber: string;
  client: string;
  advocate?: string;
  court: string;
  judge?: string;
  oppositeParty?: string;
  oppositeAdvocate?: string;
  practiceArea?: string;
  caseType?: string;
  filingDate?: string;
  registrationDate?: string;
  nextHearingDate?: string;
  currentStage?: string;
  status: "Active" | "Pending" | "Disposed" | "Decided";
  priority: "High" | "Medium" | "Low";
  description?: string;
  importantNotes?: string;
  caseTags?: string[];
  timeline?: Array<{
    type: string;
    description: string;
    createdAt: string | Date;
  }>;
}

export interface PoliceStation {
  _id: string;
  name: string;
  district: string;
  subdivision?: string;
  type?: string;
  address?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  lastVerified?: string;
  sho?: {
    name?: string;
    contact?: string;
  };
}

export interface Tribunal {
  _id: string;
  name: string;
  shortName: string;
  headquarters?: string;
  benchesCount?: number;
  jurisdiction?: string;
  actGoverned?: string;
  website?: string;
  description?: string;
  benches?: Array<{
    benchName: string;
    city: string;
    address?: string;
    contact?: string;
  }>;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface SupremeCourtItem {
  itemNumber: number;
  courtNumber: number;
  bench: string;
  caseNumber: string;
  petitioner: string;
  respondent: string;
  petitionerAdvocate: string;
  stage: string;
  status: string;
}
