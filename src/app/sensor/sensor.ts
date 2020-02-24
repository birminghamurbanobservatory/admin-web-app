export class Sensor {
  id?: string;
  name?: string;
  description?: string;
  inDeployment?: string;
  isHostedBy?: string;
  permanentHost?: string;
  defaults?: Default[];
  createdAt?: string;
  updatedAt?: string;
}

export class Default {
  id?: string;
  observedProperty?: string;
  hasFeatureOfInterest?: string;
  usedProcedures?: string[];
  when?: When;
}

export class When {
  observedProperty?: string;
  hasFeatureOfInterest?: string;
}