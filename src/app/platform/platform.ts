// This is the format that clients and other microservices see.
export class Platform {
  id?: string;
  name: string;
  description?: string;
  ownerDeployment?: string;
  inDeployments?: string[];
  isHostedBy?: string;
  hostedByPath?: string[];
  static?: boolean;
  location?: Location;
  updateLocationWithSensor?: string;
  createdAt?: string;
  updatedAt?: string;
}


class Location {
  id?: string;
  geometry?: Geometry;
  validAt?: string;
}

class Geometry {
 type?: string;
 coordinates?: any;
}