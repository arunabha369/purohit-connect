// ── Catalog: static reference data ──
// Services, categories and purohit profiles. Mutable state (users, bookings,
// reviews, wallet…) lives in `src/lib/store`, seeded from `store/seed.ts`.

export interface Purohit {
  id: string;
  name: string;
  /** 10-digit mobile number used to sign in to the purohit dashboard. */
  phone: string;
  photo: string;
  city: string;
  languages: string[];
  specializations: string[];
  rating: number;
  reviewCount: number;
  experience: number;
  priceRange: { min: number; max: number };
  bio: string;
  certificates: string[];
  available: boolean;
  gallery: string[];
  completedPujas: number;
  responseTime: string;
}

export interface Service {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  category: string;
  icon: string;
  basePrice: number;
  duration: string;
  popular: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  /** Matches the value used in `Purohit.specializations`. */
  specialization: string;
}

// ── Categories ──
export const categories: Category[] = [
  { id: "griha-pravesh", name: "Griha Pravesh", icon: "Home", count: 45, specialization: "Griha Pravesh" },
  { id: "satyanarayan", name: "Satyanarayan Puja", icon: "Sun", count: 62, specialization: "Satyanarayan Puja" },
  { id: "wedding", name: "Vivah (Wedding)", icon: "Heart", count: 38, specialization: "Vivah Sanskar" },
  { id: "mundan", name: "Mundan Sanskar", icon: "Scissors", count: 29, specialization: "Mundan Sanskar" },
  { id: "naamkaran", name: "Naamkaran", icon: "Baby", count: 34, specialization: "Naamkaran" },
  { id: "ganesh-puja", name: "Ganesh Puja", icon: "Flower2", count: 51, specialization: "Ganesh Puja" },
  { id: "navgraha", name: "Navgraha Shanti", icon: "Star", count: 23, specialization: "Navgraha Shanti" },
  { id: "vastu", name: "Vastu Puja", icon: "Compass", count: 19, specialization: "Vastu Puja" },
  { id: "shradh", name: "Shradh Karma", icon: "Flame", count: 27, specialization: "Shradh Karma" },
  { id: "rudrabhishek", name: "Rudrabhishek", icon: "Droplets", count: 31, specialization: "Rudrabhishek" },
  { id: "sundarkand", name: "Sundarkand Path", icon: "BookOpen", count: 42, specialization: "Sundarkand Path" },
  { id: "havan", name: "Havan/Homam", icon: "Flame", count: 55, specialization: "Havan/Homam" },
];

