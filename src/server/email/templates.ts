import type { LangCode } from "@/lib/i18n";

type PanelAccessEmailInput = {
  brandName: string;
  panelUrl: string;
  email: string;
  temporaryPassword: string;
  lang: LangCode;
};

type OrderReceiptEmailInput = {
  brandName: string;
  appUrl: string;
  orderId: string;
  customerEmail: string;
  planName: string;
  serverName: string;
  provider: "STRIPE" | "PAYPAL" | "WALLET";
  amountCents: number;
  paidAt: Date;
  lang: LangCode;
};

const EMAIL_LOCALES: Record<LangCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  it: "it-IT",
  nl: "nl-NL",
  ru: "ru-RU",
  pl: "pl-PL",
  cs: "cs-CZ",
  hi: "hi-IN",
  tr: "tr-TR",
};

const PANEL_ACCESS_COPY: Record<LangCode, {
  subject: string;
  preheader: string;
  title: string;
  body: string;
  panelLabel: string;
  emailLabel: string;
  passwordLabel: string;
  button: string;
  security: string;
  ignore: string;
  footer: string;
}> = {
  en: {
    subject: "Panel Access",
    preheader: "Control panel access",
    title: "Your panel account is ready",
    body: "You can now sign in to manage your server: console, files, backups, and more.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Temporary password",
    button: "Open panel",
    security: "For security, change the password after your first sign-in.",
    ignore: "If you did not request this access, ignore this email.",
    footer: "All rights reserved.",
  },
  es: {
    subject: "Acceso al Panel",
    preheader: "Acceso al panel de control",
    title: "Tu cuenta del panel esta lista",
    body: "Ya puedes entrar al panel para gestionar tu servidor: consola, archivos, backups y mas.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Contrasena temporal",
    button: "Abrir panel",
    security: "Por seguridad, cambia la contrasena tras el primer inicio de sesion.",
    ignore: "Si no has solicitado este acceso, ignora este correo.",
    footer: "Todos los derechos reservados.",
  },
  fr: {
    subject: "Acces au panel",
    preheader: "Acces au panneau de controle",
    title: "Votre compte panel est pret",
    body: "Vous pouvez maintenant vous connecter pour gerer votre serveur : console, fichiers, sauvegardes et plus encore.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Mot de passe temporaire",
    button: "Ouvrir le panel",
    security: "Pour votre securite, changez le mot de passe apres la premiere connexion.",
    ignore: "Si vous n'avez pas demande cet acces, ignorez cet email.",
    footer: "Tous droits reserves.",
  },
  de: {
    subject: "Panel-Zugang",
    preheader: "Zugang zum Control Panel",
    title: "Dein Panel-Konto ist bereit",
    body: "Du kannst dich jetzt anmelden und deinen Server verwalten: Konsole, Dateien, Backups und mehr.",
    panelLabel: "Panel",
    emailLabel: "E-Mail",
    passwordLabel: "Temporäres Passwort",
    button: "Panel offnen",
    security: "Aus Sicherheitsgrunden solltest du das Passwort nach der ersten Anmeldung andern.",
    ignore: "Falls du diesen Zugriff nicht angefordert hast, ignoriere diese E-Mail.",
    footer: "Alle Rechte vorbehalten.",
  },
  pt: {
    subject: "Acesso ao Painel",
    preheader: "Acesso ao painel de controlo",
    title: "A tua conta do painel esta pronta",
    body: "Ja podes entrar no painel para gerir o teu servidor: consola, ficheiros, backups e muito mais.",
    panelLabel: "Painel",
    emailLabel: "Email",
    passwordLabel: "Palavra-passe temporaria",
    button: "Abrir painel",
    security: "Por seguranca, altera a palavra-passe apos o primeiro inicio de sessao.",
    ignore: "Se nao pediste este acesso, ignora este email.",
    footer: "Todos os direitos reservados.",
  },
  it: {
    subject: "Accesso al pannello",
    preheader: "Accesso al pannello di controllo",
    title: "Il tuo account pannello e pronto",
    body: "Ora puoi accedere al pannello per gestire il tuo server: console, file, backup e altro ancora.",
    panelLabel: "Pannello",
    emailLabel: "Email",
    passwordLabel: "Password temporanea",
    button: "Apri pannello",
    security: "Per sicurezza, cambia la password dopo il primo accesso.",
    ignore: "Se non hai richiesto questo accesso, ignora questa email.",
    footer: "Tutti i diritti riservati.",
  },
  nl: {
    subject: "Paneeltoegang",
    preheader: "Toegang tot het controlepaneel",
    title: "Je paneelaccount staat klaar",
    body: "Je kunt nu inloggen om je server te beheren: console, bestanden, back-ups en meer.",
    panelLabel: "Paneel",
    emailLabel: "E-mail",
    passwordLabel: "Tijdelijk wachtwoord",
    button: "Paneel openen",
    security: "Wijzig voor de veiligheid je wachtwoord na de eerste login.",
    ignore: "Als je deze toegang niet hebt aangevraagd, kun je deze e-mail negeren.",
    footer: "Alle rechten voorbehouden.",
  },
  ru: {
    subject: "Dostup k paneli",
    preheader: "Dostup k paneli upravleniya",
    title: "Vasha учетnaya zapis paneli gotova",
    body: "Teper vy mozhete voiti v panel i upravlyat serverom: konsol, fajly, rezervnye kopii i drugoe.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Vremennyj parol",
    button: "Otkryt panel",
    security: "Dlya bezopasnosti smenite parol posle pervogo vhoda.",
    ignore: "Esli vy ne zaprashivali etot dostup, prosto proignoriruyte eto pismo.",
    footer: "Vse prava zashchishcheny.",
  },
  pl: {
    subject: "Dostep do panelu",
    preheader: "Dostep do panelu sterowania",
    title: "Twoje konto panelu jest gotowe",
    body: "Mozesz teraz zalogowac sie do panelu, aby zarzadzac serwerem: konsola, pliki, kopie zapasowe i wiecej.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Haslo tymczasowe",
    button: "Otworz panel",
    security: "Dla bezpieczenstwa zmien haslo po pierwszym logowaniu.",
    ignore: "Jesli nie prosiles o ten dostep, zignoruj te wiadomosc.",
    footer: "Wszelkie prawa zastrzezone.",
  },
  cs: {
    subject: "Pristup do panelu",
    preheader: "Pristup do ovladaciho panelu",
    title: "Tvuj panelovy ucet je pripraven",
    body: "Nyni se muzes prihlasit do panelu a spravovat server: konzole, soubory, zalohy a dalsi veci.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Docasne heslo",
    button: "Otevrit panel",
    security: "Kvuli bezpecnosti si po prvnim prihlaseni zmen heslo.",
    ignore: "Pokud jsi o tento pristup nezadal, tento email ignoruj.",
    footer: "Vsechna prava vyhrazena.",
  },
  hi: {
    subject: "Panel Access",
    preheader: "Control panel access",
    title: "Aapka panel account taiyar hai",
    body: "Ab aap panel me sign in karke apne server ko manage kar sakte hain: console, files, backups aur aur bhi bahut kuch.",
    panelLabel: "Panel",
    emailLabel: "Email",
    passwordLabel: "Temporary password",
    button: "Open panel",
    security: "Security ke liye pehli sign-in ke baad password badal dein.",
    ignore: "Agar aapne yeh access request nahi kiya, to is email ko ignore kar dein.",
    footer: "All rights reserved.",
  },
  tr: {
    subject: "Panel Erisimi",
    preheader: "Kontrol paneli erisimi",
    title: "Panel hesabin hazir",
    body: "Artik panele giris yapip sunucunu yonetebilirsin: konsol, dosyalar, yedekler ve daha fazlasi.",
    panelLabel: "Panel",
    emailLabel: "E-posta",
    passwordLabel: "Gecici sifre",
    button: "Paneli ac",
    security: "Guvenlik icin ilk giristen sonra sifreni degistir.",
    ignore: "Bu erisimi sen istemediysen bu e-postayi yok say.",
    footer: "Tum haklari saklidir.",
  },
};

