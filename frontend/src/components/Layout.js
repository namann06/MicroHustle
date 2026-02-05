import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "../lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

// Navbar Components
const Navbar = ({ children, className, ...props }) => {
  const ref = React.useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { visible })
          : child
      )}
    </motion.div>
  );
};

const NavBody = ({ children, className, visible, ...props }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: "none",
        boxShadow: "none",
        width: "100%", // Keep full width to prevent overlapping
        y: visible ? 0 : 0, // Remove vertical shift to prevent layout issues
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-[70] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-3 lg:flex",
        "bg-transparent dark:bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const NavItems = ({ items, className, ...props }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-4 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex overflow-hidden",
        className
      )}
      {...props}
    >
      {items.map((item, idx) => (
        <div key={`nav-item-container-${idx}`} className="relative inline-block flex-shrink-0">
          <button
            onMouseEnter={() => setHovered(idx)}
            onClick={(e) => {
              e.preventDefault();
              if (item.onClick) {
                item.onClick();
              }
            }}
            className={cn(
              "relative px-4 py-2.5 text-gray-800 dark:text-white cursor-pointer border-none bg-transparent transition-all duration-200 whitespace-nowrap font-semibold hover:text-indigo-600 dark:hover:text-indigo-400",
              item.badge ? "pr-8" : ""
            )}
            key={`link-${idx}`}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-lg bg-indigo-100 dark:bg-indigo-900/30 shadow-lg" />
            )}
            <span className="relative z-20">{item.name}</span>
          </button>
          {item.badge && (
            <span className="absolute -top-1 -right-0 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center z-30">
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
};

const MobileNav = ({ children, className, visible, ...props }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: "none",
        boxShadow: "none",
        width: "100%", // Keep full width on mobile
        paddingRight: "16px",
        paddingLeft: "16px",
        borderRadius: "0px",
        y: visible ? 0 : 0, // Remove vertical shift
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-60 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-4 py-3 lg:hidden",
        "bg-transparent dark:bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const MobileNavHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("flex w-full flex-row items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const MobileNavMenu = ({ children, className, isOpen, onClose, ...props }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute left-0 right-0 top-full z-[80] mt-2 w-full rounded-lg bg-white p-4 shadow-lg dark:bg-neutral-950 max-h-[70vh] overflow-y-auto",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "px-5 py-2.5 rounded-lg text-sm font-semibold relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200 inline-block text-center shadow-lg";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/40",
    secondary: "bg-white/90 text-gray-800 hover:bg-white hover:text-gray-900 shadow-black/10 border border-gray-200",
    dark: "bg-gray-900 text-white hover:bg-black shadow-black/30 border border-gray-700",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default function Layout({ children, currentUser, onLogout, unreadNotificationCount, unreadInboxCount }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Home', link: '/', onClick: () => navigate('/') },
    { name: 'Browse Tasks', link: '/browse', onClick: () => navigate('/browse') },
    currentUser?.role === 'POSTER' && { name: 'Post Task', link: '/post', onClick: () => navigate('/post') },
    currentUser?.role === 'POSTER' && { name: 'My Tasks', link: '/posterTasks', onClick: () => navigate('/posterTasks') },
    currentUser?.role === 'HUSTLER' && { name: 'My Tasks', link: '/hustlerTasks', onClick: () => navigate('/hustlerTasks') },
    currentUser && { 
      name: 'Inbox', 
      link: currentUser?.role === 'POSTER' ? '/posterInbox' : '/hustlerInbox', 
      onClick: () => navigate(currentUser?.role === 'POSTER' ? '/posterInbox' : '/hustlerInbox'), 
      badge: unreadInboxCount > 0 ? unreadInboxCount : null 
    },
    currentUser?.role === 'POSTER' && { 
      name: 'Notifications', 
      link: '/notifications', 
      onClick: () => navigate('/notifications'), 
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null 
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Navbar>
        <NavBody>
          <button 
            onClick={() => navigate('/')} 
            className="relative z-20 flex items-center space-x-2 px-3 py-2 text-sm font-normal text-black dark:text-white border-none bg-transparent cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">MicroHustle</span>
          </button>
          
          <NavItems 
            items={navItems}
          />
          
          <div className="relative z-20 flex items-center space-x-2">
            {currentUser ? (
              <>
                <NavbarButton 
                  variant="dark" 
                  onClick={() => {
                    navigate(`/profile/${currentUser.username}`);
                    setMobileMenuOpen(false);
                  }}
                >
                  Profile
                </NavbarButton>
                <NavbarButton 
                  variant="secondary" 
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton 
                  variant="secondary" 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </NavbarButton>
                <NavbarButton 
                  variant="primary" 
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <button 
              onClick={() => navigate('/')} 
              className="relative z-20 flex items-center space-x-2 px-3 py-2 text-sm font-normal text-black dark:text-white border-none bg-transparent cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">MicroHustle</span>
            </button>
            <button 
              className="p-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>
          </MobileNavHeader>
          
          <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
            <div className="flex flex-col space-y-2">
              {navItems.map((item, idx) => (
                <button
                  key={`mobile-link-${idx}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800 border-none bg-transparent"
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              
              <div className="mt-4 flex flex-col space-y-2 border-t border-gray-200 pt-4 dark:border-neutral-800">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(`/profile/${currentUser.username}`);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:hover:bg-neutral-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:hover:bg-neutral-800"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
