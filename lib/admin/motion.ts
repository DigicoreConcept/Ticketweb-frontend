export const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
};

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.15 }
};

export const SLIDE_RIGHT = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2, ease: "easeOut" }
};

export const STAGGER = {
  animate: { transition: { staggerChildren: 0.05 } }
};

export const SCALE_TAP = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.01 }
};

export const SPRING = {
  type: "spring", stiffness: 300, damping: 28
};
