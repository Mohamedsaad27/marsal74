export type ActiveFlag = boolean;
export interface Governorate {
  governorate_id: string;
  name_ar: string;
  name_en: string;
  code: string;
  is_active: ActiveFlag;
  cities_count: number;
}

export interface City {
  city_id: string;
  name_ar: string;
  name_en: string;
  code: string;
  governorate_id: string;
  governorate_name: string;
  is_active: ActiveFlag;
}

export interface GovernoratePayload {
  name_ar: string;
  name_en: string;
  code: string;
  is_active?: ActiveFlag;
}

export interface CityPayload {
  name_ar: string;
  name_en: string;
  code: string;
  governorate_id: string;
  is_active?: ActiveFlag;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}
