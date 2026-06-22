import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin/users.api";

type Settings = {
  identity: {
    platform_name: string;
    logo_url: string;
  };
  organization: {
    org_name: string;
    commercial_reg: string;
    official_email: string;
    contact_phone: string;
    address: string;
  };
};

type SettingsResponse = {
  isSuccess: boolean;
  message: string;
  data: Settings;
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hydratedset, setHydrated] = useState(false);

  useEffect(() => {
    apiFetch<SettingsResponse>("/admin/settings")
      .then(({ data }) => setSettings(data))
      .catch(() => setSettings(null))
      .finally(() => setHydrated(true));
  }, []);

  return { settings, hydratedset };
}
