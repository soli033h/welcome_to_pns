export const homepage = {
  ui: {
    externalLink: "↗",
    discover: "↓",
  },
  header: {
    navigationLabel: "Main navigation",
    mobileNavigationLabel: "Mobile navigation",
    brandLabel: (name: string) => `${name} home`,
    cta: "Start a project",
    menuLabel: "Open menu",
  },
  hero: {
    eyebrow: "Independent creative company / 2025",
    coordinates: ['37° 33\' 59.7" N', "126° 58' 41.5\" E"],
    discoverLabel: "Discover PNS",
    scrollLabel: "Scroll to explore",
    progress: "01 / 05",
  },
  about: {
    eyebrow: "About PNS / 02",
    heading: {
      lead: "Good work starts",
      emphasis: "with a point of view.",
    },
    statement: "우리는 브랜드가 세상과 만나는 방식을 새롭게 정의합니다.",
    description:
      "전략, 디자인, 기술의 경계를 넘나들며 사람의 행동을 바꾸는 경험을 만듭니다. 작지만 날카로운 팀으로, 각 프로젝트에 가장 깊이 관여합니다.",
    servicesLabel: "What we do",
    principlesLabel: "Our principles",
    principlesProgress: "03 / 03",
  },
  work: {
    eyebrow: "Selected work / 03",
    heading: {
      lead: "A few things",
      emphasis: "we've shaped.",
    },
    note: ["Different questions.", "One common thread."],
    imageViewLabel: (client: string, imageIndex: number) =>
      `${client} project view ${imageIndex + 1}`,
    imageViewsLabel: (client: string) => `${client} image views`,
    showImageLabel: (imageIndex: number) => `Show image ${imageIndex + 1}`,
  },
  contact: {
    eyebrow: "Let's make something / 05",
    heading: {
      lead: "Have a good",
      emphasis: "question?",
    },
    description: "새로운 프로젝트, 브랜드에 대한 고민, 아직 이름 붙이지 못한 아이디어까지 편하게 이야기해주세요.",
    honeypotLabel: "Don't fill this out:",
    fields: {
      name: {
        label: "Your name",
        placeholder: "이름을 입력해주세요",
      },
      email: {
        label: "Email address",
        placeholder: "hello@example.com",
      },
      message: {
        label: "Tell us a little",
        placeholder: "프로젝트에 대해 알려주세요",
      },
    },
    submit: "Send inquiry",
    formNote: "보내주신 내용은 프로젝트 검토를 위해서만 사용됩니다.",
  },
  visit: {
    eyebrow: "Come by / 04",
    heading: {
      lead: "Find your way",
      emphasis: "to us.",
    },
    description: "지도 위를 움직여 주변을 천천히 살펴보세요.",
    mapLabel: "map of PNS in Seoul",
    mapHint: "Drag to explore",
    zoomInLabel: "Zoom in",
    zoomOutLabel: "Zoom out",
    resetLabel: "Reset map view",
    controlsLabel: "Map controls",
    markerLabel: "PNS studio location",
    directions: "Open in maps",
    placeLabel: "PNS Creative Company",
    transitLabel: "Seoul / Korea",
    details: {
      studio: "Studio",
      coordinates: "Coordinates",
      contact: "Say hello",
    },
    mapLabels: ["JONGNO", "EULJIRO", "HANNAM"],
  },
  footer: {
    tagline: ["Ideas with", "a pulse."],
    socialLinks: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },
} as const;
