export class Sensor {
  id?: string;
  label?: string;
  description?: string;
  hasDeployment?: string;
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
  unit?: string;
  hasFeatureOfInterest?: string;
  disciplines?: string[];
  usedProcedures?: string[];
}