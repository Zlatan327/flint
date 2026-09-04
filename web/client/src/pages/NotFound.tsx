// Black Ledger style reminder: even an error state must read as a protocol instrument, with the same plinths, rules, and mono labels.

import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="flint-app" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <section style={{ width: "min(100%, 520px)", border: "1px solid rgba(255,255,255,0.1)", background: "#0E0E0E", padding: "28px" }}>
        <div className="section-label"><span className="section-label-code">SYS / 404</span><span className="section-label-name">Route not indexed</span></div>
        <TriangleAlert size={25} style={{ marginTop: "30px", color: "#FF6B00" }} />
        <h1 style={{ margin: "15px 0 0", color: "#EFEFEF", fontSize: "42px", letterSpacing: "-0.06em" }}>Signal unavailable.</h1>
        <p style={{ color: "#858585", lineHeight: 1.6, maxWidth: "390px" }}>This surface is not part of the active FLINT index. Return to the protocol console to continue operating.</p>
        <Link className="amber-button" href="/" style={{ marginTop: "19px" }}><ArrowLeft size={14} /> RETURN TO CONSOLE</Link>
      </section>
    </main>
  );
}
