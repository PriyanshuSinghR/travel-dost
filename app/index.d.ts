declare interface StatsCard {
  headerTitle: string;
  total: number;
  lastMonthCount: number;
  currentMonthCount: number;
}

declare interface TrendResult {
  trend: "increment" | "decrement" | "no change";
  percentage: number;
}

declare interface TripCardProps {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  tags: string[];
  price: string;
}

declare interface BaseUser {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  imageUrl: string;
}

declare interface UserData extends BaseUser {
  itineraryCreated: number | string;
  status: "user" | "admin";
}

declare type User = BaseUser;

declare interface Country {
  name: string;
  coordinates: [number, number];
  value: string;
  openStreetMap?: string;
}

declare interface CreateTripResponse {
  id?: string;
}

declare interface TripFormData {
  country: string;
  state: string;
  city: string;
  currency: string;
  currencySymbol: string;
  travelStyle: string;
  interest: string;
  budget: string;
  duration: number;
  groupType: string;
}

declare interface Trip {
  id: string;
  name: string;
  description: string;
  estimatedPrice: string;
  duration: number;
  budget: string;
  travelStyle: string;
  interests: string;
  groupType: string;
  country: string;
  imageUrls: string[];
  itinerary: DayPlan[];
  bestTimeToVisit: string[];
  weatherInfo: string[];
  location: Location;
  payment_link: string;
}

declare interface DayPlan {
  day: number;
  location: string;
  activities: Activity[];
}

declare interface InfoPillProps {
  text: string;
  image: string;
}

declare interface DashboardStats {
  totalUsers: number;
  usersJoined: {
    currentMonth: number;
    lastMonth: number;
  };
  userRole: {
    total: number;
    currentMonth: number;
    lastMonth: number;
  };
  totalTrips: number;
  tripsCreated: {
    currentMonth: number;
    lastMonth: number;
  };
}

declare interface UsersItineraryCount {
  imageUrl: string;
  name: string;
  count: number;
}

declare interface DestinationProps {
  containerClass?: string;
  bigCard?: boolean;
  activityCount: number;
  rating: number;
  bgImage: string;
  title: string;
}

declare interface Activity {
  time: string;
  description: string;
}
