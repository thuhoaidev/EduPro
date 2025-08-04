// Debug script để kiểm tra user data
export const debugUserData = (user: any) => {
  console.log('=== DEBUG USER DATA ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('User role type:', typeof user?.role);
  console.log('User role name:', user?.role?.name);
  console.log('User role permissions:', user?.role?.permissions);
  console.log('User role permissions length:', user?.role?.permissions?.length);
  console.log('=== END DEBUG ===');
};

export const debugPermissionCheck = (user: any, permission: string) => {
  console.log('=== DEBUG PERMISSION CHECK ===');
  console.log('Checking permission:', permission);
  console.log('User role name:', user?.role?.name);
  console.log('User role permissions:', user?.role?.permissions);
  console.log('Has permission:', user?.role?.permissions?.includes(permission));
  console.log('=== END DEBUG ===');
};

// Debug avatar
export const debugAvatar = () => {
  console.log('=== DEBUG AVATAR ===');

  // Kiểm tra localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  console.log('Token:', token ? '✅ Có token' : '❌ Không có token');
  console.log('User string:', userStr);

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      console.log('User avatar:', user.avatar);
      console.log('User fullname:', user.fullname);
      console.log('User email:', user.email);

      // Test avatar URL
      if (user.avatar) {
        console.log('Avatar URL length:', user.avatar.length);
        console.log('Is Google avatar:', user.avatar.includes('googleusercontent.com'));
        console.log('Is valid URL:', user.avatar.startsWith('http'));

        // Test avatar logic
        const isValidAvatar = user.avatar &&
          user.avatar !== 'default-avatar.jpg' &&
          user.avatar !== '' &&
          (user.avatar.includes('googleusercontent.com') || user.avatar.startsWith('http'));

        console.log('Is valid avatar (logic):', isValidAvatar);

        if (isValidAvatar) {
          // Test if avatar loads
          const img = new Image();
          img.onload = () => {
            console.log('✅ Avatar loads successfully');
          };
          img.onerror = () => {
            console.log('❌ Avatar failed to load');
          };
          img.src = user.avatar;
        }
      } else {
        console.log('❌ No avatar URL found');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  console.log('=== END DEBUG ===');
};

// Force refresh user data
export const forceRefreshUser = async () => {
  console.log('=== FORCE REFRESH USER ===');

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token found');
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ User data from API:', data);

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Updated localStorage');

      // Trigger event
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: data.user } }));
      console.log('✅ Triggered user-updated event');

      return data.user;
    } else {
      console.log('❌ API error:', response.status);
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
  }
};

// Export cho browser console
if (typeof window !== 'undefined') {
  window.debugAvatar = debugAvatar;
  window.forceRefreshUser = forceRefreshUser;
} 