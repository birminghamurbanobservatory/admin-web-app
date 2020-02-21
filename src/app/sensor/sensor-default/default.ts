export class Default {
  id?: any;
  observedProperty?: string;
  hasFeatureOfInterest?: string;
  usedProcedures?: string[];
  when?: When;
}


class When {
  observedProperty?: string;
  hasFeatureOfInterest?: string;
  usedProcedures?: string[];
}