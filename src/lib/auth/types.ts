export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  cart?: any;
  wishlist?: any;
  profilePhoto?:
    | string
    | {
        url?: string | null;
      }
    | null;
  savedShippingAddress?: {
    address?: string | null;
    city?: string | null;
    country?: string | null;
    postalCode?: string | null;
  };
  role: "customer" | "admin";
}

export interface SessionData {
  isAuth: boolean;
  user: AuthUser | null;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
