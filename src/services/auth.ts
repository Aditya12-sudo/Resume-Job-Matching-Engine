interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private apiUrl = "/api/auth"; // Backend API endpoint

  constructor() {
    // Check for existing session
    const savedUser = localStorage.getItem("rj_user");
    const savedToken = localStorage.getItem("rj_token");
    if (savedUser && savedToken) {
      this.currentUser = JSON.parse(savedUser);
      // Verify token validity
      this.verifyToken(savedToken).catch(() => {
        this.logout();
      });
    }
  }

  private async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Try MongoDB authentication first
      const response = await fetch(`${this.apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.currentUser = data.user;
        localStorage.setItem("rj_user", JSON.stringify(data.user));
        localStorage.setItem("rj_token", data.token);
        this.notifyListeners();
        return data.user;
      } else {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
    } catch (error) {
      // Fallback to demo authentication if backend is not available
      console.warn("Backend authentication failed, using demo mode:", error);
      return this.demoLogin(credentials);
    }
  }

  private async demoLogin(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo validation
    if (
      credentials.email === "demo@rj.ai" &&
      credentials.password === "demo123"
    ) {
      const user: User = {
        id: "demo-1",
        email: credentials.email,
        name: "Demo User",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      this.currentUser = user;
      localStorage.setItem("rj_user", JSON.stringify(user));
      localStorage.setItem("rj_token", "demo-token");
      this.notifyListeners();
      return user;
    }

    throw new Error(
      "Invalid credentials. Use demo@rj.ai / demo123 for demo access.",
    );
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      // Try MongoDB authentication first
      const response = await fetch(`${this.apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.currentUser = data.user;
        localStorage.setItem("rj_user", JSON.stringify(data.user));
        localStorage.setItem("rj_token", data.token);
        this.notifyListeners();
        return data.user;
      } else {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
    } catch (error) {
      // Fallback to demo signup if backend is not available
      console.warn("Backend signup failed, using demo mode:", error);
      return this.demoSignup(credentials);
    }
  }

  private async demoSignup(credentials: SignupCredentials): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Check if email already exists in demo mode
    const existingUsers = JSON.parse(
      localStorage.getItem("rj_demo_users") || "[]",
    );
    if (existingUsers.find((u: User) => u.email === credentials.email)) {
      throw new Error("Email already exists");
    }

    // Create demo user
    const user: User = {
      id: `demo-${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Save to demo users list
    existingUsers.push(user);
    localStorage.setItem("rj_demo_users", JSON.stringify(existingUsers));

    this.currentUser = user;
    localStorage.setItem("rj_user", JSON.stringify(user));
    localStorage.setItem("rj_token", `demo-token-${user.id}`);
    this.notifyListeners();
    return user;
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem("rj_token");

    // Try to logout from backend if token exists and is not demo
    if (token && !token.startsWith("demo-")) {
      try {
        await fetch(`${this.apiUrl}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn("Backend logout failed:", error);
      }
    }

    this.currentUser = null;
    localStorage.removeItem("rj_user");
    localStorage.removeItem("rj_token");
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getAuthToken(): string | null {
    return localStorage.getItem("rj_token");
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }
}

export const authService = new AuthService();
export type { User, LoginCredentials, SignupCredentials, AuthResponse };
