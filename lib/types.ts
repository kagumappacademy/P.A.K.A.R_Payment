export type Track = 'menengah' | 'universiti';
export type Module = {
  id: string; track: Track; title: string; subtitle: string; description: string;
  price: number; accent: string; icon: string; cover: string; poster: string; duration: string;
  schedule: string; active: boolean; sortOrder: number; outcomes: string[];
};
export type Settings = {
  eventName: string; eyebrow: string; heroTitle: string; heroHighlight: string;
  heroDescription: string; aboutTitle: string; aboutDescription: string;
  dateLabel: string; startDate: string; endDate: string; location: string;
  delivery: string; organizer: string; contactEmail: string; whatsapp: string;
  whatsappGroups: Record<Track, string>;
  heroImage: string; eventPoster: string; registrationOpen: boolean;
  tracks: Record<Track, { name: string; audience: string; description: string }>;
  comboTwo: number; comboThree: number; comboAll: number;
  paymentName: string; bankName: string; bankAccount: string; paymentQr: string;
  paymentInstructions: string; privacyText: string;
  benefits: { title: string; description: string; icon: string }[];
  faqs: { question: string; answer: string }[];
};
export type Registration = {
  id: string; reference: string; fullName: string; email: string; phone: string;
  institution: string; age: number; guardianName: string; guardianPhone: string;
  track: Track; modules: { id: string; title: string; price: number }[];
  subtotal: number; discount: number; discountPercent: number; total: number;
  status: 'awaiting_payment' | 'pending' | 'approved' | 'rejected';
  receiptId: string | null; receiptName: string | null; receiptMime?: string;
  paymentReceipt?: PaymentReceiptSnapshot; paymentSubmittedAt?: string; paymentApprovedAt?: string;
  adminNote: string; createdAt: string; updatedAt: string;
};
export type PaymentReceiptSnapshot = {
  number: string; issuedAt: string; recipient: string; organizer: string;
  eventName: string; eventDate: string;
};
