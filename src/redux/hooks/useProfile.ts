import { showError, showSuccess } from '@/src/utils/toast';
import { ProfileValidators } from '@/src/utils/validators/profileValidators';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, updateUserProfile } from '../slices/authSlice';
import { AppDispatch, RootState } from '../store';

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const validation = ProfileValidators.validatePhone(phone);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, phone: validation.error || '' }));
      return false;
    }
    return true;
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleUpdateProfile = async (phone: string) => {
    // Clear previous errors
    setErrors({});
    dispatch(clearError());

    // Validate input
    const validation = ProfileValidators.validateProfileUpdate({ phone });
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Show first error in toast
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        showError('Validation Error', firstError);
      }
      
      return { success: false, errors: validation.errors };
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(updateUserProfile({ phone })).unwrap();
      
      showSuccess('Profile Updated', result.message || 'Profile updated successfully');
      
      return { 
        success: true, 
        message: result.message 
      };
    } catch (error: any) {
      return handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (error: any) => {
    let errorMessage = 'Failed to update profile. Please try again.';

    if (error.errors) {
      const apiErrors: Record<string, string> = {};
      Object.entries(error.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          apiErrors[field] = messages[0];
        }
      });
      setErrors(apiErrors);
      
      // Show first error in toast
      const firstError = Object.values(apiErrors)[0];
      if (firstError) {
        showError('Validation Error', firstError);
      }
    } else if (error) {
      errorMessage = error;
      showError('Error', errorMessage);
      
      // Handle authentication errors
      if (error.includes('Unauthenticated') || error.includes('Session expired')) {
        // You could dispatch an action to handle session expiration here
      }
    } else {
      showError('Error', errorMessage);
    }

    return { 
      success: false, 
      message: errorMessage,
      errors 
    };
  };

  return {
    user,
    loading: isLoading || isSubmitting,
    errors,
    apiError: error,
    validatePhone,
    clearFieldError,
    handleUpdateProfile,
  };
};