// ── Services ──
export const services: Service[] = [
  {
    id: "griha-pravesh-puja",
    name: "Griha Pravesh Puja",
    nameHindi: "गृह प्रवेश पूजा",
    description: "Complete Griha Pravesh ceremony with Ganesh Puja, Navagraha Puja, Vastu Shanti, and Havan for your new home.",
    category: "griha-pravesh",
    icon: "Home",
    basePrice: 5100,
    duration: "3-4 hours",
    popular: true,
  },
  {
    id: "satyanarayan-puja",
    name: "Satyanarayan Puja",
    nameHindi: "सत्यनारायण पूजा",
    description: "Shri Satyanarayan Bhagwan ki Puja with Katha Vachan, prasad preparation guidance included.",
    category: "satyanarayan",
    icon: "Sun",
    basePrice: 3100,
    duration: "2-3 hours",
    popular: true,
  },
  {
    id: "vivah-sanskar",
    name: "Vivah Sanskar (Wedding)",
    nameHindi: "विवाह संस्कार",
    description: "Complete Hindu wedding ceremony including Ganesh Puja, Mandap Puja, Kanyadaan, Pheras, and Sindoor Daan.",
    category: "wedding",
    icon: "Heart",
    basePrice: 21000,
    duration: "4-6 hours",
    popular: true,
  },
  {
    id: "mundan-sanskar",
    name: "Mundan Sanskar",
    nameHindi: "मुण्डन संस्कार",
    description: "Traditional Mundan ceremony with proper Vedic rituals and blessings for the child.",
    category: "mundan",
    icon: "Scissors",
    basePrice: 3500,
    duration: "1.5-2 hours",
    popular: false,
  },
  {
    id: "naamkaran-puja",
    name: "Naamkaran Puja",
    nameHindi: "नामकरण पूजा",
    description: "Sacred naming ceremony for newborns performed with Vedic mantras and astrological consultation.",
    category: "naamkaran",
    icon: "Baby",
    basePrice: 2500,
    duration: "1-1.5 hours",
    popular: false,
  },
  {
    id: "ganesh-puja",
    name: "Ganesh Puja",
    nameHindi: "गणेश पूजा",
    description: "Invoke Lord Ganesha's blessings before starting any new venture, journey, or auspicious occasion.",
    category: "ganesh-puja",
    icon: "Flower2",
    basePrice: 1500,
    duration: "1 hour",
    popular: true,
  },
  {
    id: "navgraha-shanti",
    name: "Navgraha Shanti Puja",
    nameHindi: "नवग्रह शांति पूजा",
    description: "Pacify the nine celestial bodies and reduce the malefic effects of planetary positions in your horoscope.",
    category: "navgraha",
    icon: "Star",
    basePrice: 5500,
    duration: "2-3 hours",
    popular: false,
  },
  {
    id: "vastu-puja",
    name: "Vastu Shanti Puja",
    nameHindi: "वास्तु शांति पूजा",
    description: "Vastu Shanti for harmonizing the energy of your home or workplace according to Vastu Shastra.",
    category: "vastu",
    icon: "Compass",
    basePrice: 4500,
    duration: "2-3 hours",
    popular: false,
  },
  {
    id: "rudrabhishek",
    name: "Rudrabhishek",
    nameHindi: "रुद्राभिषेक",
    description: "Sacred abhishek of Lord Shiva with milk, honey, curd, and Ganga Jal accompanied by Rudra Mantras.",
    category: "rudrabhishek",
    icon: "Droplets",
    basePrice: 4100,
    duration: "2-3 hours",
    popular: true,
  },
  {
    id: "sundarkand-path",
    name: "Sundarkand Path",
    nameHindi: "सुन्दरकाण्ड पाठ",
    description: "Complete recitation of Sundarkand from Ramcharitmanas with bhajan and aarti.",
    category: "sundarkand",
    icon: "BookOpen",
    basePrice: 2100,
    duration: "2-3 hours",
    popular: true,
  },
  {
    id: "havan-homam",
    name: "Havan / Homam",
    nameHindi: "हवन / होमम",
    description: "Sacred fire ceremony invoking specific deities for health, prosperity, and spiritual cleansing.",
    category: "havan",
    icon: "Flame",
    basePrice: 3500,
    duration: "1.5-2 hours",
    popular: true,
  },
  {
    id: "shradh-karma",
    name: "Shradh Karma",
    nameHindi: "श्राद्ध कर्म",
    description: "Annual ceremony to honor and pay respects to departed ancestors with Pind Daan and Tarpan.",
    category: "shradh",
    icon: "Flame",
    basePrice: 3100,
    duration: "2-3 hours",
    popular: false,
  },
];

