"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "../components/ui/form";

function Login({ setCurrentUser }) {
  const FormSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: '', password: '' },
  });
  const [error, setError] = React.useState(null);

  async function onSubmit(data) {
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 space-y-6">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800 tracking-tight">Login</h2>
          {error && <div className="text-red-600 text-center mb-4 font-medium">{error}</div>}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Username</FormLabel>
                <FormControl>
                  <Input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Username" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow" type="submit">Login</Button>
      </Form>
    </div>
  );
}

export default Login;