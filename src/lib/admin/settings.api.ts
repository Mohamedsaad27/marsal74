import { apiFetch } from "./users.api";

export interface SettingsResponse {
  isSuccess: boolean;
  message: string;
  data: {
    identity: {
      platform_name: string;
      logo_url: string | null;
    };
    organization: {
      org_name: string;
      commercial_reg: string;
      official_email: string;
      contact_phone: string;
      address: string;
    };
  };
}

export interface UpdateSettingsResponse {
  isSuccess: boolean;
  message: string;
  data: SettingsResponse["data"];
}

export const settingsApi = {
  get(): Promise<SettingsResponse> {
    return apiFetch<SettingsResponse>("/admin/settings");
  },

  update(formData: FormData): Promise<UpdateSettingsResponse> {
    return apiFetch<UpdateSettingsResponse>("/admin/settings", {
      method: "POST",
      body: formData,
    });
  },
};
