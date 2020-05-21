// This is the format that clients and other microservices see.
export interface FeatureOfInterest {
  id?: string;
  label?: string;
  comment?: string;
  listed?: boolean;
  inCommonVocab?: boolean;
  belongsToDeployment?: string;
  location?: Location;
  centroid?: Location;
  createdAt?: string;
  updatedAt?: string; 
}

interface Location {
  id?: string;
  geometry?: Geometry;
  validAt?: string;
  properties?: Properties;
}

interface Geometry {
 type?: string;
 coordinates?: any;
}

interface Properties {
  validAt?: number;
  height?: number;
}
