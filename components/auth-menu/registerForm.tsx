import React from "react";
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
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const RegisterForm = ({
  formType,
  onSubmitRegister,
  setLogin,
}: {
  formType: any;
  onSubmitRegister: any;
  setLogin: any;
}) => {
  return (
    <Form {...formType}>
      <form
        onSubmit={formType.handleSubmit(onSubmitRegister)}
        className="space-y-4"
      >
        <FormField
          control={formType.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Introduce tu email..." {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={formType.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <Input
                  placeholder="Introduce tu nombre de usuario..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={formType.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Introduce tu contraseña..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3 justify-between">
          <Button type="submit">Registrarse</Button>
          <div className="flex items-center">
            <span className="text-sm">Ya tienes una cuenta ?</span>
            <Button
              onClick={() => setLogin(true)}
              className="font-bold underline"
              variant={"link"}
            >
              Inicia sesión aquí
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default RegisterForm;
