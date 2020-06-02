// This is the format that clients and other microservices see.
export interface Procedure {
  id?: string;
  label?: string;
  description?: string;
  listed?: boolean;
  inCommonVocab?: boolean;
  belongsToDeployment?: string;
  createdAt?: string;
  updatedAt?: string; 
}
