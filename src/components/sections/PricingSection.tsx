"use client";

import { m } from "framer-motion";
import { Reveal, useStaggerVariants } from "@/components/ui/Reveal";
import { appUrl } from "@/lib/site";

interface Feature {
  /** Main feature text. */
  label: string;
  /** Small italic parenthetical rendered inline after the label. */
  note?: string;
  /** Inline pill badge rendered after the label. */
  badge?: "beta" | "soon";
  /** Lighter, smaller explanation rendered on its own line below the label. */
  detail?: string;
}

interface Plan {
  name: string;
  price: string;
  tagline: string;
  features: Feature[];
  featured?: boolean;
  /** Subtle limitation note shown below the feature list (Free tier). */
  limitation?: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    tagline: "Get started with one currency",
    features: [
      { label: "Chat-based expense logging" },
      { label: "20-message memory window" },
      { label: "Basic dashboard & analytics" },
      { label: "Budget tracking (up to 3 budgets)" },
      { label: "Single currency" },
      { label: "Spending streak" },
    ],
    limitation:
      "Free users have a 20-message memory window — the AI remembers your last 20 messages only.",
  },
  {
    name: "Pro",
    price: "$4.99",
    tagline: "For multi-currency earners",
    features: [
      { label: "Everything in Free" },
      { label: "90-day conversation memory" },
      { label: "Unlimited currencies & accounts" },
      { label: "Receipt scanning", note: "20 scans/day" },
      { label: "Advanced analytics" },
      { label: "Budget alerts & daily spending summary" },
      { label: "Streak repair", note: "recover a missed day, once", badge: "soon" },
      { label: "Voice chat", badge: "beta" },
      { label: "Priority support" },
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "$9.99",
    tagline: "For those who want a true AI coach",
    features: [
      { label: "Everything in Pro" },
      {
        label: "Permanent memory dossier",
        detail: "the agent remembers your full financial history — forever",
      },
      { label: "Receipt scanning", note: "50 scans/day" },
      { label: "AI coaching & proactive spending insights" },
      { label: "Monthly budget review with AI" },
      { label: "Streak repair", note: "recover a missed day, once", badge: "soon" },
    ],
  },
  {
    name: "Family",
    price: "$14.99",
    tagline: "For couples and families",
    features: [
      { label: "Everything in Premium" },
      { label: "Up to 5 members" },
      { label: "Shared workspace" },
      { label: "Per-member spending views" },
    ],
  },
];

export function PricingSection() {
  const { container, item } = useStaggerVariants();

  return (
    <section id="pricing" className="py-24">
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <h2
            className="font-extrabold"
            style={{
              fontSize: "clamp(1.85rem, 4vw, 2.375rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--color-text-primary)",
            }}
          >
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            Start free. Upgrade when Finby earns it.
          </p>
        </Reveal>

        <m.div
          className="pricing-grid mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {PLANS.map((plan) => (
            <m.div
              key={plan.name}
              variants={item}
              className={`card pricing-card relative flex h-full flex-col p-6 ${plan.featured ? "floating" : ""}`}
              style={plan.featured ? { borderColor: "var(--color-border-accent)" } : undefined}
            >
              {plan.featured ? (
                <span
                  className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: "var(--color-accent)", color: "#ffffff" }}
                >
                  Most Popular
                </span>
              ) : null}

              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                {plan.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  /mo
                </span>
              </div>

              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {plan.tagline}
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <span aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }}>
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                        <span>{feature.label}</span>
                        {feature.note ? (
                          <span className="italic" style={{ color: "var(--color-text-muted)" }}>
                            ({feature.note})
                          </span>
                        ) : null}
                        {feature.badge ? <span className="badge-pill">{feature.badge}</span> : null}
                      </span>
                      {feature.detail ? (
                        <span className="mt-0.5 block text-xs leading-snug" style={{ color: "var(--color-text-muted)" }}>
                          {feature.detail}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.limitation ? (
                <p
                  className="mt-4 border-t pt-3 text-xs italic leading-snug"
                  style={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-border)" }}
                >
                  {plan.limitation}
                </p>
              ) : null}

              <a
                href={appUrl}
                aria-label={`Get started with Finby — ${plan.name} plan`}
                className={plan.featured ? "btn-accent mt-6" : "mt-6"}
                style={
                  plan.featured
                    ? undefined
                    : {
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontWeight: 600,
                        fontSize: "14px",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                      }
                }
              >
                {plan.name === "Free" ? "Get started free" : `Get ${plan.name}`}
              </a>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
