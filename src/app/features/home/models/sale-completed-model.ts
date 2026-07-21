export interface SaleCompletedRequest {
  correlationId: string | null;
  partnerId: string;
  /** JSON serializado, tal como lo espera el servicio de Mashery. */
  saleInformation: string;
}

export interface SaleInformation {
  personalInformation: Record<string, unknown>;
  propensityModel: Record<string, unknown>;
  collectionInformation: unknown[];
  incentiveInformation: {
    channel: string;
    subChannel: string;
    advisorId: number;
    advisoryOfficeCode: number;
    cityOfficeCode: string;
    departmentOfficeCode: string;
  };
  trace: {
    ip: string;
    deviceType: number | null;
  };
}
