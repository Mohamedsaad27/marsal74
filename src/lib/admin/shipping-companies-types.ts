export interface ShippingCompanyProfile {
  id: string;
  company_name: string;
  commercial_reg: string | null;
  logo_url: string | null;
  commission: {
    type: {
      code: number;
      label: string;
    };
    value: string;
  };
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingCompanyUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  avatar: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role: {
    name: string;
    label: string;
  };
  shipping_company: ShippingCompanyProfile;
  addresses: address[];
}

export interface ShippingCompaniesResponse {
  isSuccess: boolean;
  message: string;
  data: {
    counts: {
      total: number;
      active: number;
      inactive: number;
    };
    items: ShippingCompanyUser[];
    type: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more: boolean;
  };
}

export interface CreateShippingCompanyPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  profile: {
    company_name: string;
    commercial_reg?: string;
  };
  address: {
    city_id: string;
    address_line: string;
    landmark: string;
    street: string;
    building_number: string;
    is_default: number;
  };
}
export interface CommissionType {
  code: number;
  label: string;
}

export interface Commission {
  type: CommissionType;
  value: string;
}

export interface ShippingCompanyProfile {
  id: string;
  company_name: string;
  commercial_reg: string | null;
  logo_url: string | null;
  commission: Commission;
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  avatar: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;

  role: {
    name: string;
    label: string;
  };

  shipping_company: ShippingCompanyProfile;

  addresses: address[];
}
type address = {
  city_id: string;
  address_line: string;
  landmark: string;
  street: string;
  building_number: string;
  is_default: boolean;
};
