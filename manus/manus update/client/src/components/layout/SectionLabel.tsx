// Black Ledger style reminder: labels are compact instrument metadata, never decorative badges.

import type { ReactNode } from "react";

type SectionLabelProps = {
  code: string;
  children: ReactNode;
  tone?: "default" | "amber" | "emerald";
};

export function SectionLabel({ code, children, tone = "default" }: SectionLabelProps) {
  return (
    <div className={`section-label section-label-${tone}`}>
      <span className="section-label-code">{code}</span>
      <span className="section-label-name">{children}</span>
    </div>
  );
}
