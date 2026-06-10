import { BASE_URL } from "../utils";
import { getAccessToken } from "./Auth.api";

export type OtpPurpose = "change_password" | "reset_password" | "admin_change_password";

export interface RequestOtpPayload {
  email?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
export async function requestOtp(payload: RequestOtpPayload): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.isSuccess) {
    throw new Error(json.message || "فشل إرسال رمز التحقق");
  }

  return { success: true };
}
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.isSuccess) {
    throw new Error(json.message || "فشل إعادة تعيين كلمة المرور");
  }

  return { success: true };
}
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ success: boolean }> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: payload.current_password,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.isSuccess) {
    throw new Error(json.message || "فشل تغيير كلمة المرور");
  }

  return { success: true };
}
