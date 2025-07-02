"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "../components/ui/form";

function Register({ setCurrentUser }) {
  const FormSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    role: z.enum(["POSTER", "HUSTLER"])
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: '', password: '', role: 'POSTER' },
  });
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function onSubmit(data) {
    setSuccess(false);
    setError(null);
    try {
      console.log('Submitting registration data:', data);
      const res = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Registration failed with status:', res.status, 'Error:', errorText);
        throw new Error(`Registration failed: ${errorText}`);
      }
      
      const user = await res.json();
      console.log('Registration successful, user:', user);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800 tracking-tight">Register</h2>
        {success && <div className="text-green-600 text-center mb-4 font-medium">Registration successful! You are now logged in.</div>}
        {error && <div className="text-red-600 text-center mb-4 font-medium">{error}</div>}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Username</FormLabel>
                <FormControl>
                  <Input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Username" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1">{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1">{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Role</FormLabel>
                <FormControl>
                  <select {...field} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                    <option value="POSTER">Poster</option>
                    <option value="HUSTLER">Hustler</option>
                  </select>
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow" type="submit">Register</Button>
        </form>
      </div>
    </div>
  );
}

export default Register;