// ── Purohits ──
export const purohits: Purohit[] = [
  {
    id: "pt-001",
    phone: "9000000001",
    name: "Pandit Ramesh Shastri",
    photo: "",
    city: "Varanasi",
    languages: ["Hindi", "Sanskrit", "English"],
    specializations: ["Vivah Sanskar", "Griha Pravesh", "Satyanarayan Puja"],
    rating: 4.9,
    reviewCount: 234,
    experience: 25,
    priceRange: { min: 3100, max: 25000 },
    bio: "With over 25 years of experience in Vedic rituals, Pandit Ramesh Shastri is one of the most sought-after purohits in Varanasi. He holds a degree in Sanskrit from BHU and has performed over 5,000 ceremonies across North India.",
    certificates: ["Vedacharya - BHU", "Jyotish Visharad"],
    available: true,
    gallery: [],
    completedPujas: 5000,
    responseTime: "1 hour",
  },
  {
    id: "pt-002",
    phone: "9000000002",
    name: "Acharya Suresh Dwivedi",
    photo: "",
    city: "Delhi",
    languages: ["Hindi", "Sanskrit"],
    specializations: ["Rudrabhishek", "Navgraha Shanti", "Havan/Homam"],
    rating: 4.8,
    reviewCount: 189,
    experience: 18,
    priceRange: { min: 2500, max: 15000 },
    bio: "Acharya Suresh Dwivedi specializes in Shiva-related ceremonies and planetary pacification rituals. Trained at Kashi Vidyapeeth, he brings deep scriptural knowledge to every ceremony.",
    certificates: ["Shastri - Kashi Vidyapeeth", "Karmakandi Certification"],
    available: true,
    gallery: [],
    completedPujas: 3200,
    responseTime: "2 hours",
  },
  {
    id: "pt-003",
    phone: "9000000003",
    name: "Pandit Vikram Joshi",
    photo: "",
    city: "Mumbai",
    languages: ["Hindi", "Marathi", "English", "Gujarati"],
    specializations: ["Satyanarayan Puja", "Ganesh Puja", "Vastu Puja"],
    rating: 4.7,
    reviewCount: 312,
    experience: 15,
    priceRange: { min: 2100, max: 12000 },
    bio: "Pandit Vikram Joshi is Mumbai's favorite purohit for all occasions. His multilingual abilities and modern approach make him popular with young families while maintaining strict adherence to Vedic traditions.",
    certificates: ["Vedanta Studies - Chinmaya Mission"],
    available: true,
    gallery: [],
    completedPujas: 2800,
    responseTime: "30 mins",
  },
  {
    id: "pt-004",
    phone: "9000000004",
    name: "Pandit Arvind Tiwari",
    photo: "",
    city: "Lucknow",
    languages: ["Hindi", "Sanskrit", "Urdu"],
    specializations: ["Vivah Sanskar", "Mundan Sanskar", "Naamkaran"],
    rating: 4.9,
    reviewCount: 156,
    experience: 22,
    priceRange: { min: 2500, max: 22000 },
    bio: "Pandit Arvind Tiwari brings the grace of Awadhi culture to every ceremony. Known for his melodious chanting and attention to detail, he ensures every ritual is a memorable experience for families.",
    certificates: ["Acharya - Lucknow University", "Paurohitya Diploma"],
    available: true,
    gallery: [],
    completedPujas: 4100,
    responseTime: "1 hour",
  },
  {
    id: "pt-005",
    phone: "9000000005",
    name: "Acharya Deepak Sharma",
    photo: "",
    city: "Jaipur",
    languages: ["Hindi", "Sanskrit", "Rajasthani"],
    specializations: ["Griha Pravesh", "Vastu Puja", "Sundarkand Path"],
    rating: 4.6,
    reviewCount: 98,
    experience: 12,
    priceRange: { min: 1800, max: 10000 },
    bio: "Acharya Deepak Sharma from Jaipur is known for his expertise in Vastu Shastra and Griha Pravesh ceremonies. His calm demeanor and clear explanations help families understand the significance of each ritual.",
    certificates: ["Vastu Visharad", "Jyotish Ratna"],
    available: false,
    gallery: [],
    completedPujas: 1500,
    responseTime: "3 hours",
  },
  {
    id: "pt-006",
    phone: "9000000006",
    name: "Pandit Sanjay Mishra",
    photo: "",
    city: "Bengaluru",
    languages: ["Hindi", "Sanskrit", "Kannada", "English"],
    specializations: ["Satyanarayan Puja", "Havan/Homam", "Ganesh Puja"],
    rating: 4.8,
    reviewCount: 267,
    experience: 20,
    priceRange: { min: 2500, max: 15000 },
    bio: "Pandit Sanjay Mishra moved to Bengaluru 15 years ago and has since become the city's most trusted purohit among the North Indian community. He also serves South Indian families with adapted rituals.",
    certificates: ["Vedacharya - Sampurnanand Sanskrit University"],
    available: true,
    gallery: [],
    completedPujas: 3600,
    responseTime: "45 mins",
  },
  {
    id: "pt-007",
    phone: "9000000007",
    name: "Pandit Kailash Pandey",
    photo: "",
    city: "Kolkata",
    languages: ["Hindi", "Bengali", "Sanskrit"],
    specializations: ["Shradh Karma", "Rudrabhishek", "Navgraha Shanti"],
    rating: 4.5,
    reviewCount: 78,
    experience: 30,
    priceRange: { min: 2000, max: 12000 },
    bio: "With three decades of experience, Pandit Kailash Pandey is a revered figure in Kolkata's spiritual community. He specializes in ancestral rites and Shiva worship traditions.",
    certificates: ["Shastri - Calcutta Sanskrit College", "Karmakandi Expert"],
    available: true,
    gallery: [],
    completedPujas: 6200,
    responseTime: "2 hours",
  },
  {
    id: "pt-008",
    phone: "9000000008",
    name: "Acharya Pradeep Upadhyay",
    photo: "",
    city: "Varanasi",
    languages: ["Hindi", "Sanskrit", "English"],
    specializations: ["Vivah Sanskar", "Naamkaran", "Satyanarayan Puja"],
    rating: 4.7,
    reviewCount: 145,
    experience: 16,
    priceRange: { min: 2100, max: 18000 },
    bio: "A young and dynamic purohit from the holy city of Varanasi, Acharya Pradeep combines traditional Vedic learning with a modern approach. He is particularly popular for destination weddings.",
    certificates: ["Acharya - BHU", "Wedding Specialist Certification"],
    available: true,
    gallery: [],
    completedPujas: 2200,
    responseTime: "30 mins",
  },
];

