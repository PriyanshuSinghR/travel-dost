import { formatDate } from "~/lib/utils";

export const sidebarItems = [
  {
    id: 1,
    icon: "/assets/icons/home.svg",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: 2,
    icon: "/assets/icons/users.svg",
    label: "All Users",
    href: "/all-users",
  },
  {
    id: 3,
    icon: "/assets/icons/itinerary.svg",
    label: "AI Trips",
    href: "/trips",
  },
];

export const user = {
  name: "Priyanshu Singh",
  email: "priyanshu@example.com",
  imageUrl: "/assets/images/david.webp",
};

export const dashboardStats = {
  totalUsers: 1237,
  usersJoined: { currentMonth: 218, lastMonth: 176 },
  totalTrips: 118,
  tripsCreated: { currentMonth: 6, lastMonth: 2 },
  userRole: { total: 62, currentMonth: 63, lastMonth: 78 },
};

export const allTrips = [
  {
    id: 1,
    name: "Tropical Rewind",
    imageUrls: ["/assets/images/sample1.jpg"],
    itinerary: [{ location: "Thailand" }],
    tags: ["Adventure", "Culture"],
    travelStyle: "Solo",
    estimatedPrice: "$1,000",
  },
  {
    id: 2,
    name: "French Reverie",
    imageUrls: ["/assets/images/sample2.jpg"],
    itinerary: [{ location: "Paris" }],
    tags: ["Relaxation", "Culinary"],
    travelStyle: "Family",
    estimatedPrice: "$2,000",
  },
  {
    id: 3,
    name: "Zen Break",
    imageUrls: ["/assets/images/sample3.jpg"],
    itinerary: [{ location: "Japan" }],
    tags: ["Shopping", "Luxury"],
    travelStyle: "Couple",
    estimatedPrice: "$3,000",
  },
  {
    id: 4,
    name: "Adventure in Westeros",
    imageUrls: ["/assets/images/sample4.jpg"],
    itinerary: [{ location: "Croatia" }],
    tags: ["Historical", "Culture"],
    travelStyle: "Friends",
    estimatedPrice: "$4,000",
  },
];

export const users = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-01"),
    itineraryCreated: 12,
    status: "user",
  },
  {
    id: 2,
    name: "Priya Mehta",
    email: "priya.mehta@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-04"),
    itineraryCreated: 5,
    status: "user",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit.verma@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-07"),
    itineraryCreated: 7,
    status: "user",
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha.singh@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-09"),
    itineraryCreated: 3,
    status: "user",
  },
  {
    id: 5,
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-10"),
    itineraryCreated: 9,
    status: "admin",
  },
  {
    id: 6,
    name: "Sneha Iyer",
    email: "sneha.iyer@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-11"),
    itineraryCreated: 2,
    status: "user",
  },
  {
    id: 7,
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-12"),
    itineraryCreated: 6,
    status: "user",
  },
  {
    id: 8,
    name: "Ananya Roy",
    email: "ananya.roy@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-13"),
    itineraryCreated: 4,
    status: "user",
  },
  {
    id: 9,
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-14"),
    itineraryCreated: 10,
    status: "admin",
  },
  {
    id: 10,
    name: "Pooja Desai",
    email: "pooja.desai@example.com",
    imageUrl: "/assets/images/david.webp",
    dateJoined: formatDate("2025-01-15"),
    itineraryCreated: 1,
    status: "user",
  },
];

export const travelStyles = [
  "Relaxed",
  "Luxury",
  "Adventure",
  "Cultural",
  "Nature & Outdoors",
  "City Exploration",
];

export const interests = [
  "Food & Culinary",
  "Historical Sites",
  "Hiking & Nature Walks",
  "Beaches & Water Activities",
  "Museums & Art",
  "Nightlife & Bars",
  "Photography Spots",
  "Shopping",
  "Local Experiences",
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

export const selectItems = [
  "groupType",
  "travelStyle",
  "interest",
  "budget",
] as (keyof TripFormData)[];

export const comboBoxItems = {
  groupType: groupTypes,
  travelStyle: travelStyles,
  interest: interests,
  budget: budgetOptions,
} as Record<keyof TripFormData, string[]>;
