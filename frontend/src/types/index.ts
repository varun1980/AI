export type CompetitionCategory = 'cars' | 'cash' | 'tech' | 'lifestyle' | 'instant';

export type CompetitionStatus = 'live' | 'sold_out' | 'drawn' | 'upcoming';

export interface SkillQuestion {
  question: string;
  options: string[];
  /** index of the correct option */
  answerIndex: number;
}

export interface Competition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CompetitionCategory;
  status: CompetitionStatus;
  image: string;
  gallery: string[];
  /** ticket price in pence */
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  maxPerUser: number;
  /** cash alternative in pence, if offered */
  cashAlternative?: number;
  /** ISO date the draw closes */
  drawDate: string;
  description: string;
  highlights: string[];
  skillQuestion: SkillQuestion;
  featured: boolean;
  /** instant-win prizes baked into ticket numbers */
  instantWins?: InstantWinPrize[];
}

export interface InstantWinPrize {
  label: string;
  /** value in pence */
  value: number;
  remaining: number;
}

export interface Winner {
  id: string;
  name: string;
  location: string;
  prize: string;
  competitionTitle: string;
  image: string;
  ticketNumber: number;
  drawnAt: string;
  quote?: string;
}

export interface CartLine {
  competitionId: string;
  slug: string;
  title: string;
  image: string;
  ticketPrice: number;
  quantity: number;
}

export interface OrderResult {
  orderId: string;
  status: 'paid' | 'requires_payment';
  amount: number;
  /** present when Stripe is configured */
  clientSecret?: string;
  ticketNumbers: { competitionId: string; numbers: number[] }[];
  mock: boolean;
}
