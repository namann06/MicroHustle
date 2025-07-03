"use client";
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
      const response = await fetch('http://localhost:8080/api/files/upload', {
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
      
      const response = await fetch('http://localhost:8080/api/tasks', {
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
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Form 
        {...form}
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submit event triggered');
          form.handleSubmit(onSubmit)(e);
        }} 
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl px-16 py-8 space-y-6 border border-gray-200"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800 tracking-tight">Post a Task</h2>
        {success && <div className="text-green-600 text-center mb-4 font-medium">Task posted!</div>}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="posttask-formitem">
                <FormLabel className="posttask-label">Title</FormLabel>
                <FormControl>
                  <Input className="posttask-input" placeholder="Title" {...field} />
                </FormControl>
                <FormMessage className="posttask-formmsg" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="posttask-formitem">
                <FormLabel className="posttask-label">Description</FormLabel>
                <FormControl>
                  <Textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[100px]" placeholder="Describe your task" {...field} />
                </FormControl>
                <FormMessage className="posttask-formmsg" />
              </FormItem>
            )}
          />

          {/* Image Upload Field */}
          <div className="posttask-formitem">
            <label className="posttask-label block text-sm font-semibold text-gray-700 mb-2">
              Task Image (Optional)
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
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
            render={({ field }) => (
              <FormItem className="posttask-formitem">
                <FormLabel className="posttask-label">Tags</FormLabel>
                <FormControl>
                  <Input className="posttask-input" placeholder="Tags (comma separated)" {...field} />
                </FormControl>
                <FormMessage className="posttask-formmsg" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="posttask-formitem">
                <FormLabel className="posttask-label">Budget (₹)</FormLabel>
                <FormControl>
                  <Input className="posttask-input" type="number" placeholder="Budget (₹)" {...field} />
                </FormControl>
                <FormMessage className="posttask-formmsg" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="posttask-formitem">
                <FormLabel className="posttask-label">Deadline</FormLabel>
                <FormControl>
                  <Input className="posttask-input" type="date" placeholder="Deadline" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-gray-400 mb-1">
                  The deadline for your task.
                </FormDescription>
                <FormMessage className="posttask-formmsg" />
              </FormItem>
            )}
          />
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow" 
            type="submit"
            disabled={uploading}
            onClick={(e) => {
              console.log('Submit button clicked');
              // Don't prevent default here, let the form handle it
            }}
          >
            {uploading ? 'Uploading...' : 'Post Task'}
          </Button>
      </Form>
    </div>
  );
}

export default PostTask;