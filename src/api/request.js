// src/api/request.js

import api from './api'; // We will still use our configured axios instance
import { notifyByKey } from '../utils/notify';
import i18n from '../i18n';

/**
 * A global wrapper for all API requests that automatically handles
 * success and error toast notifications.
 * @param {string} url - The API endpoint to call.
 * @param {object} options - The options for the axios request (method, body, etc.).
 * @returns {Promise<any>} - The data from the successful response.
 * @throws {Error} - An error with a translated message if the request fails.
 */
export async function request(url, options = {}) {
  try {
    const response = await api({
      url,
      ...options,
    });

    const data = response.data;

    // If the backend sends a success code, show a success toast.
    if (data && data.ok && data.code) {
      // The key will look for a translation like "toasts.PROFILE_SAVED"
      notifyByKey('success', `toasts.${data.code}`, data.params);
    }

    return data;

  } catch (error) {
    const errorData = error.response?.data;

    // If the backend sends an error code, show a specific error toast.
    if (errorData && !errorData.ok && errorData.code) {
      // The key will look for a translation like "errors.USERNAME_TAKEN"
      const key = `errors.${errorData.code}`;
      const values = errorData.params || {};
      notifyByKey('error', key, values);
      // Throw a new error with the translated message for the component to handle if needed
      throw new Error(i18n.t(key, values));
    }

    // Fallback for generic network errors or non-standard responses
    const genericErrorKey = 'errors.GENERIC_NETWORK';
    notifyByKey('error', genericErrorKey);
    throw new Error(i18n.t(genericErrorKey));
  }
}
