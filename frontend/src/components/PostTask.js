"use client";
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { cn } from "../lib/utils";
import { apiFetch } from "../lib/api";

function PostTask({ currentUser }) {
  const FormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    tags: z.string().optional(),
    budget: z.string().min(1, "Budget is required"),
    deadline: z.string().min(1, "A deadline is required."),
    image: z.any().optional()
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      budget: '',
      deadline: ''
    },
  });
  const [success, setSuccess] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  // Debug: Check if currentUser is available
  console.log('PostTask component - currentUser:', currentUser);
  
  if (!currentUser) {
    console.error('PostTask: No currentUser provided');
    return <div className="text-red-600 text-center p-4">Error: User not logged in</div>;
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async (imageFile) => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await apiFetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const imageUrl = await response.text();
        console.log('Image uploaded successfully:', imageUrl);
        return imageUrl;
      } else {
        console.error('Image upload failed:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  async function onSubmit(data) {
    console.log('PostTask onSubmit - START');
    console.log('PostTask onSubmit - data:', data);
    console.log('PostTask onSubmit - currentUser:', currentUser);
    
    // Get user from localStorage as backup
    let userToUse = currentUser;
    if (!userToUse) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        userToUse = JSON.parse(storedUser);
        console.log('Using stored user:', userToUse);
      }
    }
    
    if (!userToUse) {
      console.error('PostTask onSubmit - No user available');
      alert('Error: User not logged in. Please refresh and try again.');
      return;
    }
    
    setSuccess(false);
    setUploading(true);
    try {
      // Upload image first if selected
      let imageUrl = null;
      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          setUploading(false);
          return;
        }
      }

      const taskData = {
        title: data.title,
        description: data.description,
        tags: data.tags || '',
        budget: data.budget,
        deadline: data.deadline,
        imageUrl: imageUrl,
        poster: { id: userToUse.id }
      };
      
      console.log('Sending task data:', taskData);
      
      const response = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Task posted successfully:', result);
        setSuccess(true);
        setUploading(false);
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        const errorText = await response.text();
        console.error('Failed to post task:', response.statusText, 'Error:', errorText);
        alert('Failed to post task. Please try again.');
        setUploading(false);
      }
    } catch (error) {
      console.error('Error posting task:', error);
      alert('Network error. Please check your connection and try again.');
      setUploading(false);
    }
    
    console.log('PostTask onSubmit - END');
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
        
        {/* Post Task Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-2xl p-8"
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
              Post a Task
            </motion.h2>
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-600 dark:text-green-400 text-center mb-4 font-medium p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                Task posted successfully!
              </motion.div>
            )}
            <Form 
              {...form}
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submit event triggered');
                form.handleSubmit(onSubmit)(e);
              }} 
              className="space-y-6"
            >

              <FormField
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Title</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" 
                        placeholder="Enter task title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all min-h-[100px]" 
                        placeholder="Describe your task in detail" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Image Upload Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Task Image (Optional)
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-xs h-48 object-cover rounded-lg border border-neutral-300 dark:border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Tags</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" 
                        placeholder="Enter tags (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Budget (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" 
                        placeholder="Enter budget amount" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Deadline</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Select the deadline for your task completion.
                    </FormDescription>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                type="submit"
                disabled={uploading}
                onClick={(e) => {
                  console.log('Submit button clicked');
                  // Don't prevent default here, let the form handle it
                }}
              >
                {uploading ? 'Posting Task...' : 'Post Task'}
              </Button>
            </Form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default PostTask;