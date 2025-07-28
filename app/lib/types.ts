export interface FerryData {
  departureportname: string;
  vehiclecount: number;
  date: string;
  arrivalport: string;
  departureport: string;
  passengercount: number;
  routecode: string;
  routecodenames: string;
  arrivalportname: string;
}

export interface DateRange {
  from: string;
  to: string;
}
