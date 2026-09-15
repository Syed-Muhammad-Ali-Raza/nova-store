import { API_URL } from './api';

const logEvent = async (action, metadata = {}) => {
  try {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (!token) return;
    await fetch(`${API_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action, metadata }),
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};

export { logEvent };