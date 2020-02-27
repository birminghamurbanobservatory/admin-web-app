export class Sensor {
  id?: string;
  name?: string;
  description?: string;
  inDeployment?: string;
  isHostedBy?: string;
  permanentHost?: string;
  initialConfig?: Config[];
  currentConfig?: Config[];
  createdAt?: string;
  updatedAt?: string;
}

export class Config {
  id?: string;
  hasPriority?: boolean;
  observedProperty?: string;
  hasFeatureOfInterest?: string;
  discipline?: string[];
  usedProcedure?: string[];
}