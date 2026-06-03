export interface SuburbData {
  name: string;
  slug: string;
  soilComposition: string;
  localHeadache: string;
  councilLink: string;
  landmark: string;
  ironRisk: 'Minimal' | 'Moderate' | 'High' | 'Severe';
  typicalDepth: string;
  waterQualityNotes: string;
  regulatoryBody: string;
}

export interface QuoteFormState {
  fullName: string;
  email: string;
  phone: string;
  suburb: string;
  serviceType: 'new_bore' | 'bore_repair' | 'retic_service' | 'pump_replacement' | 'electrical_fault';
  urgency: 'emergency' | 'this_week' | 'standard';
  notes: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}
