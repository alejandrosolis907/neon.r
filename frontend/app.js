(function () {
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const codeForm = document.getElementById('code-form');
  const currencySection = document.getElementById('currency-section');
  const currencySelect = document.getElementById('currency-select');
  const amountInput = document.getElementById('amount');
  const buyBtn = document.getElementById('buy-btn');
  const title = document.getElementById('title');
  const toast = document.getElementById('toast');
  const neoBalance = document.getElementById('neo-balance');
  const currencyDisplay = document.getElementById('currency-display');
  const rateDiv = document.getElementById('rate');

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let currentEmail = null;
  let currentUser = null;

  function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function activate(which) {
    const isRegister = which === 'register';
    tabRegister.classList.toggle('active', isRegister);
    tabLogin.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);
    loginForm.classList.toggle('active', !isRegister);
    codeForm.classList.remove('active');
  }

  tabRegister?.addEventListener('click', () => activate('register'));
  tabLogin?.addEventListener('click', () => activate('login'));
  activate('register');

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  const displayNames = new Intl.DisplayNames(['es'], { type: 'currency' });
  Intl.supportedValuesOf('currency').forEach(code => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} - ${displayNames.of(code)}`;
    currencySelect.appendChild(option);
  });
  currencySelect.value = 'USD';

  function showCurrency() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'none';
    codeForm.style.display = 'none';
    document.querySelector('.tabs').style.display = 'none';
    currencySection.style.display = 'block';
  }

  function updateBalance() {
    neoBalance.textContent = `${currentUser.balance} NEO`;
  }

  function updateCurrencyUI() {
    const cur = currentUser?.currency || currencySelect.value || 'USD';
    amountInput.placeholder = `Cantidad en ${cur}`;
    rateDiv.textContent = `1 ${cur} = 4 NEO`;
    currencyDisplay.textContent = `Divisa: ${cur}`;
    const hasCurrency = !!currentUser?.currency;
    currencyDisplay.style.display = hasCurrency ? 'block' : 'none';
    currencySelect.style.display = hasCurrency ? 'none' : 'block';
    if (hasCurrency) {
      currencySelect.value = cur;
    }
  }

  function loginUser(user) {
    currentUser = user;
    title.textContent = `${user.first} bienvenido a NEÓN-R`;
    showCurrency();
    updateBalance();
    updateCurrencyUI();
  }

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const first = document.getElementById('reg-first').value.trim();
    const last = document.getElementById('reg-last').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-password').value;
    const pass2 = document.getElementById('reg-password2').value;

    if (users.some(u => u.first.toLowerCase() === first.toLowerCase())) {
      showToast('este nombre ya está registrado');
      return;
    }
    if (users.some(u => u.email === email)) {
      showToast('este correo ya existe');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pass)) {
      showToast('la contraseña debe tener 8 letras y un número');
      return;
    }
    if (pass !== pass2) {
      showToast('las contraseñas no coinciden');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    users.push({ first, last, gender, email, pass, code, confirmed: false, balance: 0, currency: null });
    saveUsers();
    currentEmail = email;
    registerForm.classList.remove('active');
    codeForm.classList.add('active');
    showToast('código enviado');
  });

  codeForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('code-input').value.trim();
    const user = users.find(u => u.email === currentEmail);
    if (user && user.code === input) {
      user.confirmed = true;
      saveUsers();
      loginUser(user);
    } else {
      showToast('código incorrecto');
    }
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;
    const user = users.find(u => u.email === email);
    if (!user) {
      showToast('este correo no existe');
      return;
    }
    if (user.pass !== pass) {
      showToast('contraseña incorrecta');
      return;
    }
    if (!user.confirmed) {
      showToast('debes confirmar tu correo');
      return;
    }
    loginUser(user);
  });

  currencySelect.addEventListener('change', () => {
    if (!currentUser) return;
    currentUser.currency = currencySelect.value;
    saveUsers();
    updateCurrencyUI();
  });

  buyBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      showToast('ingresa una cantidad válida');
      return;
    }
    const neo = Math.round(amount * 4);
    currentUser.balance += neo;
    saveUsers();
    updateBalance();
    showToast(`compraste ${neo} NEO`);
  });
})();

