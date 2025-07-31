// Script để clear cache và force refresh
export const clearCacheAndRefresh = async () => {
  console.log('=== CLEAR CACHE AND REFRESH ===');

  try {
    // 1. Clear localStorage
    console.log('1. Clearing localStorage...');
    const token = localStorage.getItem('token');
    localStorage.removeItem('user');
    console.log('   ✅ Cleared user data from localStorage');

    // 2. Force refresh user data
    console.log('2. Force refreshing user data...');
    if (token) {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Fresh user data from API:', data.user);

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('   ✅ Updated localStorage with fresh data');

        // Trigger event
        window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: data.user } }));
        console.log('   ✅ Triggered user-updated event');

        // 3. Force page refresh
        console.log('3. Force refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return data.user;
      } else {
        console.log('   ❌ API error:', response.status);
      }
    } else {
      console.log('   ❌ No token found');
    }
  } catch (error) {
    console.error('   ❌ Error:', error);
  }

  console.log('=== END CLEAR CACHE AND REFRESH ===');
};

// Export cho browser console
if (typeof window !== 'undefined') {
  window.clearCacheAndRefresh = clearCacheAndRefresh;
} 