// UI logic for tabs (Registro / Ingreso)
(function () {
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  function activate(which) {
    const isRegister = which === 'register';
    tabRegister.classList.toggle('active', isRegister);
    tabLogin.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);
    loginForm.classList.toggle('active', !isRegister);
  }

  tabRegister?.addEventListener('click', () => activate('register'));
  tabLogin?.addEventListener('click', () => activate('login'));

  // default
  activate('register');
})();
