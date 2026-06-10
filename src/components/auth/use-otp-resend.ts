import { useCallback, useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 60;

export function useOtpResend() {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, []);

  const runWithSending = useCallback(async (action: () => Promise<void>) => {
    setSending(true);
    try {
      await action();
      startCooldown();
    } finally {
      setSending(false);
    }
  }, [startCooldown]);

  return {
    cooldown,
    sending,
    canResend: cooldown === 0 && !sending,
    startCooldown,
    runWithSending,
  };
}
