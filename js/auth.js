/* ---------- MOMENTUM AUTH ----------
   Lightweight, fully client-side account system (no server / no backend).
   Accounts and sessions live in localStorage:
     momentum_users    -> array of { id, name, email, passwordHash, createdAt }
     momentum_session  -> { userId }  (present while someone is logged in)
   All app data (habits, todos, notes, etc.) is then namespaced per user as
   momentum_u<id>_<key>, so two accounts in the same browser never share data.

   NOTE ON SECURITY: because there is no server, this cannot provide real
   protection against someone who has direct access to the browser's storage.
   Passwords are hashed (not stored in plain text) purely to avoid the most
   obvious mistake, but this is a simple, non-cryptographic hash — good enough
   for a local demo app, not a substitute for a real auth backend.
*/
(function(){
  const USERS_KEY = 'momentum_users';
  const SESSION_KEY = 'momentum_session';

  function readJSON(key, fallback){
    try{ const raw = localStorage.getItem(key); return raw !== null ? JSON.parse(raw) : fallback; }
    catch(e){ return fallback; }
  }
  function writeJSON(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  // djb2 string hash — deterministic obfuscation, not real cryptography.
  function simpleHash(str){
    let hash = 5381;
    for(let i=0;i<str.length;i++){ hash = ((hash*33) ^ str.charCodeAt(i)) >>> 0; }
    return hash.toString(16);
  }

  function getUsers(){ return readJSON(USERS_KEY, []); }
  function saveUsers(users){ writeJSON(USERS_KEY, users); }

  function normalizeEmail(email){ return (email||'').trim().toLowerCase(); }

  // Date.now() alone can collide if two signups happen within the same millisecond
  // (e.g. scripted/automated signups); mix in a random suffix so ids never clash.
  function makeUserId(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function findUserByEmail(email){
    const e = normalizeEmail(email);
    return getUsers().find(u=>u.email===e) || null;
  }

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email||'').trim());
  }

  // Returns an error string, or null if the password is strong enough.
  function passwordIssue(pw){
    pw = pw || '';
    if(pw.length < 6) return 'Password must be at least 6 characters.';
    if(!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include both letters and numbers.';
    return null;
  }

  function setSession(userId){ writeJSON(SESSION_KEY, { userId }); }
  function clearSession(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} }
  function getSession(){ return readJSON(SESSION_KEY, null); }

  function currentUser(){
    const s = getSession();
    if(!s) return null;
    return getUsers().find(u=>u.id===s.userId) || null;
  }

  function signup({name, email, password, confirmPassword}){
    name = (name||'').trim();
    email = (email||'').trim();
    if(!name || !email || !password || !confirmPassword){
      return { ok:false, message:'Please fill in every field.' };
    }
    if(!isValidEmail(email)){
      return { ok:false, message:'Enter a valid email address.' };
    }
    const pwIssue = passwordIssue(password);
    if(pwIssue){ return { ok:false, message:pwIssue }; }
    if(password !== confirmPassword){
      return { ok:false, message:'Passwords do not match.' };
    }
    if(findUserByEmail(email)){
      return { ok:false, message:'An account with that email already exists — try logging in instead.' };
    }
    const users = getUsers();
    const user = {
      id: makeUserId(),
      name,
      email: normalizeEmail(email),
      passwordHash: simpleHash(password),
      createdAt: Date.now()
    };
    users.push(user);
    saveUsers(users);
    setSession(user.id);
    return { ok:true, user };
  }

  function login({email, password}){
    email = (email||'').trim();
    if(!email || !password){
      return { ok:false, message:'Please enter your email and password.' };
    }
    if(!isValidEmail(email)){
      return { ok:false, message:'Enter a valid email address.' };
    }
    const user = findUserByEmail(email);
    if(!user){
      return { ok:false, message:'No account found with that email — try signing up instead.' };
    }
    if(user.passwordHash !== simpleHash(password)){
      return { ok:false, message:'Incorrect password. Please try again.' };
    }
    setSession(user.id);
    return { ok:true, user };
  }

  function logout(){
    clearSession();
    window.location.href = 'login.html';
  }

  // Permanently removes the account itself (caller is responsible for clearing
  // that user's namespaced data keys first), then logs out.
  function deleteAccount(userId){
    const users = getUsers().filter(u=>u.id!==userId);
    saveUsers(users);
    clearSession();
    window.location.href = 'login.html';
  }

  // Call on every app page (not login.html). Bounces signed-out visitors back to login.
  function requireAuth(){
    if(!currentUser()){
      window.location.href = 'login.html';
    }
  }

  window.MomentumAuth = {
    signup, login, logout, deleteAccount, currentUser, requireAuth,
    getSession, setSession, findUserByEmail, isValidEmail, passwordIssue
  };
})();
