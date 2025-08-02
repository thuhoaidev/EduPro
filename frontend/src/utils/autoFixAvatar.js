// Script để tự động sửa lỗi avatar
export const autoFixAvatar = async () => {
  console.log('=== AUTO FIX AVATAR ===');

  try {
    // 1. Kiểm tra trạng thái hiện tại
    console.log('1. Checking current status...');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      console.log('   ❌ No token found, cannot proceed');
      return;
    }

    if (!userStr) {
      console.log('   ❌ No user data found, cannot proceed');
      return;
    }

    const user = JSON.parse(userStr);
    console.log('   ✅ Current user:', user.fullname);
    console.log('   Current avatar:', user.avatar);

    // 2. Kiểm tra avatar logic
    const isValidAvatar = user.avatar &&
      user.avatar !== 'default-avatar.jpg' &&
      user.avatar !== '' &&
      (user.avatar.includes('googleusercontent.com') || user.avatar.startsWith('http'));

    console.log('   Is valid avatar:', isValidAvatar);

    // 3. Nếu avatar không hợp lệ, force refresh
    if (!isValidAvatar) {
      console.log('2. Avatar is invalid, forcing refresh...');
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Fresh user data:', data.user);

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('   ✅ Updated localStorage');

        // Trigger event
        window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: data.user } }));
        console.log('   ✅ Triggered user-updated event');

        // Check if new avatar is valid
        const newIsValidAvatar = data.user.avatar &&
          data.user.avatar !== 'default-avatar.jpg' &&
          data.user.avatar !== '' &&
          (data.user.avatar.includes('googleusercontent.com') || data.user.avatar.startsWith('http'));

        console.log('   New avatar is valid:', newIsValidAvatar);

        if (newIsValidAvatar) {
          console.log('3. ✅ Avatar fixed successfully!');
          console.log('   New avatar URL:', data.user.avatar);
          
          // Force page refresh after 2 seconds
          setTimeout(() => {
            console.log('4. Refreshing page to apply changes...');
            window.location.reload();
          }, 2000);
        } else {
          console.log('3. ❌ Avatar still invalid after refresh');
        }
      } else {
        console.log('   ❌ Failed to refresh user data:', response.status);
      }
    } else {
      console.log('2. ✅ Avatar is already valid, no fix needed');
    }

  } catch (error) {
    console.error('❌ Error in autoFixAvatar:', error);
  }

  console.log('=== END AUTO FIX AVATAR ===');
};

// Export cho browser console
if (typeof window !== 'undefined') {
  window.autoFixAvatar = autoFixAvatar;
} 