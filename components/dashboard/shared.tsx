import type { CSSProperties, ReactNode } from "react";

export function PageIntro({ title, body, action }: { title: string; body: string; action?: string }) {
  return <div className="db-page-intro"><div><h2>{title}</h2><p>{body}</p></div>{action && <button className="btn btn-primary btn-sm">{action}</button>}</div>;
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return <div className="card"><div className="card-header"><span className="card-title">{title}</span></div>{children}</div>;
}

export function MiniPanel({ title, value }: { title: string; value: string }) {
  return <div className="stat-card"><div className="stat-label">{title}</div><div className="stat-val">{value}</div></div>;
}

export function ApiDetail({ label, value }: { label: string; value: string }) {
  return <div className="api-detail"><span>{label}</span><strong>{value}</strong></div>;
}

export function EditableField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field"><span>{label}</span><input className="form-control" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function EditableSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><select className="form-control" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export function ColorSetting({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="color-field"><label>{label}</label><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function brandStyle(primaryColor: string) {
  return { "--brand": primaryColor } as CSSProperties;
}
