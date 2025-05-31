// Utility script to reset admin account and clear lockouts
// Run this in the browser console to reset admin access

export const resetAdminAccount = () => {
  console.log('🔧 Resetting admin account...')
  
  // Clear all login attempts (removes lockout)
  localStorage.removeItem('vertirix-login-attempts')
  console.log('✅ Cleared login attempts')
  
  // Clear existing users and passwords
  localStorage.removeItem('vertirix-users')
  localStorage.removeItem('vertirix-passwords')
  console.log('✅ Cleared existing data')
  
  // Clear any existing sessions
  localStorage.removeItem('vertirix-session')
  console.log('✅ Cleared sessions')
  
  console.log('🔄 Admin account reset complete!')
  console.log('📝 Please refresh the page to initialize the new admin account')
  console.log('🔐 Admin credentials:')
  console.log('   Email: admin@vertirix.com')
  console.log('   Password: Vx#2024!SecureAdmin@Portal')
  
  return true
}

// Instructions for use
console.log(`
🔓 To reset the admin account and clear lockouts:

1. Copy and paste this in your browser console:

localStorage.removeItem('vertirix-login-attempts');
localStorage.removeItem('vertirix-users');
localStorage.removeItem('vertirix-passwords');
localStorage.removeItem('vertirix-session');
location.reload();

2. After the page reloads, login with:
   Email: admin@vertirix.com
   Password: Vx#2024!SecureAdmin@Portal
`) 