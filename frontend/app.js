(function () {
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const currencySection = document.getElementById('currency-section');
  const currencySelect = document.getElementById('currency-select');
  const amountInput = document.getElementById('amount');
  const buyBtn = document.getElementById('buy-btn');
  const title = document.getElementById('title');
  const toast = document.getElementById('toast');
  const neoBalance = document.getElementById('neo-balance');
  const currencyDisplay = document.getElementById('currency-display');
  const rateDiv = document.getElementById('rate');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCurrency = document.getElementById('settings-currency');
  const closeSettings = document.getElementById('close-settings');

  const users = JSON.parse(localStorage.getItem('users') || '[]');
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
  }

  tabRegister?.addEventListener('click', () => activate('register'));
  tabLogin?.addEventListener('click', () => activate('login'));
  activate('register');

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.classList.toggle('open', isHidden);
    });
  });

  const displayNames = new Intl.DisplayNames(['es'], { type: 'currency' });
  Intl.supportedValuesOf('currency').forEach(code => {
    const text = `${code} - ${displayNames.of(code)}`;
    const option1 = document.createElement('option');
    option1.value = code;
    option1.textContent = text;
    currencySelect.appendChild(option1);
    const option2 = document.createElement('option');
    option2.value = code;
    option2.textContent = text;
    settingsCurrency.appendChild(option2);
  });
  currencySelect.value = 'USD';
  settingsCurrency.value = 'USD';

  function showCurrency() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'none';
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
    settingsCurrency.value = cur;
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

    const user = { first, last, gender, email, pass, balance: 0, currency: null };
    users.push(user);
    saveUsers();
    loginUser(user);
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
    loginUser(user);
  });

  currencySelect.addEventListener('change', () => {
    if (!currentUser) return;
    currentUser.currency = currencySelect.value;
    saveUsers();
    updateCurrencyUI();
  });

  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  settingsCurrency.addEventListener('change', () => {
    if (!currentUser) return;
    currentUser.currency = settingsCurrency.value;
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

