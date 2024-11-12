"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { ReactNode, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const crypto = require("crypto");

const registerSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  privacidad: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar la política de privacidad para continuar.",
  }),
});

const loginSchema = z.object({
  usernameLogin: z.string().min(3, {
    message: "El nombre de usuario / e-mail debe tener al menos 3 caracteres.",
  }),
  passwordLogin: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import RegisterForm from "./registerForm";
import LoginForm from "./loginForm";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../../app/contexts/UserContext";

interface AuthMenuProps {
  children: ReactNode; // `children` puede ser cualquier tipo de contenido renderizable
}

const AuthMenu: React.FC<AuthMenuProps> = ({ children }) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState(true);

  const { login: loginUser } = useUser();

  const formRegister = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  function hashPassword(password: string) {
    const hash = crypto.createHash("sha256"); // Usamos SHA-256
    hash.update(password); // Actualiza el hash con la contraseña
    const hashedPassword = hash.digest("hex"); // Devuelve el hash en formato hexadecimal
    return hashedPassword;
  }

  const onSubmitRegister = async (
    dataRegister: z.infer<typeof registerSchema>
  ) => {
    let hashedPassword = hashPassword(dataRegister.password);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: dataRegister.username,
            pass: hashedPassword,
            email: dataRegister.email,
            privacidad: dataRegister.privacidad,
          }),
        }
      );

      if (response.ok) {
        setLogin(true);
        formRegister.reset({
          username: "",
          email: "",
          password: "",
          privacidad: false,
        });
        toast({ title: "Te has registrado correctamente" });
      } else {
        let errorData = await response.json();
        toast({
          title: "Error",
          variant: "destructive",
          description: errorData.message,
        });
        console.log(errorData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmitLogin = async (dataLogin: z.infer<typeof loginSchema>) => {
    let hashedPassword = hashPassword(dataLogin.passwordLogin);
    try {
      // usuario, pass

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: dataLogin.usernameLogin,
          pass: hashedPassword,
        }),
      });

      if (response.ok) {
        toast({ title: "Has iniciado sesión correctamente" });
        let data = await response.json();
        loginUser(data.token);
      } else {
        let errorData = await response.json();
        toast({
          title: "Error",
          variant: "destructive",
          description: errorData.message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {login ? "INICIAR SESIÓN" : "REGISTRARSE"}
          </DialogTitle>
        </DialogHeader>
        {!login ? (
          <RegisterForm
            setOpen={setOpen}
            formType={formRegister}
            onSubmitRegister={onSubmitRegister}
            setLogin={setLogin}
          />
        ) : (
          <LoginForm
            formType={formLogin}
            onSubmitLogin={onSubmitLogin}
            setLogin={setLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthMenu;
