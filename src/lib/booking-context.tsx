"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  Booking,
  PLATFORM_FEE,
  UserProfile,
  getPurohit,
  getService,
  initialBookings,
  mockUser,
} from "./mock-data";

export type UserRole = "user" | "purohit" | "admin";

export interface BookingFlowState {
  purohitId: string;
  serviceId: string;
  /** Local `yyyy-MM-dd`. */
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: string;
}

export interface SubmittedReview {
  rating: number;
  comment: string;
}

type Address = UserProfile["addresses"][number];
type ProfileFields = Pick<UserProfile, "name" | "email" | "phone" | "city">;

interface AppContextType {
  // Session
  isLoggedIn: boolean;
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;

  // Customer profile
  profile: ProfileFields;
  updateProfile: (fields: ProfileFields) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, "id" | "isDefault">) => Address;
  setDefaultAddress: (id: string) => void;
  walletBalance: number;
  addMoney: (amount: number) => void;

  // Favourites
  favorites: string[];
  isFavorite: (purohitId: string) => boolean;
  toggleFavorite: (purohitId: string) => boolean;

  // Bookings
  bookings: Booking[];
  addBooking: (flow: BookingFlowState) => Booking;
  cancelBooking: (id: string) => void;
  reviews: Record<string, SubmittedReview>;
  submitReview: (bookingId: string, review: SubmittedReview) => void;

  // Purohit dashboard
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  acceptedRequests: string[];
  rejectedRequests: string[];
  purohitAvailable: boolean;
  setPurohitAvailable: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function bookingTotal(serviceId: string) {
  return (getService(serviceId)?.basePrice ?? 0) + PLATFORM_FEE;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [profile, setProfile] = useState<ProfileFields>({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    city: mockUser.city,
  });
  const [addresses, setAddresses] = useState<Address[]>(mockUser.addresses);
  const [walletBalance, setWalletBalance] = useState(mockUser.walletBalance);
  const [favorites, setFavorites] = useState<string[]>(mockUser.favorites);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Record<string, SubmittedReview>>({});
  const [acceptedRequests, setAcceptedRequests] = useState<string[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);
  const [purohitAvailable, setPurohitAvailable] = useState(true);

  const login = useCallback((role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole("user");
  }, []);

  const updateProfile = useCallback((fields: ProfileFields) => {
    setProfile(fields);
  }, []);

  const addAddress = useCallback((address: Omit<Address, "id" | "isDefault">) => {
    const created: Address = { ...address, id: `addr-${Date.now()}`, isDefault: false };
    setAddresses((prev) => [...prev, created]);
    return created;
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const addMoney = useCallback((amount: number) => {
    setWalletBalance((b) => b + amount);
  }, []);

  const isFavorite = useCallback(
    (purohitId: string) => favorites.includes(purohitId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (purohitId: string) => {
      const next = !favorites.includes(purohitId);
      setFavorites((prev) =>
        next ? [...prev, purohitId] : prev.filter((id) => id !== purohitId)
      );
      return next;
    },
    [favorites]
  );

  const addBooking = useCallback(
    (flow: BookingFlowState): Booking => {
      const purohit = getPurohit(flow.purohitId);
      const service = getService(flow.serviceId);
      const totalAmount = bookingTotal(flow.serviceId);
      const newBooking: Booking = {
        id: `BK-${Date.now().toString().slice(-8)}`,
        userId: mockUser.id,
        purohitId: flow.purohitId,
        serviceId: flow.serviceId,
        date: flow.date,
        timeSlot: flow.timeSlot,
        status: "pending",
        address: flow.address,
        city: flow.city,
        totalAmount,
        paymentMethod: flow.paymentMethod,
        notes: flow.notes,
        createdAt: new Date().toISOString().split("T")[0],
        timeline: [
          {
            status: "Booking Placed",
            time: nowLabel(),
            description: `Request sent to ${purohit?.name ?? "your purohit"} for ${service?.name ?? "the puja"}`,
          },
        ],
      };
      if (flow.paymentMethod === "wallet") {
        setWalletBalance((b) => Math.max(0, b - totalAmount));
      }
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    },
    []
  );

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "cancelled",
              timeline: [
                ...b.timeline,
                {
                  status: "Cancelled",
                  time: nowLabel(),
                  description: "You cancelled this booking. Any payment will be refunded in 3–5 days.",
                },
              ],
            }
          : b
      )
    );
  }, []);

  const submitReview = useCallback((bookingId: string, review: SubmittedReview) => {
    setReviews((prev) => ({ ...prev, [bookingId]: review }));
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setAcceptedRequests((prev) => [...prev, id]);
    setRejectedRequests((prev) => prev.filter((r) => r !== id));
  }, []);

  const rejectRequest = useCallback((id: string) => {
    setRejectedRequests((prev) => [...prev, id]);
    setAcceptedRequests((prev) => prev.filter((r) => r !== id));
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      isLoggedIn,
      userRole,
      login,
      logout,
      profile,
      updateProfile,
      addresses,
      addAddress,
      setDefaultAddress,
      walletBalance,
      addMoney,
      favorites,
      isFavorite,
      toggleFavorite,
      bookings,
      addBooking,
      cancelBooking,
      reviews,
      submitReview,
      acceptRequest,
      rejectRequest,
      acceptedRequests,
      rejectedRequests,
      purohitAvailable,
      setPurohitAvailable,
    }),
    [
      isLoggedIn,
      userRole,
      login,
      logout,
      profile,
      updateProfile,
      addresses,
      addAddress,
      setDefaultAddress,
      walletBalance,
      addMoney,
      favorites,
      isFavorite,
      toggleFavorite,
      bookings,
      addBooking,
      cancelBooking,
      reviews,
      submitReview,
      acceptRequest,
      rejectRequest,
      acceptedRequests,
      rejectedRequests,
      purohitAvailable,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
