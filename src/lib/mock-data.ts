// ── Mock Data for PurohitConnect ──

export interface Purohit {
  id: string;
  name: string;
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

export interface Booking {
  id: string;
  userId: string;
  purohitId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  status: "pending" | "accepted" | "on-the-way" | "in-progress" | "completed" | "cancelled";
  address: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  timeline: { status: string; time: string; description: string }[];
}

export interface Review {
  id: string;
  purohitId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  serviceName: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  /** Matches the value used in `Purohit.specializations`. */
  specialization: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  addresses: { id: string; label: string; address: string; isDefault: boolean }[];
  walletBalance: number;
  favorites: string[];
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

// ── Reviews ──
export const reviews: Review[] = [
  { id: "r1", purohitId: "pt-001", userName: "Rajesh Kumar", rating: 5, comment: "Panditji performed our Griha Pravesh beautifully. Every ritual was explained clearly. Highly recommended!", date: "2024-12-15", serviceName: "Griha Pravesh" },
  { id: "r2", purohitId: "pt-001", userName: "Priya Agarwal", rating: 5, comment: "Our wedding ceremony was conducted with such grace and precision. Pandit Ramesh ji made it truly special.", date: "2024-11-20", serviceName: "Vivah Sanskar" },
  { id: "r3", purohitId: "pt-001", userName: "Amit Verma", rating: 4, comment: "Very knowledgeable and punctual. The Satyanarayan Puja was done perfectly. Would book again.", date: "2024-10-05", serviceName: "Satyanarayan Puja" },
  { id: "r4", purohitId: "pt-002", userName: "Sunita Devi", rating: 5, comment: "Acharya ji's Rudrabhishek was a divine experience. His Sanskrit pronunciation is impeccable.", date: "2024-12-01", serviceName: "Rudrabhishek" },
  { id: "r5", purohitId: "pt-002", userName: "Manoj Singh", rating: 5, comment: "The Navgraha Shanti puja brought so much peace to our family. Acharya Suresh ji is truly blessed.", date: "2024-11-10", serviceName: "Navgraha Shanti" },
  { id: "r6", purohitId: "pt-003", userName: "Sneha Patil", rating: 5, comment: "Pandit Vikram ji is amazing! He did our Ganesh Puja in Marathi and Hindi both. Very accommodating.", date: "2024-12-20", serviceName: "Ganesh Puja" },
  { id: "r7", purohitId: "pt-003", userName: "Ravi Mehta", rating: 4, comment: "Good experience with Vastu Puja. Panditji gave practical Vastu tips along with the puja.", date: "2024-11-15", serviceName: "Vastu Puja" },
  { id: "r8", purohitId: "pt-003", userName: "Kavita Shah", rating: 5, comment: "Best Satyanarayan Puja we've ever had. The whole family loved it. Very professional.", date: "2024-10-28", serviceName: "Satyanarayan Puja" },
  { id: "r9", purohitId: "pt-004", userName: "Deepa Tiwari", rating: 5, comment: "Pandit Arvind ji conducted our son's Mundan ceremony beautifully. His chanting was mesmerizing.", date: "2024-12-10", serviceName: "Mundan Sanskar" },
  { id: "r10", purohitId: "pt-004", userName: "Alok Srivastava", rating: 5, comment: "The wedding was absolutely perfect. Every ritual was performed with utmost devotion and precision.", date: "2024-11-25", serviceName: "Vivah Sanskar" },
  { id: "r11", purohitId: "pt-005", userName: "Poonam Jain", rating: 4, comment: "Acharya Deepak ji did a wonderful Vastu Puja. His knowledge of Vastu Shastra is impressive.", date: "2024-10-15", serviceName: "Vastu Puja" },
  { id: "r12", purohitId: "pt-006", userName: "Vikash Gupta", rating: 5, comment: "Despite being in Bengaluru, we got authentic North Indian puja experience. Pandit Sanjay ji is the best!", date: "2024-12-05", serviceName: "Satyanarayan Puja" },
  { id: "r13", purohitId: "pt-006", userName: "Ananya Reddy", rating: 4, comment: "Panditji adapted the rituals beautifully for our mixed-culture family. Very understanding and knowledgeable.", date: "2024-11-30", serviceName: "Ganesh Puja" },
  { id: "r14", purohitId: "pt-007", userName: "Subhash Ghosh", rating: 5, comment: "Pandit Kailash ji performed our father's Shradh with great devotion. A truly experienced purohit.", date: "2024-12-12", serviceName: "Shradh Karma" },
  { id: "r15", purohitId: "pt-007", userName: "Ritika Banerjee", rating: 4, comment: "The Rudrabhishek was beautifully conducted. Panditji's 30 years of experience truly shows.", date: "2024-11-08", serviceName: "Rudrabhishek" },
  { id: "r16", purohitId: "pt-008", userName: "Nikhil Pandey", rating: 5, comment: "Acharya Pradeep ji did an amazing job at our destination wedding in Udaipur. Young, energetic, and very skilled!", date: "2024-12-18", serviceName: "Vivah Sanskar" },
  { id: "r17", purohitId: "pt-008", userName: "Meera Sharma", rating: 5, comment: "Our baby's Naamkaran was a beautiful ceremony. Acharya ji explained the astrological significance wonderfully.", date: "2024-11-22", serviceName: "Naamkaran" },
  { id: "r18", purohitId: "pt-001", userName: "Saurabh Mishra", rating: 5, comment: "Third time booking Pandit Ramesh ji. Consistency and dedication is what sets him apart.", date: "2024-09-14", serviceName: "Satyanarayan Puja" },
];

// ── Bookings ──
export const initialBookings: Booking[] = [
  {
    id: "BK-2024-001",
    userId: "user-001",
    purohitId: "pt-001",
    serviceId: "griha-pravesh-puja",
    date: "2025-01-15",
    timeSlot: "9:00 AM - 12:00 PM",
    status: "completed",
    address: "Flat 302, Sunrise Apartments, Sector 62, Noida",
    city: "Delhi",
    totalAmount: 5100,
    paymentMethod: "UPI",
    notes: "Please bring all samagri. We have a large puja room.",
    createdAt: "2025-01-10",
    timeline: [
      { status: "Booking Placed", time: "10 Jan, 2:30 PM", description: "Your booking has been confirmed" },
      { status: "Accepted", time: "10 Jan, 3:15 PM", description: "Pandit Ramesh Shastri accepted your booking" },
      { status: "On the Way", time: "15 Jan, 8:30 AM", description: "Panditji is on the way to your location" },
      { status: "In Progress", time: "15 Jan, 9:05 AM", description: "Puja ceremony has started" },
      { status: "Completed", time: "15 Jan, 12:20 PM", description: "Griha Pravesh Puja completed successfully" },
    ],
  },
  {
    id: "BK-2024-002",
    userId: "user-001",
    purohitId: "pt-003",
    serviceId: "satyanarayan-puja",
    date: "2025-02-20",
    timeSlot: "5:00 PM - 7:00 PM",
    status: "accepted",
    address: "House No. 45, MG Road, Andheri West, Mumbai",
    city: "Mumbai",
    totalAmount: 3100,
    paymentMethod: "Card",
    notes: "Evening puja preferred. 15 family members expected.",
    createdAt: "2025-02-15",
    timeline: [
      { status: "Booking Placed", time: "15 Feb, 10:00 AM", description: "Your booking has been confirmed" },
      { status: "Accepted", time: "15 Feb, 11:45 AM", description: "Pandit Vikram Joshi accepted your booking" },
    ],
  },
  {
    id: "BK-2024-003",
    userId: "user-001",
    purohitId: "pt-006",
    serviceId: "ganesh-puja",
    date: "2025-02-25",
    timeSlot: "7:00 AM - 8:00 AM",
    status: "pending",
    address: "Villa 12, Prestige Lakeside, Whitefield, Bengaluru",
    city: "Bengaluru",
    totalAmount: 1500,
    paymentMethod: "Wallet",
    notes: "Small family gathering. Please arrive 15 mins early.",
    createdAt: "2025-02-22",
    timeline: [
      { status: "Booking Placed", time: "22 Feb, 6:00 PM", description: "Your booking has been confirmed" },
    ],
  },
  {
    id: "BK-2024-004",
    userId: "user-001",
    purohitId: "pt-004",
    serviceId: "vivah-sanskar",
    date: "2025-03-10",
    timeSlot: "10:00 AM - 4:00 PM",
    status: "on-the-way",
    address: "Royal Garden Banquet Hall, Gomti Nagar, Lucknow",
    city: "Lucknow",
    totalAmount: 21000,
    paymentMethod: "UPI",
    notes: "Wedding ceremony for 200 guests. Mandap already set up.",
    createdAt: "2025-02-01",
    timeline: [
      { status: "Booking Placed", time: "1 Feb, 9:00 AM", description: "Your booking has been confirmed" },
      { status: "Accepted", time: "1 Feb, 10:30 AM", description: "Pandit Arvind Tiwari accepted your booking" },
      { status: "On the Way", time: "10 Mar, 9:15 AM", description: "Panditji is on the way to the venue" },
    ],
  },
  {
    id: "BK-2024-005",
    userId: "user-001",
    purohitId: "pt-002",
    serviceId: "rudrabhishek",
    date: "2025-01-26",
    timeSlot: "6:00 AM - 8:00 AM",
    status: "completed",
    address: "C-12, Defence Colony, New Delhi",
    city: "Delhi",
    totalAmount: 4100,
    paymentMethod: "UPI",
    notes: "Republic Day special puja. Family of 8.",
    createdAt: "2025-01-20",
    timeline: [
      { status: "Booking Placed", time: "20 Jan, 4:00 PM", description: "Your booking has been confirmed" },
      { status: "Accepted", time: "20 Jan, 5:00 PM", description: "Acharya Suresh Dwivedi accepted your booking" },
      { status: "On the Way", time: "26 Jan, 5:30 AM", description: "Acharya ji is on the way" },
      { status: "In Progress", time: "26 Jan, 6:00 AM", description: "Rudrabhishek ceremony has begun" },
      { status: "Completed", time: "26 Jan, 8:15 AM", description: "Rudrabhishek completed. Om Namah Shivaya!" },
    ],
  },
];

// ── User Profile ──
export const mockUser: UserProfile = {
  id: "user-001",
  name: "Arun Banerjee",
  phone: "+91 98765 43210",
  email: "arun.banerjee@email.com",
  city: "Delhi",
  addresses: [
    { id: "addr-1", label: "Home", address: "Flat 302, Sunrise Apartments, Sector 62, Noida, UP 201301", isDefault: true },
    { id: "addr-2", label: "Office", address: "Tower B, 5th Floor, Cyber City, Gurugram, HR 122002", isDefault: false },
    { id: "addr-3", label: "Parents", address: "House No. 45, Salt Lake, Sector V, Kolkata, WB 700091", isDefault: false },
  ],
  walletBalance: 2450,
  favorites: ["pt-001", "pt-003", "pt-006"],
};

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

// ── Admin Stats ──
export const adminStats = {
  totalUsers: 12847,
  totalPurohits: 342,
  totalBookings: 8956,
  totalRevenue: 4523000,
  activeBookings: 127,
  monthlyGrowth: 18.5,
};

// ── Chart Data ──
export const revenueChartData = [
  { month: "Jan", revenue: 320000, bookings: 645 },
  { month: "Feb", revenue: 380000, bookings: 720 },
  { month: "Mar", revenue: 450000, bookings: 890 },
  { month: "Apr", revenue: 410000, bookings: 810 },
  { month: "May", revenue: 520000, bookings: 940 },
  { month: "Jun", revenue: 480000, bookings: 875 },
  { month: "Jul", revenue: 560000, bookings: 1020 },
  { month: "Aug", revenue: 610000, bookings: 1100 },
  { month: "Sep", revenue: 540000, bookings: 980 },
  { month: "Oct", revenue: 670000, bookings: 1200 },
  { month: "Nov", revenue: 720000, bookings: 1350 },
  { month: "Dec", revenue: 830000, bookings: 1480 },
];

export const bookingsByCityData = [
  { city: "Delhi", bookings: 2340 },
  { city: "Mumbai", bookings: 1890 },
  { city: "Varanasi", bookings: 1456 },
  { city: "Bengaluru", bookings: 1230 },
  { city: "Lucknow", bookings: 780 },
  { city: "Jaipur", bookings: 650 },
  { city: "Kolkata", bookings: 610 },
];

// ── Purohit Dashboard Data ──
export const purohitDashboardData = {
  todayEarnings: 8200,
  weekEarnings: 34500,
  monthEarnings: 156000,
  totalCompleted: 1247,
  pendingRequests: [
    {
      id: "REQ-001",
      userName: "Rahul Gupta",
      service: "Satyanarayan Puja",
      date: "2025-03-01",
      time: "5:00 PM - 7:00 PM",
      location: "Sector 44, Noida",
      amount: 3100,
    },
    {
      id: "REQ-002",
      userName: "Meena Devi",
      service: "Griha Pravesh",
      date: "2025-03-05",
      time: "9:00 AM - 12:00 PM",
      location: "Dwarka, Delhi",
      amount: 5100,
    },
    {
      id: "REQ-003",
      userName: "Sunil Yadav",
      service: "Havan/Homam",
      date: "2025-03-08",
      time: "7:00 AM - 8:30 AM",
      location: "Varanasi",
      amount: 3500,
    },
  ],
  upcomingBookings: [
    { id: "UB-001", service: "Vivah Sanskar", date: "2025-03-10", client: "Sharma Family", location: "Lucknow" },
    { id: "UB-002", service: "Rudrabhishek", date: "2025-03-12", client: "Anil Pandey", location: "Delhi" },
    { id: "UB-003", service: "Ganesh Puja", date: "2025-03-15", client: "Priya Singh", location: "Noida" },
  ],
};

export const purohitWeeklyEarnings = [
  { day: "Mon", earnings: 4200 },
  { day: "Tue", earnings: 3100 },
  { day: "Wed", earnings: 6800 },
  { day: "Thu", earnings: 2500 },
  { day: "Fri", earnings: 5100 },
  { day: "Sat", earnings: 9600 },
  { day: "Sun", earnings: 8200 },
];

// ── Admin: registered users ──
export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  city: string;
  bookings: number;
  joined: string;
  status: "active" | "suspended";
}

export const adminUsers: AdminUser[] = [
  { id: "u-1001", name: "Rajesh Kumar", phone: "+91 98110 22345", city: "Delhi", bookings: 6, joined: "2024-03-12", status: "active" },
  { id: "u-1002", name: "Priya Agarwal", phone: "+91 99870 11223", city: "Mumbai", bookings: 3, joined: "2024-05-02", status: "active" },
  { id: "u-1003", name: "Amit Verma", phone: "+91 97180 55432", city: "Noida", bookings: 2, joined: "2024-06-18", status: "active" },
  { id: "u-1004", name: "Sneha Patil", phone: "+91 98200 77881", city: "Pune", bookings: 4, joined: "2024-07-09", status: "active" },
  { id: "u-1005", name: "Vikash Gupta", phone: "+91 90080 44567", city: "Bengaluru", bookings: 1, joined: "2024-08-21", status: "suspended" },
  { id: "u-1006", name: "Ritika Banerjee", phone: "+91 98300 66712", city: "Kolkata", bookings: 5, joined: "2024-09-03", status: "active" },
  { id: "u-1007", name: "Nikhil Pandey", phone: "+91 94150 33890", city: "Lucknow", bookings: 2, joined: "2024-10-14", status: "active" },
  { id: "u-1008", name: "Meera Sharma", phone: "+91 98290 12098", city: "Jaipur", bookings: 3, joined: "2024-11-27", status: "active" },
];

// ── Lookup helpers ──
export function getPurohit(id: string | undefined) {
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

export function getReviewsForPurohit(id: string) {
  return reviews.filter((r) => r.purohitId === id);
}
