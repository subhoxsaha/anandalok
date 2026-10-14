export type UserRole = 'central_admin' | 'general_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  volunteerHours?: number;
  badges?: string[];
  joinedDate?: string;
}

export interface Cause {
  id: string;
  title: string;
  subtitle: string;
  category: 'child_welfare' | 'women_empowerment' | 'cloth_distribution' | 'food_health';
  description: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  imageUrl: string;
  featured?: boolean;
  taxExempt80G: boolean;
  impactPer100: string; // e.g. "Provides 1 week of nutritious meals for 4 children"
  updates?: { date: string; title: string; text: string }[];
}

export interface ArtisanProduct {
  id: string;
  title: string;
  artisanName: string;
  artisanLocation: string;
  artisanAvatar: string;
  artisanStory: string;
  category: 'textiles' | 'pottery' | 'jute_crafts' | 'bamboo_wood' | 'jewelry' | 'home_decor';
  price: number; // in INR
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  inStock: number;
  images: string[];
  description: string;
  materials: string[];
  dimensions?: string;
  impactMessage: string; // e.g. "Directly supports 1 rural artisan family's healthcare"
  featured?: boolean;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  category: 'cloth_drive' | 'child_education' | 'artisan_mela' | 'medical_camp' | 'food_drive';
  date: string;
  time: string;
  location: string;
  address: string;
  description: string;
  requiredVolunteers: number;
  registeredVolunteers: number;
  coordinatorName: string;
  coordinatorPhone: string;
  imageUrl: string;
  skillsNeeded: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  category: 'Child Care' | 'Women Empowerment' | 'Cloth Drives' | 'Artisan Stories' | 'Field Updates';
  imageUrl: string;
  readTime: string;
  tags: string[];
  published: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'children' | 'women' | 'cloth_drives' | 'crafts' | 'events';
  imageUrl: string;
  highResUrl: string;
  thumbnailUrl: string;
  location: string;
  date: string;
  description: string;
  photographer?: string;
  width?: number;
  height?: number;
  images?: string[];
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  causeId: string;
  causeTitle: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'stripe' | 'netbanking' | 'offline_pledge';
  transactionId: string;
  date: string;
  is80GClaimed: boolean;
  panNumber?: string;
  anonymous?: boolean;
  receiptUrl?: string;
  stripePaymentIntentId?: string;
  stripeReceiptUrl?: string;
}

export interface VolunteerRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  status: 'pending' | 'approved' | 'completed';
  hoursLogged?: number;
  feedback?: string;
  registeredAt: string;
}

export interface ImpactStat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  iconName: string;
}

export interface HeroImage {
  id: string;
  url: string;
  title: string;
  caption: string;
}

export interface ArtisanOrderItem {
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ArtisanOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: ArtisanOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'upi' | 'cod' | 'card' | 'stripe';
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId?: string;
  stripeReceiptUrl?: string;
}

export interface UserFeedback {
  id: string;
  userName: string;
  userEmail: string;
  category: 'general' | 'donation' | 'marketplace' | 'volunteer' | 'website_ui';
  rating: number; // 1-5
  subject: string;
  message: string;
  date: string;
  status?: 'published' | 'pending';
}

