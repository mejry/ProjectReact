export const handleApiError = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };
  
  export const validateForm = (data, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];
      
      if (fieldRules.required && !value) {
        errors[field] = `${field} is required`;
      }
      
      if (fieldRules.email && !/\S+@\S+\.\S+/.test(value)) {
        errors[field] = 'Please enter a valid email';
      }
      
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
      }
      
      if (fieldRules.match && value !== data[fieldRules.match]) {
        errors[field] = `${field} must match ${fieldRules.match}`;
      }
    });
    
    return errors;
  };
  
  export const formatDate = (date, options = {}) => {
    const defaultOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
  };