const RECEIPT_COPY: Record<LangCode, {
  badge: string;
  subject: string;
  title: string;
  intro: string;
  totalCharged: string;
  paid: string;
  orderId: string;
  customer: string;
  plan: string;
  server: string;
  paymentMethod: string;
  paymentDate: string;
  nextTitle: string;
  nextBody: string;
  supportBody: string;
  cta: string;
  footer: string;
  textConfirmed: string;
  textBilling: string;
  textSupport: string;
}> = {
  en: {
    badge: "Receipt",
    subject: "Purchase receipt",
    title: "Your order is now inside Cloudsting.",
    intro: "We have confirmed your purchase successfully. Here is the order summary and a direct link to the billing section of your account.",
    totalCharged: "Total charged",
    paid: "Paid",
    orderId: "Order ID",
    customer: "Customer",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Payment method",
    paymentDate: "Payment date",
    nextTitle: "What happens next",
    nextBody: "You can now open your panel, review billing, and follow the state of your infrastructure without losing context. Everything important remains visible in this receipt and in your client area.",
    supportBody: "If you need support, sign in to your account and open a ticket from Cloudsting so your order, billing, and server stay linked in the same flow.",
    cta: "Open billing",
    footer: "Low-latency infrastructure for serious Minecraft communities.",
    textConfirmed: "Your purchase has been confirmed.",
    textBilling: "Billing",
    textSupport: "If you need support, reply to this email or contact the team from the website.",
  },
  es: {
    badge: "Recibo",
    subject: "Recibo de compra",
    title: "Tu pedido ya esta dentro de Cloudsting.",
    intro: "Hemos confirmado tu compra correctamente. Aqui tienes el resumen del pedido y el acceso directo a la seccion de facturacion de tu cuenta.",
    totalCharged: "Total cobrado",
    paid: "Pagado",
    orderId: "Pedido",
    customer: "Cliente",
    plan: "Plan",
    server: "Servidor",
    paymentMethod: "Metodo de pago",
    paymentDate: "Fecha de pago",
    nextTitle: "Que pasa ahora",
    nextBody: "Ya puedes entrar a tu panel, revisar la facturacion y seguir el estado de tu infraestructura sin perder contexto. Todo el detalle importante queda visible en este recibo y en tu area de cliente.",
    supportBody: "Si necesitas soporte, entra en tu cuenta y abre ticket desde Cloudsting. Asi mantienes pedido, facturacion y servidor unidos en el mismo flujo.",
    cta: "Abrir facturacion",
    footer: "Infraestructura de baja latencia para comunidades serias de Minecraft.",
    textConfirmed: "Tu compra ha sido confirmada.",
    textBilling: "Facturacion",
    textSupport: "Si necesitas soporte, responde a este correo o contacta con el equipo desde la web.",
  },
  fr: {
    badge: "Recu",
    subject: "Recu d'achat",
    title: "Votre commande est maintenant chez Cloudsting.",
    intro: "Nous avons bien confirme votre achat. Voici le resume de la commande ainsi qu'un acces direct a la section facturation de votre compte.",
    totalCharged: "Total facture",
    paid: "Paye",
    orderId: "Commande",
    customer: "Client",
    plan: "Offre",
    server: "Serveur",
    paymentMethod: "Methode de paiement",
    paymentDate: "Date de paiement",
    nextTitle: "La suite",
    nextBody: "Vous pouvez maintenant ouvrir votre panel, consulter la facturation et suivre l'etat de votre infrastructure sans perdre le contexte. Tout l'essentiel reste visible dans ce recu et dans votre espace client.",
    supportBody: "Si vous avez besoin d'aide, connectez-vous a votre compte et ouvrez un ticket depuis Cloudsting afin de garder commande, facturation et serveur relies.",
    cta: "Ouvrir la facturation",
    footer: "Infrastructure faible latence pour les communautes Minecraft serieuses.",
    textConfirmed: "Votre achat a ete confirme.",
    textBilling: "Facturation",
    textSupport: "Si vous avez besoin d'aide, repondez a cet email ou contactez l'equipe depuis le site.",
  },
  de: {
    badge: "Beleg",
    subject: "Kaufbeleg",
    title: "Deine Bestellung ist jetzt bei Cloudsting aktiv.",
    intro: "Dein Kauf wurde erfolgreich bestatigt. Hier findest du die Bestellubersicht und den direkten Zugriff auf den Abrechnungsbereich deines Kontos.",
    totalCharged: "Gesamtbetrag",
    paid: "Bezahlt",
    orderId: "Bestellung",
    customer: "Kunde",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Zahlungsmethode",
    paymentDate: "Zahlungsdatum",
    nextTitle: "Wie es weitergeht",
    nextBody: "Du kannst jetzt dein Panel offnen, die Abrechnung prufen und den Status deiner Infrastruktur verfolgen. Alle wichtigen Details bleiben in diesem Beleg und in deinem Kundenbereich sichtbar.",
    supportBody: "Wenn du Support brauchst, melde dich in deinem Konto an und eroffne ein Ticket in Cloudsting, damit Bestellung, Abrechnung und Server im selben Ablauf verbunden bleiben.",
    cta: "Abrechnung offnen",
    footer: "Niedrig latente Infrastruktur fur ernsthafte Minecraft-Communitys.",
    textConfirmed: "Dein Kauf wurde bestatigt.",
    textBilling: "Abrechnung",
    textSupport: "Wenn du Support brauchst, antworte auf diese E-Mail oder kontaktiere das Team uber die Website.",
  },
  pt: {
    badge: "Recibo",
    subject: "Recibo de compra",
    title: "A tua encomenda ja esta na Cloudsting.",
    intro: "Confirmamos a tua compra com sucesso. Aqui tens o resumo da encomenda e o acesso direto a area de faturacao da tua conta.",
    totalCharged: "Total cobrado",
    paid: "Pago",
    orderId: "Encomenda",
    customer: "Cliente",
    plan: "Plano",
    server: "Servidor",
    paymentMethod: "Metodo de pagamento",
    paymentDate: "Data de pagamento",
    nextTitle: "O que acontece a seguir",
    nextBody: "Ja podes abrir o painel, rever a faturacao e acompanhar o estado da tua infraestrutura sem perder contexto. Tudo o que importa fica visivel neste recibo e na tua area de cliente.",
    supportBody: "Se precisares de suporte, entra na tua conta e abre ticket pela Cloudsting para manter encomenda, faturacao e servidor ligados no mesmo fluxo.",
    cta: "Abrir faturacao",
    footer: "Infraestrutura de baixa latencia para comunidades Minecraft a serio.",
    textConfirmed: "A tua compra foi confirmada.",
    textBilling: "Faturacao",
    textSupport: "Se precisares de suporte, responde a este email ou contacta a equipa pelo site.",
  },
  it: {
    badge: "Ricevuta",
    subject: "Ricevuta di acquisto",
    title: "Il tuo ordine e ora dentro Cloudsting.",
    intro: "Abbiamo confermato correttamente il tuo acquisto. Qui trovi il riepilogo dell'ordine e l'accesso diretto alla sezione fatturazione del tuo account.",
    totalCharged: "Totale addebitato",
    paid: "Pagato",
    orderId: "Ordine",
    customer: "Cliente",
    plan: "Piano",
    server: "Server",
    paymentMethod: "Metodo di pagamento",
    paymentDate: "Data di pagamento",
    nextTitle: "Cosa succede ora",
    nextBody: "Ora puoi aprire il pannello, controllare la fatturazione e seguire lo stato della tua infrastruttura senza perdere il contesto. Tutto il necessario resta visibile in questa ricevuta e nella tua area cliente.",
    supportBody: "Se hai bisogno di supporto, accedi al tuo account e apri un ticket da Cloudsting cosi ordine, fatturazione e server restano collegati nello stesso flusso.",
    cta: "Apri fatturazione",
    footer: "Infrastruttura a bassa latenza per comunita Minecraft serie.",
    textConfirmed: "Il tuo acquisto e stato confermato.",
    textBilling: "Fatturazione",
    textSupport: "Se hai bisogno di supporto, rispondi a questa email o contatta il team dal sito.",
  },
  nl: {
    badge: "Ontvangstbewijs",
    subject: "Aankoopbewijs",
    title: "Je bestelling staat nu in Cloudsting.",
    intro: "Je aankoop is succesvol bevestigd. Hier vind je het besteloverzicht en directe toegang tot het facturatiegedeelte van je account.",
    totalCharged: "Totaal betaald",
    paid: "Betaald",
    orderId: "Bestelling",
    customer: "Klant",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Betaalmethode",
    paymentDate: "Betaald op",
    nextTitle: "Wat gebeurt er nu",
    nextBody: "Je kunt nu je paneel openen, je facturatie bekijken en de status van je infrastructuur volgen zonder context te verliezen. Alles wat belangrijk is blijft zichtbaar in dit aankoopbewijs en in je klantomgeving.",
    supportBody: "Heb je ondersteuning nodig, log dan in op je account en open een ticket vanuit Cloudsting zodat bestelling, facturatie en server aan elkaar gekoppeld blijven.",
    cta: "Facturatie openen",
    footer: "Infrastructuur met lage latency voor serieuze Minecraft-community's.",
    textConfirmed: "Je aankoop is bevestigd.",
    textBilling: "Facturatie",
    textSupport: "Als je ondersteuning nodig hebt, beantwoord dan deze e-mail of neem contact op via de website.",
  },
  ru: {
    badge: "Receipt",
    subject: "Purchase receipt",
    title: "Vash zakaz teper v Cloudsting.",
    intro: "My uspeshno podtverdili vashu pokupku. Nizhe ukazan svodnyj itog zakaza i pryamaya ssylka na razdel billing v vashem akkaunte.",
    totalCharged: "Spisano vsego",
    paid: "Oplacheno",
    orderId: "Zakaz",
    customer: "Klient",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Sposob oplaty",
    paymentDate: "Data oplaty",
    nextTitle: "Chto dalshe",
    nextBody: "Teper vy mozhete otkryt panel, proverit billing i sledit za sostoyaniem infrastruktury bez poteri konteksta. Vse vazhnoe ostaetsya v etom recheke i v lichnom kabinete.",
    supportBody: "Esli nuzhna podderzhka, vojdite v akkaunt i otkrojte tiket iz Cloudsting, chtoby zakaz, billing i server ostavalis svyazany v odnom potoke.",
    cta: "Otkryt billing",
    footer: "Nizkaya zaderzhka infrastruktury dlya serjoznyh Minecraft-soobshchestv.",
    textConfirmed: "Vasha pokupka podtverzhdena.",
    textBilling: "Billing",
    textSupport: "Esli nuzhna podderzhka, otvette na eto pismo ili svyazhites s komandoy cherez sayt.",
  },
  pl: {
    badge: "Potwierdzenie",
    subject: "Potwierdzenie zakupu",
    title: "Twoje zamowienie jest juz w Cloudsting.",
    intro: "Pomyslnie potwierdzilismy Twoj zakup. Ponizej znajdziesz podsumowanie zamowienia oraz bezposredni dostep do sekcji rozliczen na koncie.",
    totalCharged: "Lacznie pobrano",
    paid: "Oplacono",
    orderId: "Zamowienie",
    customer: "Klient",
    plan: "Plan",
    server: "Serwer",
    paymentMethod: "Metoda platnosci",
    paymentDate: "Data platnosci",
    nextTitle: "Co dalej",
    nextBody: "Mozesz teraz otworzyc panel, sprawdzic rozliczenia i sledzic stan infrastruktury bez utraty kontekstu. Wszystko co wazne pozostaje widoczne w tym potwierdzeniu i w panelu klienta.",
    supportBody: "Jesli potrzebujesz wsparcia, zaloguj sie do konta i otworz ticket w Cloudsting, aby zamowienie, rozliczenia i serwer pozostaly polaczone w jednym przeplywie.",
    cta: "Otworz rozliczenia",
    footer: "Niskie opoznienia dla powaznych spolecznosci Minecraft.",
    textConfirmed: "Twoj zakup zostal potwierdzony.",
    textBilling: "Rozliczenia",
    textSupport: "Jesli potrzebujesz wsparcia, odpowiedz na ten email lub skontaktuj sie z zespolem przez strone.",
  },
  cs: {
    badge: "Doklad",
    subject: "Doklad o nakupu",
    title: "Tvoje objednavka je ted v Cloudsting.",
    intro: "Tvuj nakup jsme uspesne potvrdili. Tady je shrnuti objednavky a primy pristup do sekce fakturace tveho uctu.",
    totalCharged: "Celkove uctovano",
    paid: "Zaplaceno",
    orderId: "Objednavka",
    customer: "Zakaznik",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Platebni metoda",
    paymentDate: "Datum platby",
    nextTitle: "Co bude dal",
    nextBody: "Ted muzes otevrit panel, zkontrolovat fakturaci a sledovat stav infrastruktury bez ztraty kontextu. Vse dulezite zustava viditelne v tomto dokladu i v zakaznicke zone.",
    supportBody: "Pokud potrebujes podporu, prihlas se do uctu a otevri ticket v Cloudsting, aby objednavka, fakturace i server zustaly spojene v jednom toku.",
    cta: "Otevrit fakturaci",
    footer: "Nizkolatencni infrastruktura pro vazne Minecraft komunity.",
    textConfirmed: "Tvuj nakup byl potvrzen.",
    textBilling: "Fakturace",
    textSupport: "Pokud potrebujes podporu, odpovez na tento email nebo kontaktuj tym pres web.",
  },
  hi: {
    badge: "Receipt",
    subject: "Purchase receipt",
    title: "Aapka order ab Cloudsting me active hai.",
    intro: "Aapki kharidari safalta se confirm ho chuki hai. Yahan order summary aur aapke account ke billing section ka direct link diya gaya hai.",
    totalCharged: "Total charged",
    paid: "Paid",
    orderId: "Order ID",
    customer: "Customer",
    plan: "Plan",
    server: "Server",
    paymentMethod: "Payment method",
    paymentDate: "Payment date",
    nextTitle: "What happens next",
    nextBody: "Ab aap panel khol sakte hain, billing dekh sakte hain aur apni infrastructure ki state track kar sakte hain. Zaruri details is receipt aur aapke client area dono me dikhengi.",
    supportBody: "Agar support chahiye ho to apne account me sign in karke Cloudsting se ticket kholen, taki order, billing aur server ek hi flow me jude rahen.",
    cta: "Open billing",
    footer: "Serious Minecraft communities ke liye low-latency infrastructure.",
    textConfirmed: "Aapki kharidari confirm ho chuki hai.",
    textBilling: "Billing",
    textSupport: "Agar support chahiye ho to is email ka reply karein ya website se team se sampark karein.",
  },
  tr: {
    badge: "Makbuz",
    subject: "Satin alma makbuzu",
    title: "Siparisin artik Cloudsting icinde.",
    intro: "Satin alman basariyla onaylandi. Burada siparis ozeti ve hesabindaki faturalandirma bolumune dogrudan erisim bulunuyor.",
    totalCharged: "Toplam tahsilat",
    paid: "Odendi",
    orderId: "Siparis",
    customer: "Musteri",
    plan: "Plan",
    server: "Sunucu",
    paymentMethod: "Odeme yontemi",
    paymentDate: "Odeme tarihi",
    nextTitle: "Simdi ne olacak",
    nextBody: "Artik paneli acabilir, faturalandirmayi inceleyebilir ve altyapinin durumunu baglam kaybetmeden takip edebilirsin. Tum onemli detaylar bu makbuzda ve musteri alaninda gorunur kalir.",
    supportBody: "Destek gerekiyorsa hesabina girip Cloudsting uzerinden ticket ac. Boylece siparis, faturalandirma ve sunucu ayni akis icinde bagli kalir.",
    cta: "Faturalandirmayi ac",
    footer: "Ciddi Minecraft topluluklari icin dusuk gecikmeli altyapi.",
    textConfirmed: "Satin alman onaylandi.",
    textBilling: "Faturalandirma",
    textSupport: "Destek gerekiyorsa bu e-postayi yanitla veya ekip ile site uzerinden iletisime gec.",
  },
};

