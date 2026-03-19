import type { LangCode } from "@/lib/i18n";

export const COOKIE_CONSENT_COOKIE_NAME = "kx_cookie_consent";

export type CookieConsentPreferences = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type CookieConsentCopy = {
  badge: string;
  title: string;
  body: string;
  acceptAll: string;
  rejectOptional: string;
  customize: string;
  saveChoices: string;
  learnMore: string;
  categoriesTitle: string;
  essentialTitle: string;
  essentialBody: string;
  preferencesTitle: string;
  preferencesBody: string;
  analyticsTitle: string;
  analyticsBody: string;
  marketingTitle: string;
  marketingBody: string;
  alwaysOn: string;
  currentlyInactive: string;
  policyTitle: string;
  policyIntro: string;
  policyUpdated: string;
  policyEssential: string;
  policyPreferences: string;
  policyOptional: string;
};

const COOKIE_COPY: Record<"en" | "es", CookieConsentCopy> = {
  en: {
    badge: "Cookie settings",
    title: "We use cookies to keep Cloudsting secure and consistent.",
    body: "Essential cookies keep login, checkout integrity, language preferences, and account security working. Optional categories are prepared here so you can explicitly allow or reject them before they are ever enabled.",
    acceptAll: "Accept all",
    rejectOptional: "Reject optional",
    customize: "Customize",
    saveChoices: "Save choices",
    learnMore: "Cookie policy",
    categoriesTitle: "Choose categories",
    essentialTitle: "Essential cookies",
    essentialBody: "Required for authentication, checkout protection, fraud prevention, and core platform stability.",
    preferencesTitle: "Preference cookies",
    preferencesBody: "Used for optional personalization such as remembered UI preferences beyond the essentials.",
    analyticsTitle: "Analytics cookies",
    analyticsBody: "Would be used to understand traffic and improve product decisions without relying on guesswork.",
    marketingTitle: "Marketing cookies",
    marketingBody: "Would be used for campaign attribution, retargeting, and ad measurement if you ever enable those tools.",
    alwaysOn: "Always active",
    currentlyInactive: "Currently inactive",
    policyTitle: "Cookie policy",
    policyIntro: "Cloudsting uses a small set of cookies to run the platform safely. Essential cookies stay active because without them login, billing, and account protection would break.",
    policyUpdated: "Last updated: March 19, 2026",
    policyEssential: "Essential cookies cover sessions, security checks, checkout continuity, and the basic language experience used to render the application correctly.",
    policyPreferences: "Optional categories are available in the consent banner so you can explicitly allow or reject them before they are introduced.",
    policyOptional: "At the moment analytics and marketing cookies are not active in production. If that changes later, your stored consent choice will control them.",
  },
  es: {
    badge: "Cookies",
    title: "Usamos cookies para que Cloudsting funcione de forma segura y coherente.",
    body: "Las cookies esenciales mantienen el login, la integridad del checkout, las preferencias de idioma y la seguridad de la cuenta. Las categorias opcionales quedan preparadas aqui para que puedas aceptarlas o rechazarlas antes de activarlas algun dia.",
    acceptAll: "Aceptar todo",
    rejectOptional: "Rechazar opcionales",
    customize: "Configurar",
    saveChoices: "Guardar preferencias",
    learnMore: "Politica de cookies",
    categoriesTitle: "Elegir categorias",
    essentialTitle: "Cookies esenciales",
    essentialBody: "Necesarias para autenticacion, proteccion del checkout, prevencion de fraude y estabilidad base de la plataforma.",
    preferencesTitle: "Cookies de preferencias",
    preferencesBody: "Se usan para personalizacion opcional, como recordar ajustes de interfaz mas alla de lo estrictamente necesario.",
    analyticsTitle: "Cookies de analitica",
    analyticsBody: "Servirian para entender trafico y mejorar decisiones de producto sin ir a ciegas.",
    marketingTitle: "Cookies de marketing",
    marketingBody: "Servirian para atribucion de campanas, retargeting y medicion publicitaria si algun dia activas esas herramientas.",
    alwaysOn: "Siempre activas",
    currentlyInactive: "Actualmente inactivas",
    policyTitle: "Politica de cookies",
    policyIntro: "Cloudsting usa un conjunto pequeno de cookies para que la plataforma funcione con seguridad. Las cookies esenciales permanecen activas porque sin ellas fallarian el login, la facturacion y la proteccion de la cuenta.",
    policyUpdated: "Ultima actualizacion: 19 de marzo de 2026",
    policyEssential: "Las cookies esenciales cubren sesiones, comprobaciones de seguridad, continuidad del checkout y la experiencia basica de idioma necesaria para renderizar bien la aplicacion.",
    policyPreferences: "Las categorias opcionales estan disponibles en el banner para que puedas aceptarlas o rechazarlas expresamente antes de introducirlas.",
    policyOptional: "Ahora mismo las cookies de analitica y marketing no estan activas en produccion. Si eso cambia mas adelante, tu consentimiento guardado las controlara.",
  },
};

export function getCookieConsentCopy(lang: LangCode | string): CookieConsentCopy {
  return lang === "es" ? COOKIE_COPY.es : COOKIE_COPY.en;
}

export function createCookieConsentValue(
  input: Pick<CookieConsentPreferences, "preferences" | "analytics" | "marketing">
) {
  return JSON.stringify({
    essential: true,
    preferences: input.preferences,
    analytics: input.analytics,
    marketing: input.marketing,
    updatedAt: new Date().toISOString(),
  } satisfies CookieConsentPreferences);
}

export function parseCookieConsentValue(value: string | null | undefined): CookieConsentPreferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsentPreferences>;
    if (
      parsed &&
      parsed.essential === true &&
      typeof parsed.preferences === "boolean" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean" &&
      typeof parsed.updatedAt === "string"
    ) {
      return parsed as CookieConsentPreferences;
    }
  } catch {
    return null;
  }

  return null;
}