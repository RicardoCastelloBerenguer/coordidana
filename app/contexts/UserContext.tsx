"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  email: string;
  password: string;
}

interface UserType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  checkIsLoggedIn: () => void;
  logout: () => void;
  login: (userData: any) => void; // Cambia esto para aceptar un argumento
  isLoggedIn: boolean;
  isLoading: boolean;
  location: {};
  saveLocationLocalStorage: (location: { latitude: number; longitude: number }) => void;
}

const defaultUser: User = {
  email: "",
  password: "",
};

const defaultValue: UserType = {
  user: defaultUser,
  setUser: () => {},
  checkIsLoggedIn: () => {},
  logout: () => {},
  login: () => {},
  isLoggedIn: false,
  location: {},
  isLoading: false,
  saveLocationLocalStorage: () => {},
};

const UserContext = createContext<UserType | undefined>(defaultValue);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({});
  const [locationChecked, setLocationChecked] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (!isLoggedIn) {
      checkIsLoggedIn();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!locationChecked && Object.keys(location).length === 0) {
      checkLocation();
      setLocationChecked(true); // Marca que la verificación de ubicación ya se hizo
    }
  }, [location, locationChecked]);

  const checkIsLoggedIn = () => {
    setIsLoading(true);
    const isLoggedin = localStorage.getItem("currentUser");
    if (isLoggedin) {
      setIsLoggedIn(true);
      setUser(JSON.parse(isLoggedin));
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
      setUser(defaultUser);
      setIsLoading(false);
    }
  };

  const checkLocation = async () => {
    setIsLoading(true);
    const locationCache = await localStorage.getItem("location");
    if (locationCache) {
      setLocation(JSON.parse(locationCache));
    } else {
      setLocation({}); // o manejar cuando no haya ubicación almacenada
    }
    setIsLoading(false);
  };

  const login = (userData: User) => {
    setIsLoading(true);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setIsLoading(false);
    window.location.reload();
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem("currentUser");
    setUser(defaultUser);
    setIsLoggedIn(false);
    setIsLoading(false);
    window.location.reload();
  };

  const saveLocationLocalStorage = (location: { latitude: number; longitude: number }) => {
    localStorage.setItem("location", JSON.stringify(location));
    setLocation(location);
  };

  const updateLocationLocalStorage = (location: {
    latitude: number;
    longitude: number;
  }) => {
    localStorage.setItem("location", JSON.stringify(location));
  };

  const contextValue: UserType = {
    user,
    setUser,
    checkIsLoggedIn,
    logout,
    isLoggedIn,
    isLoading,
    login,
    location,
    saveLocationLocalStorage,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
