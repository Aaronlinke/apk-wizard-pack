// Nexus Brain — Multi-Role-Debatte mehrerer AI-"Bots"
// BETA (Vorschlag) → ALPHA (Kritik) → GAMMA (Lösung) → OMEGA (Synthese)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROLES: Record<string, { name: string; system: string }> = {
  beta: {
    name: "BETA – Entwerfer",
    system:
      "Du bist BETA. Entwirf einen konkreten, ambitionierten, aber technisch umsetzbaren Vorschlag zur Anfrage. Sei präzise, strukturiert, ohne Floskeln. Keine Disclaimer. Antworte auf Deutsch.",
  },
  alpha: {
    name: "ALPHA – Kritiker",
    system:
      "Du bist ALPHA, ein gnadenloser Härteprüfer. Lies BETAs Vorschlag und identifiziere die 3 schwersten Schwachstellen (technisch, ökonomisch, regulatorisch, sozial). Sei rücksichtslos präzise, kein Lob. Antworte auf Deutsch.",
  },
  gamma: {
    name: "GAMMA – Löser",
    system:
      "Du bist GAMMA. Schließe jede von ALPHA genannte Schwachstelle mit einer konkreten architektonischen Lösung. Nummeriere passend zu ALPHAs Punkten. Antworte auf Deutsch.",
  },
  omega: {
    name: "OMEGA – Synthese",
    system:
      "Du bist OMEGA. Vereine BETA, ALPHA und GAMMA zu einer gehärteten Endfassung mit: Kernantwort, Architektur, Phasenplan, nächste konkrete Aktion. Klar, kompakt, auf Deutsch.",
  },
};

async function ask(apiKey: string, system: string, user: string): Promise<string> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 1200,
    }),
  });
  if (!r.ok) {
    if (r.status === 429) throw new Error("Rate-Limit erreicht. Bitte kurz warten.");
    if (r.status === 402) throw new Error("AI-Credits aufgebraucht.");
    throw new Error(`AI Fehler: ${r.status}`);
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, extraContext } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt fehlt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY fehlt" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = extraContext ? `\n\nZusatzkontext:\n${extraContext}` : "";

    // BETA
    const beta = await ask(key, ROLES.beta.system, `Anfrage: ${prompt}${ctx}`);
    // ALPHA kritisiert BETA
    const alpha = await ask(
      key,
      ROLES.alpha.system,
      `Anfrage: ${prompt}\n\nBETA-Vorschlag:\n${beta}`,
    );
    // GAMMA löst ALPHAs Kritik
    const gamma = await ask(
      key,
      ROLES.gamma.system,
      `Anfrage: ${prompt}\n\nBETA:\n${beta}\n\nALPHA-Kritik:\n${alpha}`,
    );
    // OMEGA synthetisiert
    const omega = await ask(
      key,
      ROLES.omega.system,
      `Anfrage: ${prompt}\n\nBETA:\n${beta}\n\nALPHA:\n${alpha}\n\nGAMMA:\n${gamma}`,
    );

    return new Response(
      JSON.stringify({
        rounds: [
          { role: "beta", name: ROLES.beta.name, content: beta },
          { role: "alpha", name: ROLES.alpha.name, content: alpha },
          { role: "gamma", name: ROLES.gamma.name, content: gamma },
          { role: "omega", name: ROLES.omega.name, content: omega },
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
