import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

const CardContext = React.createContext({});

export const CardContainer = ({
  children,
  className,
  containerClassName,
  ...props
}) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setMousePosition({
      x: (x - centerX) / 20, // Adjust the divisor to control sensitivity
      y: (y - centerY) / 20
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <CardContext.Provider value={{ mousePosition }}>
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative group/card",
          containerClassName
        )}
        {...props}
      >
        {mounted && containerRef.current && (
          <div className={cn("h-full w-full transition-all duration-300", className)}>
            {children}
          </div>
        )}
      </div>
    </CardContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
  ...props
}) => {
  const { mousePosition } = React.useContext(CardContext);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full rounded-xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/[0.2] shadow-lg",
        "transition-all duration-300 ease-out",
        "group-hover/card:shadow-xl group-hover/card:shadow-black/10 dark:group-hover/card:shadow-emerald-500/[0.1]",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${-mousePosition.x * 2}deg)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) => {
  const { mousePosition } = React.useContext(CardContext);
  
  const x = (mousePosition.x * translateZ) / 10;
  const y = (mousePosition.y * translateZ) / 10;

  return (
    <Tag
      className={cn(
        "transition-transform duration-300 ease-out",
        className
      )}
      style={{
        transform: `translateX(${x + translateX}px) translateY(${y + translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Keep the original card components for backward compatibility
export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export function ThreeDCard({ children, className, ...props }) {
  return (
    <CardContainer className={className} {...props}>
      <CardBody>
        {children}
      </CardBody>
    </CardContainer>
  );
}
