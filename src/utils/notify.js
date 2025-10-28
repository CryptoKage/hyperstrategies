// src/utils/notify.js

import { toast } from 'react-hot-toast';
import i18n from '../i18n'; // Assuming your i18n instance is exported from here

/**
 * A centralized function to display translated toast notifications.
 * @param {('success'|'error'|'info')} kind - The type of toast to display.
 * @param {string} key - The translation key for the message.
 * @param {object} [values={}] - Optional variables for the translation.
 * @param {object} [opts={}] - Optional options to pass to react-hot-toast.
 */
export function notifyByKey(kind, key, values = {}, opts = {}) {
  // Get the translated message from our i18n files
  const message = i18n.t(key, values);

  const defaultOptions = {
    duration: 5000, // Toasts last for 5 seconds
    position: 'bottom-right',
  };

  const finalOptions = { ...defaultOptions, ...opts };

  switch (kind) {
    case 'success':
      toast.success(message, finalOptions);
      break;
    case 'error':
      toast.error(message, finalOptions);
      break;
    case 'info':
    default:
      toast(message, finalOptions);
      break;
  }
}