// ── Sample reviews (seeded into the store; dates are set relative to "now") ──
export const sampleReviews: {
  purohitId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceName: string;
}[] = [
  { purohitId: "pt-001", userName: "Rajesh Kumar", rating: 5, comment: "Panditji performed our Griha Pravesh beautifully. Every ritual was explained clearly. Highly recommended!", serviceName: "Griha Pravesh" },
  { purohitId: "pt-001", userName: "Priya Agarwal", rating: 5, comment: "Our wedding ceremony was conducted with such grace and precision. Pandit Ramesh ji made it truly special.", serviceName: "Vivah Sanskar" },
  { purohitId: "pt-001", userName: "Amit Verma", rating: 4, comment: "Very knowledgeable and punctual. The Satyanarayan Puja was done perfectly. Would book again.", serviceName: "Satyanarayan Puja" },
  { purohitId: "pt-002", userName: "Sunita Devi", rating: 5, comment: "Acharya ji's Rudrabhishek was a divine experience. His Sanskrit pronunciation is impeccable.", serviceName: "Rudrabhishek" },
  { purohitId: "pt-002", userName: "Manoj Singh", rating: 5, comment: "The Navgraha Shanti puja brought so much peace to our family. Acharya Suresh ji is truly blessed.", serviceName: "Navgraha Shanti" },
  { purohitId: "pt-003", userName: "Sneha Patil", rating: 5, comment: "Pandit Vikram ji is amazing! He did our Ganesh Puja in Marathi and Hindi both. Very accommodating.", serviceName: "Ganesh Puja" },
  { purohitId: "pt-003", userName: "Ravi Mehta", rating: 4, comment: "Good experience with Vastu Puja. Panditji gave practical Vastu tips along with the puja.", serviceName: "Vastu Puja" },
  { purohitId: "pt-003", userName: "Kavita Shah", rating: 5, comment: "Best Satyanarayan Puja we've ever had. The whole family loved it. Very professional.", serviceName: "Satyanarayan Puja" },
  { purohitId: "pt-004", userName: "Deepa Tiwari", rating: 5, comment: "Pandit Arvind ji conducted our son's Mundan ceremony beautifully. His chanting was mesmerizing.", serviceName: "Mundan Sanskar" },
  { purohitId: "pt-004", userName: "Alok Srivastava", rating: 5, comment: "The wedding was absolutely perfect. Every ritual was performed with utmost devotion and precision.", serviceName: "Vivah Sanskar" },
  { purohitId: "pt-005", userName: "Poonam Jain", rating: 4, comment: "Acharya Deepak ji did a wonderful Vastu Puja. His knowledge of Vastu Shastra is impressive.", serviceName: "Vastu Puja" },
  { purohitId: "pt-006", userName: "Vikash Gupta", rating: 5, comment: "Despite being in Bengaluru, we got authentic North Indian puja experience. Pandit Sanjay ji is the best!", serviceName: "Satyanarayan Puja" },
  { purohitId: "pt-006", userName: "Ananya Reddy", rating: 4, comment: "Panditji adapted the rituals beautifully for our mixed-culture family. Very understanding and knowledgeable.", serviceName: "Ganesh Puja" },
  { purohitId: "pt-007", userName: "Subhash Ghosh", rating: 5, comment: "Pandit Kailash ji performed our father's Shradh with great devotion. A truly experienced purohit.", serviceName: "Shradh Karma" },
  { purohitId: "pt-007", userName: "Ritika Banerjee", rating: 4, comment: "The Rudrabhishek was beautifully conducted. Panditji's 30 years of experience truly shows.", serviceName: "Rudrabhishek" },
  { purohitId: "pt-008", userName: "Nikhil Pandey", rating: 5, comment: "Acharya Pradeep ji did an amazing job at our destination wedding in Udaipur. Young, energetic, and very skilled!", serviceName: "Vivah Sanskar" },
  { purohitId: "pt-008", userName: "Meera Sharma", rating: 5, comment: "Our baby's Naamkaran was a beautiful ceremony. Acharya ji explained the astrological significance wonderfully.", serviceName: "Naamkaran" },
  { purohitId: "pt-001", userName: "Saurabh Mishra", rating: 5, comment: "Third time booking Pandit Ramesh ji. Consistency and dedication is what sets him apart.", serviceName: "Satyanarayan Puja" },
];

