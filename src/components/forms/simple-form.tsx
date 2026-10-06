"use client";

/* Config-driven form for contact, carrier setup, careers, partnership and referrals. */
import { useId, type FormEvent } from "react";
import type { FormKind } from "@/lib/forms/schemas";
import { useSubmit } from "./use-submit";

export type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "select" | "textarea" | "hidden";
  options?: readonly string[];
  required?: boolean;
  full?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
};

export function SimpleForm({ kind, fields, cta = "Send", sentText, id }: {
  kind: FormKind;
  fields: FieldSpec[];
  cta?: string;
  sentText?: string;
  id?: string;
}) {
  const uid = useId();
  const { state, submit } = useSubmit(kind);
  const errs = state.s === "error" ? state.errors ?? {} : {};

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const f of fields) data[f.name] = String(fd.get(f.name) ?? "");
    data.consent = fd.get("consent") === "on";
    if (await submit(data, String(fd.get("website") ?? ""))) e.currentTarget?.reset();
  }

  if (state.s === "sent") {
    return (
      <div className="qpanel form-done" role="status" id={id}>
        <span className="mono" style={{ color: "var(--sig-ink)" }}>Received · {state.id}</span>
        <h3>Thanks. A person will get back to you.</h3>
        <p>{sentText ?? "We usually reply within one business day. For anything urgent, call us any hour."}</p>
      </div>
    );
  }

  return (
    <div className="qpanel" id={id}>
      <form className="form" onSubmit={onSubmit} noValidate aria-label={`${cta} form`}>
        {fields.map((f) => {
          if (f.type === "hidden") return <input key={f.name} type="hidden" name={f.name} defaultValue={f.defaultValue} />;
          const fid = `${uid}-${f.name}`, err = errs[f.name];
          const common = { id: fid, name: f.name, required: f.required, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${fid}-e` : undefined, defaultValue: f.defaultValue };
          return (
            <div key={f.name} className={`field${f.full || f.type === "textarea" ? " full" : ""}${err ? " need" : ""}`}>
              <label className="lbl" htmlFor={fid}>{f.label}{f.required && <b className="rq" aria-hidden="true"> *</b>}</label>
              {f.type === "select" ? (
                <select {...common}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
              ) : f.type === "textarea" ? (
                <textarea {...common} rows={4} placeholder={f.placeholder} />
              ) : (
                <input {...common} type={f.type ?? "text"} autoComplete={f.autoComplete} placeholder={f.placeholder} />
              )}
              {err && <small className="err" id={`${fid}-e`}>{err}</small>}
            </div>
          );
        })}
        <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className={`agree full${errs.consent ? " need" : ""}`}>
          <input type="checkbox" name="consent" required /> I agree that Vektor may store this information to respond to me. <b className="rq">*</b>
        </label>
        <div className="full">
          <button className="btn" type="submit" disabled={state.s === "sending"}>{state.s === "sending" ? "Sending…" : cta} <i className="ar" /></button>
          {state.s === "error" && <p className="sent err" role="alert">{state.message}</p>}
        </div>
      </form>
    </div>
  );
}
