export interface Property {
  id: number;
  name?: string | null;
  fondation?: string | null;
  localite?: string | null;
  zip?: string | null;
  address: string;
  units?: number | null;
  group?: string | null;
  tags?: string[] | null;
  url: string;
  lat?: number | null;
  lng?: number | null;
  geometry?: string | null;
  images?: string[] | null;
  construction_year?: number | null;
  scraped_at: string;
}

export interface MapDictionary {
  layers: {
    grayscale: string;
    color: string;
    properties: string;
    buildingLayouts: string;
  };
}

export interface MapProps {
  properties: Property[];
  onSelect: (p: Property) => void;
  selectedProperty: Property | null;
  onHover?: (p: Property) => void;
  dict: MapDictionary;
}
