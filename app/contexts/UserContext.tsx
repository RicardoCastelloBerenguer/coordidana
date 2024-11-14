"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { jwtDecode } from "jwt-decode";
import { boolean } from "zod";

interface JwtPayload {
  id: number;
  rol: string;
  nombre: string;
  exp?: number;
}

interface User {
  id: number | null;
  nombre: string;
  // email: string;
  password?: string | null;
  rol: string;
}

interface UserType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  checkIsLoggedIn: () => void;
  logout: () => void;
  login: (userData: any) => void; // Cambia esto para aceptar un argumento
  isLoggedIn: boolean;
  isLoading: boolean;
  location: {};
  userWithRole: (rol: string) => boolean;
  saveLocationLocalStorage: (location: {
    latitude: number;
    longitude: number;
  }) => void;
}

const defaultUser: User = {
  id: null,
  nombre: "",
  password: null,
  rol: "user",
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
  userWithRole: (rol: string) => false,
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
    const tokenData = localStorage.getItem("token");
    if (tokenData) {
      setIsLoggedIn(true);
      decodeJwtAndSave(tokenData);
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  const decodeJwtAndSave = (jwt: string) => {
    const decoded = jwtDecode<JwtPayload>(jwt);

    setUser({ id: decoded.id, rol: decoded.rol, nombre: decoded.nombre });
  };

  const userWithRole = (rol: string) => {
    if (user.rol === rol) return true;
    return false;
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

  const login = (tokenData: string) => {
    setIsLoading(true);
    localStorage.setItem("token", tokenData);
    try {
      const user = decodeJwtAndSave(tokenData);
      window.location.reload();
      return user;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem("token");
    setUser(defaultUser);
    setIsLoggedIn(false);
    setIsLoading(false);
    window.location.reload();
  };

  const saveLocationLocalStorage = (location: {
    latitude: number;
    longitude: number;
  }) => {
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
    userWithRole,
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
