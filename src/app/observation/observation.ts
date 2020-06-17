export interface Observation {
  id?: string;
  madeBySensor?: string;
  hasResult?: Result;
  ancestorPlatforms?: string[]; // has a hierachical structure, top level parent first.
  hasDeployment?: string;
  resultTime?: string;
  observedProperty?: any; // could be a string or object depending on "populate" query param.
  aggregation: any;
  hasFeatureOfInterest?: any;
  location?: Location;
  usedProcedures?: any[];
  disciplines?: any[]; // each item could be a string or object depending on "populate" query param.
  phenomenonTime?: PhenomenonTime;
  inTimeseries?: []
}

class Result {
  value?: any;
  unit?: any; // could be a string or object depending on "populate" query param.
  flags?: string[];
}

class Location {
  public id?: string;
  public geometry?: Geometry;
  public properties: LocationProperties;
}

class LocationProperties {
  validAt?: string;
}

class Geometry {
  type?: string;
  coordinates?: any;
}

class PhenomenonTime {
  hasBeginning: string;
  hasEnd: string;
  duration: number;
}