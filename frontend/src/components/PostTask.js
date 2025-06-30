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
    deadline: z.string().min(1, "A deadline is required.")
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

  async function onSubmit(data) {
    setSuccess(false);
    await fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        poster: { id: currentUser.id }
      })
    });
    setSuccess(true);
    form.reset();
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl bg-white shadow-xl rounded-2xl px-16 py-8 space-y-6 border border-gray-200">
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
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow" type="submit">Post Task</Button>
        </form>
      </Form>
    </div>
  );
}

export default PostTask;