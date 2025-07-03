// Utility để debug token

export const debugToken = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');

  console.log('=== DEBUG TOKEN ===');
  console.log('Token exists:', !!token);
  console.log('Refresh token exists:', !!refreshToken);
  console.log('User exists:', !!user);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('Token payload:', payload);
      console.log('Current time:', new Date(currentTime * 1000).toLocaleString());
      console.log('Token expires at:', new Date(payload.exp * 1000).toLocaleString());
      console.log('Time until expiry (seconds):', timeUntilExpiry);
      console.log('Time until expiry (minutes):', timeUntilExpiry / 60);
      console.log('Token is valid:', timeUntilExpiry > 0);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  console.log('=== END DEBUG ===');
};

export const clearAllTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  console.log('All tokens cleared');
};

export const testTokenValidity = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found');
    return false;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('Token is valid');
      return true;
    } else {
      console.log('Token is invalid, status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing token:', error);
    return false;
  }
}; 