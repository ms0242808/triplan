import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { useAuth } from "../auth";

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("eve@frieswings.com");
  const [pw, setPw] = useState("atrium");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-form">
        <div className="inner">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div className="brand-mark" style={{ width: 36, height: 36, borderRadius: 11 }}>A</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>Atrium</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Workplace booking</div>
            </div>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, letterSpacing: "-0.025em", fontWeight: 600 }}>Welcome back</h1>
          <div className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
            Sign in to book rooms, manage events, and host visitors.
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Work email</label>
              <div style={{ position: "relative" }}>
                <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={{ paddingLeft: 38, width: "100%" }} />
                <div style={{ position: "absolute", left: 12, top: 11, color: "var(--text-3)" }}><Icon.Mail /></div>
              </div>
            </div>
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Password</label>
                <a href="#" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input className="input" type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} style={{ paddingLeft: 38, paddingRight: 38, width: "100%" }} />
                <div style={{ position: "absolute", left: 12, top: 11, color: "var(--text-3)" }}><Icon.Lock /></div>
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 8, top: 8, padding: 6, borderRadius: 6, color: "var(--text-3)" }}>
                  <Icon.Eye />
                </button>
              </div>
            </div>
            {error && (
              <div style={{ fontSize: 12.5, color: "oklch(0.42 0.16 25)", padding: "8px 12px", borderRadius: 8, background: "oklch(0.95 0.04 25)", boxShadow: "inset 0 0 0 1px oklch(0.85 0.08 25)" }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn primary lg" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <Icon.Arrow />}
            </button>
          </form>

          <div className="muted" style={{ fontSize: 12, marginTop: 28, textAlign: "center" }}>
            Need access? Ask your workplace admin to invite you.
          </div>
        </div>
      </div>
      <div className="login-art">
        <div className="deco">
          <div className="ring" style={{ width: 520, height: 520, top: -120, right: -160 }} />
          <div className="ring" style={{ width: 380, height: 380, top: -50, right: -90 }} />
          <div className="ring" style={{ width: 240, height: 240, top: 30, right: -20 }} />
        </div>
        <div style={{ position: "absolute", top: 36, left: 36, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: .8 }}>
          Atrium · Workplace
        </div>
        <div className="quote">
          “The room knew we were coming. It dimmed the lights, started the call, and the team was already there.”
          <small>— Director of Operations</small>
        </div>
      </div>
    </div>
  );
};
