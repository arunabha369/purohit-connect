"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Booking, initialBookings, purohits, services } from "./mock-data";

interface BookingFlowState {
  purohitId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: string;
}

interface AppContextType {
  bookings: Booking[];
  addBooking: (flow: BookingFlowState) => Booking;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  cancelBooking: (id: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  userRole: "user" | "purohit" | "admin";
  setUserRole: (role: "user" | "purohit" | "admin") => void;
  // Purohit dashboard
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  acceptedRequests: string[];
  rejectedRequests: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState<"user" | "purohit" | "admin">("user");
  const [acceptedRequests, setAcceptedRequests] = useState<string[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);

  const addBooking = (flow: BookingFlowState): Booking => {
    const purohit = purohits.find((p) => p.id === flow.purohitId);
    const service = services.find((s) => s.id === flow.serviceId);
    const newBooking: Booking = {
      id: `BK-${Date.now()}`,
      userId: "user-001",
      purohitId: flow.purohitId,
      serviceId: flow.serviceId,
      date: flow.date,
      timeSlot: flow.timeSlot,
      status: "pending",
      address: flow.address,
      city: flow.city,
      totalAmount: service?.basePrice || 3000,
      paymentMethod: flow.paymentMethod,
      notes: flow.notes,
      createdAt: new Date().toISOString().split("T")[0],
      timeline: [
        {
          status: "Booking Placed",
          time: new Date().toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          description: `Booking confirmed with ${purohit?.name || "Purohit"} for ${service?.name || "Puja"}`,
        },
      ],
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const cancelBooking = (id: string) => {
    updateBookingStatus(id, "cancelled");
  };

  const acceptRequest = (id: string) => {
    setAcceptedRequests((prev) => [...prev, id]);
    setRejectedRequests((prev) => prev.filter((r) => r !== id));
  };

  const rejectRequest = (id: string) => {
    setRejectedRequests((prev) => [...prev, id]);
    setAcceptedRequests((prev) => prev.filter((r) => r !== id));
  };

  return (
    <AppContext.Provider
      value={{
        bookings,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        isLoggedIn,
        setIsLoggedIn,
        userRole,
        setUserRole,
        acceptRequest,
        rejectRequest,
        acceptedRequests,
        rejectedRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
