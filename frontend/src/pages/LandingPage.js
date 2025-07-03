import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export function LandingPage() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/register');
  };

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
        
        {/* Hero Content */}
        <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center justify-start pt-20">
          <div className="px-4 py-10 md:py-20">
            <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold text-slate-800 md:text-5xl lg:text-7xl dark:text-slate-200">
              {"Find & Complete Micro Tasks".split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="relative z-10 mx-auto max-w-2xl py-6 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
            >
              Earn money by completing small tasks or get things done quickly by posting your tasks.
              Join our community of hustlers and posters today!
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1 }}
              className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={handleGetStarted}
                className="w-60 transform rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                I already have an account
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.2 }}
              className="relative z-10 mt-10 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                  alt="People collaborating"
                  className="aspect-[16/9] h-auto w-full object-cover"
                  height={1000}
                  width={1000}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
