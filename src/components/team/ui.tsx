import type { ReactNode } from "react";

export function PortalHead({ tag, title, children }: { tag: string; title: string; children?: ReactNode }) {
  return (
    <div className="team-top">
      <div><p className="tag">{tag}</p><h1>{title}</h1></div>
      {children}
    </div>
  );
}

/** A visible "this part isn't connected yet" card, with what it will connect to. */
export function Pending({ title, children, source }: { title: string; children: ReactNode; source?: string }) {
  return (
    <div className="tempty">
      <b>{title}</b>
      <p>{children}</p>
      {source && <p className="tsource">Connects to: {source}</p>}
    </div>
  );
}
