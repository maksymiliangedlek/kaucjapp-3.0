import { AppRole } from "@/src/types/user";

export const productOnboardingCopy = {
  roleSelect: {
    title: "Co chcesz robić w aplikacji?",
    subtitle: "Wybierz, jak najczęściej będziesz korzystać z KaucjApp.",
    options: {
      OFFERER: {
        title: "Wystawiam opakowania",
        subtitle: "Oddaję butelki i puszki komuś z okolicy",
      },
      COLLECTOR: {
        title: "Odbieram opakowania",
        subtitle: "Zbieram oferty i zawożę je do kaucjomatu",
      },
      BOTH: {
        title: "Jedno i drugie",
        subtitle: "Czasem wystawiam, czasem odbieram",
      },
    },
  },
  cta: {
    next: "Dalej",
    skip: "Pomiń",
    start: "Zaczynam",
    close: "Zamknij",
  },
  a11y: {
    stepOf: (current: number, total: number) => `Krok ${current} z ${total}`,
    back: "Wstecz",
    selected: "Wybrane",
  },
  transition: {
    title: "Teraz druga strona",
    body: "Tak samo możesz odbierać oferty innych osób w okolicy.",
  },
  parts: {
    part1: "Część 1",
    part2: "Część 2",
  },
  faq: {
    sectionTitle: "Jak wygląda przebieg",
    sectionSubtitle: "Odśwież przewodnik dla wybranej roli",
    options: {
      OFFERER: {
        title: "Wystawiający",
        subtitle: "Od wystawienia oferty do potwierdzenia odbioru",
      },
      COLLECTOR: {
        title: "Odbierający",
        subtitle: "Od mapy i rezerwacji do historii wymian",
      },
      BOTH: {
        title: "Jedno i drugie",
        subtitle: "Pełny przebieg z obu perspektyw",
      },
    },
  },
  settings: {
    appRoleTitle: "Jak korzystasz z aplikacji?",
    appRoleHint: "Ustawia domyślny ekran startowy po zalogowaniu.",
  },
  steps: {
    A1: {
      title: "Wystaw ofertę w minutę",
      body: "Podaj ilość opakowań, lokalizację odbioru i opublikuj. Oferta od razu pojawia się jako otwarta.",
    },
    A2: {
      title: "Ktoś rezerwuje Twoją ofertę",
      body: "Widzisz kuriera, możesz napisać na czacie i umówić odbiór. Rezerwacja trwa około 2 godzin.",
    },
    A3: {
      title: "Spotkajcie się i przekażcie opakowania",
      body: "Kurier przyjeżdża pod wskazany adres. Ustalcie szczegóły w czacie, jeśli coś się zmienia.",
    },
    A4: {
      title: "Potwierdź odbiór",
      body: "Obie strony potwierdzają przekazanie. Oferta trafia do historii jako zakończona.",
    },
    B1: {
      title: "Znajdź oferty w okolicy",
      body: "Na mapie widać otwarte oferty w pobliżu. Wybierz tę, którą chcesz odebrać.",
    },
    B2: {
      title: "Zarezerwuj jednym przesunięciem",
      body: "Przesuń suwak, aby zarezerwować. Oferta znika z mapy dla innych na czas Twojej rezerwacji.",
    },
    B3: {
      title: "Umów się i odbierz",
      body: "Napisz do wystawiającego, dojedź pod adres i przejmij opakowania.",
    },
    B4: {
      title: "Potwierdź i zapisz w historii",
      body: "Po wzajemnym potwierdzeniu wymiana ląduje w statystykach i historii rezerwacji.",
    },
  },
} as const;

export type GuideStepId =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "transition";

export const ROLE_ORDER: AppRole[] = ["OFFERER", "COLLECTOR", "BOTH"];