const PROVIDER_LABELS: Record<LangCode, Record<OrderReceiptEmailInput["provider"], string>> = {
  en: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Wallet" },
  es: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Saldo" },
  fr: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Portefeuille" },
  de: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Guthaben" },
  pt: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Carteira" },
  it: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Portafoglio" },
  nl: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Wallet" },
  ru: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Koshelek" },
  pl: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Portfel" },
  cs: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Penezenka" },
  hi: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Wallet" },
  tr: { STRIPE: "Stripe", PAYPAL: "PayPal", WALLET: "Cuzdan" },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderPanelAccessEmail(input: PanelAccessEmailInput) {
  const copy = PANEL_ACCESS_COPY[input.lang] ?? PANEL_ACCESS_COPY.en;
  const brand = input.brandName;
  const panelUrl = input.panelUrl;
  const email = input.email;
  const tempPassword = input.temporaryPassword;

  const subject = `${brand} — ${copy.subject}`;

  const text = [
    `${brand} — ${copy.subject}`,
    "",
    copy.title,
    "",
    copy.body,
    "",
    `${copy.panelLabel}: ${panelUrl}`,
    `${copy.emailLabel}: ${email}`,
    `${copy.passwordLabel}: ${tempPassword}`,
    "",
    copy.security,
    copy.ignore,
  ].join("\n");

  const safeBrand = escapeHtml(brand);
  const safePanelUrl = escapeHtml(panelUrl);
  const safeEmail = escapeHtml(email);
  const safeTempPassword = escapeHtml(tempPassword);

  const html = `
  <div style="margin:0;padding:0;background:#0b1220;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0b1220;">
      <tr>
        <td style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:600px;margin:0 auto;">
            <tr>
              <td style="padding:0 0 16px 0;color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                <div style="font-weight:800;font-size:20px;letter-spacing:-0.02em;">${safeBrand}</div>
                <div style="color:#9ca3af;font-size:13px;margin-top:6px;">${escapeHtml(copy.preheader)}</div>
              </td>
            </tr>

            <tr>
              <td style="background:#0f172a;border:1px solid #1f2937;border-radius:16px;padding:20px 20px 18px 20px;">
                <div style="color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                  <div style="font-size:16px;font-weight:700;margin:0 0 10px 0;">${escapeHtml(copy.title)}</div>
                  <div style="font-size:13px;line-height:1.6;color:#cbd5e1;margin:0 0 14px 0;">
                    ${escapeHtml(copy.body)}
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:12px 0 14px 0;">
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">${escapeHtml(copy.panelLabel)}</div>
                        <div style="font-size:13px;font-weight:600;color:#e5e7eb;word-break:break-all;">${safePanelUrl}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">${escapeHtml(copy.emailLabel)}</div>
                        <div style="font-size:13px;font-weight:600;color:#e5e7eb;">${safeEmail}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;">
                        <div style="font-size:12px;color:#9ca3af;">${escapeHtml(copy.passwordLabel)}</div>
                        <div style="font-size:13px;font-weight:700;color:#e5e7eb;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeTempPassword}</div>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 14px 0;">
                    <tr>
                      <td style="background:#22c55e;border-radius:12px;">
                        <a href="${safePanelUrl}" style="display:inline-block;padding:10px 14px;color:#052e16;text-decoration:none;font-weight:800;font-size:13px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">${escapeHtml(copy.button)}</a>
                      </td>
                    </tr>
                  </table>

                  <div style="font-size:12px;line-height:1.6;color:#9ca3af;">
                    ${escapeHtml(copy.security)}
                    ${escapeHtml(copy.ignore)}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px;color:#6b7280;font-size:11px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                © ${new Date().getFullYear()} ${safeBrand}. ${escapeHtml(copy.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return { subject, text, html };
}

export function renderOrderReceiptEmail(input: OrderReceiptEmailInput) {
  const copy = RECEIPT_COPY[input.lang] ?? RECEIPT_COPY.en;
  const locale = EMAIL_LOCALES[input.lang] ?? EMAIL_LOCALES.en;
  const brand = input.brandName;
  const dashboardUrl = `${input.appUrl.replace(/\/$/, "")}/billing`;
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(input.amountCents / 100);
  const paidAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input.paidAt);
  const providerLabel = PROVIDER_LABELS[input.lang]?.[input.provider] ?? PROVIDER_LABELS.en[input.provider];

  const subject = `${brand} — ${copy.subject}`;

  const text = [
    `${brand} — ${copy.subject}`,
    "",
    copy.textConfirmed,
    "",
    `${copy.orderId}: ${input.orderId}`,
    `${copy.customer}: ${input.customerEmail}`,
    `${copy.plan}: ${input.planName}`,
    `${copy.server}: ${input.serverName}`,
    `${copy.paymentMethod}: ${providerLabel}`,
    `${copy.totalCharged}: ${amount}`,
    `${copy.paymentDate}: ${paidAt}`,
    `${copy.textBilling}: ${dashboardUrl}`,
    "",
    copy.textSupport,
  ].join("\n");

  const safeBrand = escapeHtml(brand);
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const safeOrderId = escapeHtml(input.orderId);
  const safeCustomerEmail = escapeHtml(input.customerEmail);
  const safePlanName = escapeHtml(input.planName);
  const safeServerName = escapeHtml(input.serverName);
  const safeProvider = escapeHtml(providerLabel);
  const safeAmount = escapeHtml(amount);
  const safePaidAt = escapeHtml(paidAt);

  const html = `
  <div style="margin:0;padding:0;background:#050708;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:
      radial-gradient(1100px circle at 10% -10%, rgba(89,255,168,0.16), transparent 45%),
      radial-gradient(820px circle at 100% 0%, rgba(255,255,255,0.05), transparent 40%),
      linear-gradient(180deg, #050708 0%, #060909 100%);">
      <tr>
        <td style="padding:28px 12px 40px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;max-width:720px;margin:0 auto;border-spacing:0;">
            <tr>
              <td style="padding:0 0 16px 0;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;color:#effff6;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="display:inline-flex;align-items:center;gap:12px;">
                        <span style="display:inline-block;width:14px;height:14px;border-radius:999px;background:#59ffa8;box-shadow:0 0 0 8px rgba(89,255,168,0.10),0 0 24px rgba(89,255,168,0.36);"></span>
                        <span style="font-family:'Oxanium','Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:26px;font-weight:800;letter-spacing:0.01em;">${safeBrand}</span>
                      </div>
                    </td>
                    <td style="vertical-align:middle;text-align:right;">
                      <div style="display:inline-block;border:1px solid rgba(255,255,255,0.08);border-radius:999px;background:rgba(255,255,255,0.03);padding:9px 14px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(225,255,238,0.78);">
                        ${escapeHtml(copy.badge)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid rgba(255,255,255,0.08);border-radius:34px;overflow:hidden;background:linear-gradient(180deg, rgba(13,18,18,0.96), rgba(8,10,10,0.985));box-shadow:0 26px 84px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.05);">
                <div style="background:
                  radial-gradient(560px circle at 0% 0%, rgba(89,255,168,0.16), transparent 50%),
                  linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0));">

                  <div style="padding:30px 30px 24px 30px;border-bottom:1px solid rgba(255,255,255,0.07);font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:top;padding-right:18px;">
                          <div style="font-family:'Oxanium','Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:34px;line-height:1.02;font-weight:800;letter-spacing:-0.03em;color:#f6fff9;max-width:420px;">
                            ${escapeHtml(copy.title)}
                          </div>
                          <div style="margin-top:14px;max-width:470px;font-size:14px;line-height:1.8;color:rgba(227,241,235,0.72);">
                            ${escapeHtml(copy.intro)}
                          </div>
                        </td>
                        <td style="width:220px;vertical-align:top;">
                          <div style="border:1px solid rgba(89,255,168,0.18);border-radius:28px;background:linear-gradient(180deg, rgba(89,255,168,0.14), rgba(89,255,168,0.03));padding:20px 18px 18px 18px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                            <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(217,255,235,0.74);">${escapeHtml(copy.totalCharged)}</div>
                            <div style="margin-top:12px;font-family:'Oxanium','Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:34px;line-height:1;font-weight:800;color:#59ffa8;">${safeAmount}</div>
                            <div style="margin-top:10px;font-size:13px;line-height:1.6;color:rgba(223,255,238,0.74);">${safeProvider}</div>
                            <div style="margin-top:12px;display:inline-block;border-radius:999px;background:#0d2017;border:1px solid rgba(89,255,168,0.14);padding:7px 11px;font-size:11px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#8af4c4;">${escapeHtml(copy.paid)}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="padding:22px 30px 0 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 14px;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;">
                      <tr>
                        <td style="padding-right:10px;vertical-align:top;">
                          <div style="height:100%;border:1px solid rgba(255,255,255,0.07);border-radius:24px;background:rgba(255,255,255,0.025);padding:18px 18px 16px 18px;">
                            <div style="font-size:11px;color:rgba(213,228,221,0.56);font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(copy.orderId)}</div>
                            <div style="margin-top:10px;font-size:14px;line-height:1.7;font-weight:700;color:#f5fff9;word-break:break-all;">${safeOrderId}</div>
                          </div>
                        </td>
                        <td style="padding-left:10px;vertical-align:top;">
                          <div style="height:100%;border:1px solid rgba(255,255,255,0.07);border-radius:24px;background:rgba(255,255,255,0.025);padding:18px 18px 16px 18px;">
                            <div style="font-size:11px;color:rgba(213,228,221,0.56);font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(copy.customer)}</div>
                            <div style="margin-top:10px;font-size:14px;line-height:1.7;font-weight:700;color:#f5fff9;word-break:break-word;">${safeCustomerEmail}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="padding:0 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 14px;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;">
                      <tr>
                        <td style="padding-right:10px;vertical-align:top;">
                          <div style="height:100%;border:1px solid rgba(255,255,255,0.07);border-radius:24px;background:rgba(255,255,255,0.025);padding:18px 18px 16px 18px;">
                            <div style="font-size:11px;color:rgba(213,228,221,0.56);font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(copy.plan)}</div>
                            <div style="margin-top:10px;font-size:16px;line-height:1.5;font-weight:800;color:#f5fff9;">${safePlanName}</div>
                          </div>
                        </td>
                        <td style="padding-left:10px;vertical-align:top;">
                          <div style="height:100%;border:1px solid rgba(255,255,255,0.07);border-radius:24px;background:rgba(255,255,255,0.025);padding:18px 18px 16px 18px;">
                            <div style="font-size:11px;color:rgba(213,228,221,0.56);font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(copy.server)}</div>
                            <div style="margin-top:10px;font-size:16px;line-height:1.5;font-weight:800;color:#f5fff9;">${safeServerName}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="padding:0 30px;">
                    <div style="border:1px solid rgba(255,255,255,0.07);border-radius:28px;background:linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.018));padding:8px 0;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(210,226,219,0.56);">${escapeHtml(copy.paymentMethod)}</td>
                          <td style="padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:700;color:#f4fff8;text-align:right;">${safeProvider}</td>
                        </tr>
                        <tr>
                          <td style="padding:16px 22px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(210,226,219,0.56);">${escapeHtml(copy.paymentDate)}</td>
                          <td style="padding:16px 22px;font-size:14px;font-weight:700;color:#f4fff8;text-align:right;">${safePaidAt}</td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <div style="padding:20px 30px 0 30px;">
                    <div style="border:1px solid rgba(89,255,168,0.14);border-radius:26px;background:linear-gradient(90deg, rgba(89,255,168,0.10), rgba(89,255,168,0.025));padding:18px 20px;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(218,255,234,0.72);">${escapeHtml(copy.nextTitle)}</div>
                      <div style="margin-top:10px;font-size:13px;line-height:1.8;color:rgba(228,244,237,0.78);">
                        ${escapeHtml(copy.nextBody)}
                      </div>
                    </div>
                  </div>

                  <div style="padding:22px 30px 30px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:middle;padding-right:16px;">
                          <div style="font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.8;color:rgba(205,220,214,0.60);max-width:360px;">
                            ${escapeHtml(copy.supportBody)}
                          </div>
                        </td>
                        <td style="vertical-align:middle;text-align:right;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;display:inline-table;">
                            <tr>
                              <td style="background:#59ffa8;border-radius:18px;box-shadow:0 16px 34px rgba(89,255,168,0.22);">
                                <a href="${safeDashboardUrl}" style="display:inline-block;padding:15px 20px;color:#03160d;text-decoration:none;font-family:'Oxanium','Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-weight:800;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">${escapeHtml(copy.cta)}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 6px 0 6px;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:11px;line-height:1.7;color:rgba(186,201,194,0.44);letter-spacing:0.04em;text-transform:uppercase;">
                © ${new Date().getFullYear()} ${safeBrand}. ${escapeHtml(copy.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return { subject, text, html };
}
