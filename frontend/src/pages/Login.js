"use client";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "../components/ui/form";
import { cn } from "../lib/utils";
import { apiFetch, setAuthToken } from "../lib/api";

function Login({ setCurrentUser }) {
  const navigate = useNavigate();
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
      const res = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const result = await res.json();
      setAuthToken(result.token);
      setCurrentUser(result.user);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="relative w-full">
      {/* Grid Background */}
      <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )} />
        {/* Radial gradient for the container to give a faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-md p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-3xl border border-neutral-200 bg-neutral-100/80 backdrop-blur-sm p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200 tracking-tight mb-8"
            >
              Welcome Back
            </motion.h2>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 dark:text-red-400 text-center mb-4 font-medium p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Username</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Enter your username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                type="submit"
              >
                Sign In
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;