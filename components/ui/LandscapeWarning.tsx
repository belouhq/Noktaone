"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";

export function LandscapeWarning() {
  const { t } = useTranslation();
  return (
    <div className="landscape-warning fixed inset-0 bg-black z-[100] hidden items-center justify-center p-8 text-center pointer-events-none">
      <div>
        <p className="text-white text-lg">{t("common.landscapeWarning")}</p>
      </div>
    </div>
  );
}
