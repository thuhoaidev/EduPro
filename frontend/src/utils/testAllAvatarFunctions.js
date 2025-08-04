// Script để test tất cả các function avatar
export const testAllAvatarFunctions = async () => {
  console.log('=== TEST ALL AVATAR FUNCTIONS ===');

  // Test 1: Debug avatar
  console.log('\n1. Testing debugAvatar...');
  if (typeof window.debugAvatar === 'function') {
    window.debugAvatar();
  } else {
    console.log('   ❌ debugAvatar function not found');
  }

  // Test 2: Test avatar loading
  console.log('\n2. Testing testAvatarLoading...');
  if (typeof window.testAvatarLoading === 'function') {
    window.testAvatarLoading();
  } else {
    console.log('   ❌ testAvatarLoading function not found');
  }

  // Test 3: Force refresh user
  console.log('\n3. Testing forceRefreshUser...');
  if (typeof window.forceRefreshUser === 'function') {
    try {
      const result = await window.forceRefreshUser();
      console.log('   ✅ Force refresh completed:', result);
    } catch (error) {
      console.log('   ❌ Force refresh failed:', error);
    }
  } else {
    console.log('   ❌ forceRefreshUser function not found');
  }

  // Test 4: Profile force refresh
  console.log('\n4. Testing profileForceRefresh...');
  if (typeof window.profileForceRefresh === 'function') {
    try {
      await window.profileForceRefresh();
      console.log('   ✅ Profile force refresh completed');
    } catch (error) {
      console.log('   ❌ Profile force refresh failed:', error);
    }
  } else {
    console.log('   ❌ profileForceRefresh function not found');
  }

  console.log('\n=== END TEST ALL AVATAR FUNCTIONS ===');
};

// Export cho browser console
if (typeof window !== 'undefined') {
  window.testAllAvatarFunctions = testAllAvatarFunctions;
} 