// Static data for the site. In production, this comes from a database.

export const SESSION_TYPES = [
  {
    id: "one-to-one",
    name: "1-to-1 Session",
    duration: 60,
    price: 50,
    maxParticipants: 1,
    description:
      "Intensive one-on-one coaching focused entirely on your individual development. Personalised drills, video analysis, and direct feedback.",
    features: [
      "Personalised training plan",
      "Real-time video analysis",
      "Performance tracking",
      "Direct coach feedback",
    ],
    icon: "user",
  },
  {
    id: "small-group",
    name: "Small Group",
    duration: 90,
    price: 30,
    maxParticipants: 4,
    description:
      "Train with a small group of 2-4 players in a dynamic, competitive environment. Perfect for friends or teammates.",
    features: [
      "Competitive drills",
      "Match-realistic scenarios",
      "Team dynamics",
      "Peer learning",
    ],
    icon: "users",
  },
  {
    id: "assessment",
    name: "Skills Assessment",
    duration: 45,
    price: 40,
    maxParticipants: 1,
    description:
      "Comprehensive skills evaluation with a detailed written report covering technique, fitness, and tactical awareness.",
    features: [
      "Technical evaluation",
      "Strengths & weaknesses report",
      "Development roadmap",
      "Written PDF report",
    ],
    icon: "clipboard",
  },
  {
    id: "camp",
    name: "Training Camp",
    duration: 0,
    price: 300,
    maxParticipants: 20,
    description:
      "Intensive multi-day camps during school holidays. Full-day sessions, tournament play, guest coaches, and certificates.",
    features: [
      "Full-day sessions",
      "Tournament play",
      "Guest coaches",
      "Certificate of completion",
    ],
    icon: "calendar",
  },
] as const;

export const PACKAGES = [
  {
    id: "six-week",
    name: "6-Week Package",
    sessions: 6,
    pricePerSession: 50,
    totalPrice: 270,
    savings: 30,
    discountPct: 10,
    description:
      "Train consistently with weekly sessions. Same day and time each week, with flexibility for rescheduling.",
    features: [
      "10% discount on session price",
      "Same weekly slot reserved",
      "Free rescheduling (24h notice)",
      "Progress tracking dashboard",
      "Priority booking",
    ],
    popular: false,
  },
  {
    id: "ten-week",
    name: "10-Week Package",
    sessions: 10,
    pricePerSession: 50,
    totalPrice: 425,
    savings: 75,
    discountPct: 15,
    description:
      "Our best value package. Commit to 10 weeks of focused training and see real, measurable improvement.",
    features: [
      "15% discount on session price",
      "Same weekly slot reserved",
      "Free rescheduling (24h notice)",
      "Progress tracking dashboard",
      "Priority booking",
      "1 free skills assessment included",
      "End-of-programme report",
    ],
    popular: true,
  },
] as const;

export const EVENTS = [
  {
    id: "summer-camp-2024",
    title: "Summer Training Camp",
    date: "15 - 19 July 2024",
    location: "City Sports Complex, London",
    capacity: 20,
    spotsLeft: 8,
    price: 350,
    image: "/images/camp-placeholder.jpg",
    description:
      "5-day intensive training camp covering technical skills, tactical awareness, physical conditioning, and match play. Open to players aged 8-16.",
  },
  {
    id: "elite-workshop",
    title: "Elite Skills Workshop",
    date: "5 - 6 August 2024",
    location: "Elite Training Ground, London",
    capacity: 15,
    spotsLeft: 5,
    price: 200,
    image: "/images/workshop-placeholder.jpg",
    description:
      "2-day advanced workshop for committed players looking to refine their technique, improve decision-making, and train at an elite level.",
  },
  {
    id: "half-term-camp",
    title: "Half-Term Mini Camp",
    date: "28 - 30 October 2024",
    location: "Community Pitch, London",
    capacity: 24,
    spotsLeft: 18,
    price: 180,
    image: "/images/minicamp-placeholder.jpg",
    description:
      "3-day camp designed for younger players. Fun, engaging sessions that build confidence and fundamental skills in a supportive environment.",
  },
] as const;

export const WORKING_HOURS = [
  { day: "Monday", hours: "09:00 - 18:00" },
  { day: "Tuesday", hours: "09:00 - 18:00" },
  { day: "Wednesday", hours: "09:00 - 18:00" },
  { day: "Thursday", hours: "09:00 - 18:00" },
  { day: "Friday", hours: "09:00 - 18:00" },
  { day: "Saturday", hours: "09:00 - 15:00" },
  { day: "Sunday", hours: "Closed" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export const TESTIMONIALS = [
  {
    name: "James P.",
    role: "Academy Player, Age 14",
    quote:
      "Gus helped me improve my weak foot and positioning in just 6 weeks. I've since been called up to the county squad.",
  },
  {
    name: "Sarah M.",
    role: "Parent",
    quote:
      "The 1-to-1 sessions transformed my son's confidence on the pitch. Gus is patient, professional, and genuinely passionate about developing young players.",
  },
  {
    name: "David K.",
    role: "Adult League Player",
    quote:
      "I signed up to the 10-week package to sharpen my technique. The structured plan and accountability made all the difference.",
  },
] as const;
