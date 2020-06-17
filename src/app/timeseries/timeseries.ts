export interface Timeseries {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    // The strucutre of the following will depend on whether they have been populated or not.
    observedProperty?: any;
    aggregation?: any;
    unit?: any;
    madeBySensor?: any;
    ancestorPlatforms?: any[];
    disciplines?: any[];
    hasDeployment?: any;
    hasFeatureOfInterest?: any;
}