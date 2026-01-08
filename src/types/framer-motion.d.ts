declare module 'framer-motion' {
  import * as React from 'react';

  export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    variants?: any;
  }

  export const motion: {
    div: React.ForwardRefExoticComponent<MotionProps>;
    [key: string]: React.ForwardRefExoticComponent<MotionProps>;
  };

  export const AnimatePresence: React.ComponentType<{
    children: React.ReactNode;
    [key: string]: any;
  }>;

  export default motion;
}
