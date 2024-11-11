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
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { buttonVariants } from "../ui/button";

const RegisterForm = ({
  formType,
  onSubmitRegister,
  setLogin,
  setOpen
}: {
  formType: any;
  onSubmitRegister: any;
  setLogin: any;
  setOpen: any;
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
        
        <FormField
          control={formType.control}
          name="privacidad"
          render={({ field }) => (
            <FormItem>
            <FormControl>
              <Checkbox checked={field.value}
                {...field}
                onCheckedChange={(checked: any) => {
                  field.onChange(checked);
                }}
              />
            </FormControl>
              <FormLabel>Acepto la{' '}
                <Link href={"/politicas-privacidad"} onClick={() => {
                  setLogin(true);
                  setOpen(false);
                }} style={{ color: '#803cec', textDecoration: 'underline' }}>
                   política de privacidad
                </Link>
                </FormLabel>
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
