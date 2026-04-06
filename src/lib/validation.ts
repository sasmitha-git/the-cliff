// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: "Email is required" };
  if (!emailRegex.test(email)) return { valid: false, error: "Invalid email format" };
  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) return { valid: false, error: "Password is required" };
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters" };
  return { valid: true };
};

// Username validation
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username) return { valid: false, error: "Username is required" };
  if (username.length < 3) return { valid: false, error: "Username must be at least 3 characters" };
  if (username.length > 30) return { valid: false, error: "Username must be less than 30 characters" };
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, underscores, and hyphens" };
  }
  return { valid: true };
};

// Stream title validation
export const validateStreamTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title) return { valid: false, error: "Stream title is required" };
  if (title.length < 3) return { valid: false, error: "Title must be at least 3 characters" };
  if (title.length > 100) return { valid: false, error: "Title must be less than 100 characters" };
  return { valid: true };
};

// Form validation helper
export const validateForm = (fields: Record<string, string>, validators: Record<string, (value: string) => { valid: boolean; error?: string }>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(validators).forEach(([field, validator]) => {
    const result = validator(fields[field] || "");
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  });

  return errors;
};
