// Test script để kiểm tra avatar loading
export const testAvatarLoading = () => {
  console.log('=== TEST AVATAR LOADING ===');

  // Test 1: Kiểm tra localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  console.log('1. LocalStorage check:');
  console.log('   Token:', token ? '✅ Có token' : '❌ Không có token');
  console.log('   User string:', userStr ? '✅ Có user data' : '❌ Không có user data');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('   Parsed user:', user);
      console.log('   User avatar:', user.avatar);
      console.log('   User fullname:', user.fullname);

      // Test 2: Kiểm tra avatar logic
      console.log('\n2. Avatar logic check:');
      const isValidAvatar = user.avatar &&
        user.avatar !== 'default-avatar.jpg' &&
        user.avatar !== '' &&
        (user.avatar.includes('googleusercontent.com') || user.avatar.startsWith('http'));

      console.log('   Is valid avatar (logic):', isValidAvatar);
      console.log('   Avatar URL length:', user.avatar?.length);
      console.log('   Is Google avatar:', user.avatar?.includes('googleusercontent.com'));
      console.log('   Is valid URL:', user.avatar?.startsWith('http'));

      // Test 3: Test image loading
      if (isValidAvatar) {
        console.log('\n3. Image loading test:');
        const img = new Image();
        img.onload = () => {
          console.log('   ✅ Avatar loads successfully');
          console.log('   Image dimensions:', img.width, 'x', img.height);
        };
        img.onerror = () => {
          console.log('   ❌ Avatar failed to load');
        };
        img.src = user.avatar;
      }

      // Test 4: Test UI Avatars fallback
      console.log('\n4. UI Avatars fallback test:');
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=4f8cff&color=fff&size=256`;
      console.log('   Fallback URL:', fallbackUrl);
      
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        console.log('   ✅ Fallback avatar loads successfully');
      };
      fallbackImg.onerror = () => {
        console.log('   ❌ Fallback avatar failed to load');
      };
      fallbackImg.src = fallbackUrl;

    } catch (error) {
      console.error('   ❌ Error parsing user data:', error);
    }
  }

  console.log('\n=== END TEST ===');
};

// Export cho browser console
if (typeof window !== 'undefined') {
  window.testAvatarLoading = testAvatarLoading;
} 