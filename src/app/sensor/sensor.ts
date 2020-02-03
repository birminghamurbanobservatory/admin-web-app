export class Sensor {
  id?: string;
  name?: string;
  description?: string;
  inDeployment?: string;
  isHostedBy?: string;
  permanentHost?: string;
  defaults?: Defaults;
  createdAt?: string;
  deletedAt?: string;
}

class Defaults {
  observedProperty?: {value: string};
  hasFeatureOfInterest?: {value: string; ifs?: IF[]};
  usedProcedures?: {value: string[]};  
}

class IF {
  if: any;
  value: any;
}