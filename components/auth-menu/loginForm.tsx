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

const LoginForm = ({
  formType,
  onSubmitLogin,
  setLogin,
}: {
  formType: any;
  onSubmitLogin: any;
  setLogin: any;
}) => {
  return (
    <Form {...formType}>
      <form
        onSubmit={formType.handleSubmit(onSubmitLogin)}
        className="space-y-4"
      >
        <FormField
          control={formType.control}
          name="usernameLogin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Nombre usuario</FormLabel>
              <FormControl>
                <Input
                  placeholder="Introduce tu Email o Nombre de usuario..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={formType.control}
          name="passwordLogin"
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
          <Button type="submit">Iniciar Sesión</Button>
          <div className="flex items-center">
            <span className="text-sm">Sin cuenta?</span>
            <Button
              onClick={() => setLogin(false)}
              className="font-bold underline"
              variant={"link"}
            >
              Crea una cuenta aquí
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
