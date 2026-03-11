import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-bg-elevated-4 border border-border rounded-lg
        backdrop-blur
        ${hover ? 'hover:bg-bg-elevated-3 hover:border-border-hover transition-colors duration-200' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
