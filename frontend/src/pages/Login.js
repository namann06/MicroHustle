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
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white shadow-xl rounded-2xl px-16 py-8 border border-gray-200"
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-3xl font-extrabold text-center text-indigo-800 tracking-tight mb-8"
              >
                Welcome Back
              </motion.h2>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-center mb-4 font-medium p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  {error}
                </motion.div>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Username</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
                        placeholder="Enter your username" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow" 
                type="submit"
              >
                Sign In
              </Button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
  );
}

export default Login;