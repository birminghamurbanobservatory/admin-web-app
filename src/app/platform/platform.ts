// This is the format that clients and other microservices see.
export interface Platform {
  id?: string;
  name?: string;
  description?: string;
  inDeployment?: string;
  isHostedBy?: string;
  ancestorPlatforms?: string[];
  static?: boolean;
  location?: Location;
  updateLocationWithSensor?: string;
  hosts?: any[];
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