// ── Cities ──
export const cities = ["Delhi", "Mumbai", "Varanasi", "Bengaluru", "Jaipur", "Lucknow", "Kolkata", "Pune", "Hyderabad", "Chennai"];

// ── Time Slots ──
export type DayPeriod = "Morning" | "Afternoon" | "Evening";

export const timeSlots: { label: string; period: DayPeriod }[] = [
  { label: "6:00 AM - 8:00 AM", period: "Morning" },
  { label: "8:00 AM - 10:00 AM", period: "Morning" },
  { label: "9:00 AM - 12:00 PM", period: "Morning" },
  { label: "10:00 AM - 1:00 PM", period: "Morning" },
  { label: "2:00 PM - 4:00 PM", period: "Afternoon" },
  { label: "4:00 PM - 6:00 PM", period: "Afternoon" },
  { label: "5:00 PM - 7:00 PM", period: "Evening" },
  { label: "6:00 PM - 8:00 PM", period: "Evening" },
];

// ── Pricing ──
export const PLATFORM_FEE = 99;

// ── Access ──
/** Numbers allowed to sign in to the admin console. */
export const ADMIN_PHONES = ["9000000000"];

// ── Lookup helpers ──
/** Static catalog lookup. Client code should prefer `usePurohit`, which includes purohits approved at runtime. */
export function getCatalogPurohit(id: string | undefined) {
  return purohits.find((p) => p.id === id);
}

export function getService(id: string | undefined) {
  return services.find((s) => s.id === id);
}

export function getCategory(id: string | undefined) {
  return categories.find((c) => c.id === id);
}

/** Services a purohit performs, based on their specializations. */
export function getServicesForPurohit(purohit: Purohit) {
  const categoryIds = new Set(
    categories
      .filter((c) => purohit.specializations.includes(c.specialization))
      .map((c) => c.id)
  );
  return services.filter((s) => categoryIds.has(s.category));
}
