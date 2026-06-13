/* ───────────────────────────────────────────────
   SAGARICA — site configuration
   Edit these values. No other file needs touching.
   ─────────────────────────────────────────────── */

window.SAGARICA_CONFIG = {

  // ── HERO VIDEO ──
  // Drop an MP4 in /assets and point to it, e.g. "assets/ocean.mp4".
  // Leave as "" to use the animated gradient fallback (no video).
  // Recommended: 1920x1080, H.264, < 5 MB, muted, seamless loop, ~12s.
  // Free + no-attribution sources: pexels.com/videos, coverr.co, pixabay.com
  // Search: "sunlight underwater" / "underwater sun rays" / "dark water".
  heroVideoSrc: "",
  heroVideoPoster: "", // optional jpg shown before video loads

  // ── পেঁচা SITE LINK ──
  pachaUrl: "#", // replace with পেঁচা's live URL when ready

  /* ───────────────────────────────────────────────
     JOTFORM — EMBEDDED FORMS
     ───────────────────────────────────────────────
     Each modal embeds a live JotForm via iframe. JotForm handles
     rendering, validation, submission, email notifications, and any
     Zapier/Sheets/Slack integrations you add in the JotForm dashboard.
     The iframe loads lazily — only when its modal is first opened —
     so it costs nothing on page load and doesn't hurt Lighthouse.

     These three IDs are already created in your JotForm account:
        A — Sagarica — General Inquiry
        B — Sagarica — Event Organiser Inquiry
        C — Sagarica — Vendor & Partner Application
     To swap a form later, just change its ID here.
  ─────────────────────────────────────────────── */
  jotformIds: {
    A: "261632830038049", // General Inquiry
    B: "261633549182057", // Event Organiser Inquiry
    C: "261633408637056"  // Vendor & Partner Application
  },

  contactEmail: "hello@sagarica.com"
};
