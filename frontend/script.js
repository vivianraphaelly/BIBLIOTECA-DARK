// ─── Firebase (Realtime Database) ────────────────────────────────────────────
// Cole aqui a URL do seu Realtime Database
// (Console do Firebase > Realtime Database > aba "Dados", a URL aparece no topo)
const FIREBASE_URL = "https://biblioteca-dark-default-rtdb.firebaseio.com/";

// ─── DOM refs ────────────────────────────────────────────────────────────────
const loginBtn     = document.getElementById('btn-login');
const registerBtn  = document.getElementById('btn-register');
const userBar      = document.getElementById('user-bar');
const userNameEl   = document.getElementById('user-name');
const logoutBtn    = document.getElementById('btn-logout');

const modalOverlay  = document.getElementById('modal-overlay');
const modalTitle    = document.getElementById('modal-title');
const nameField     = document.getElementById('field-name');
const emailInput    = document.getElementById('input-email');
const passwordInput = document.getElementById('input-password');
const nameInput     = document.getElementById('input-name');
const submitBtn     = document.getElementById('modal-submit');
const modalMsg      = document.getElementById('modal-msg');
const modalClose    = document.getElementById('modal-close');
const switchText    = document.getElementById('modal-switch-text');

let mode = 'login'; // 'login' | 'register'

// ─── Banco de dados (REST do Firebase) ───────────────────────────────────────
function firebaseConfigurado() {
  return FIREBASE_URL.startsWith('https://') && !FIREBASE_URL.includes('SEU-PROJETO');
}

function dbUrl(caminho) {
  return `${FIREBASE_URL.replace(/\/+$/, '')}/${caminho}.json`;
}

// O Firebase não aceita  . # $ [ ] /  nas chaves, então o e-mail vira uma chave segura
function userKey(email) {
  return email.trim().toLowerCase().replace(/[.#$\[\]\/]/g, ',');
}

// ─── Senha: nunca é salva em texto puro (PBKDF2 + salt aleatório) ────────────
function toHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function novoSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashSenha(senha, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g).map(h => parseInt(h, 16)));
  const chave = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, chave, 256
  );
  return toHex(bits);
}

async function buscarUsuario(email) {
  const res = await fetch(dbUrl(`users/${userKey(email)}`));
  if (!res.ok) throw new Error('Não foi possível acessar o banco de dados. Confira a URL e as regras.');
  return res.json(); // null quando o e-mail não existe
}

async function criarUsuario(usuario) {
  const res = await fetch(dbUrl(`users/${userKey(usuario.email)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario)
  });
  if (!res.ok) throw new Error('Não foi possível criar a conta. Confira as regras do banco.');
}

// ─── Sessão (fica no navegador) ──────────────────────────────────────────────
function updateNavAuth() {
  const name = localStorage.getItem('userName');
  if (name) {
    loginBtn.style.display    = 'none';
    registerBtn.style.display = 'none';
    userBar.style.display     = 'flex';
    userNameEl.textContent    = `Olá, ${name}`;
  } else {
    loginBtn.style.display    = 'inline-block';
    registerBtn.style.display = 'inline-block';
    userBar.style.display     = 'none';
  }
}

function showMsg(texto, tipo) {
  modalMsg.textContent = texto;
  modalMsg.className   = `modal-msg ${tipo}`;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function openModal(m) {
  mode = m;
  modalMsg.textContent = '';
  emailInput.value = '';
  passwordInput.value = '';
  nameInput.value = '';

  if (m === 'login') {
    modalTitle.textContent  = 'Entrar';
    nameField.style.display = 'none';
    submitBtn.textContent   = 'Entrar';
    switchText.innerHTML    = 'Não tem conta? <a onclick="openModal(\'register\')">Cadastre-se</a>';
  } else {
    modalTitle.textContent  = 'Criar conta';
    nameField.style.display = 'block';
    submitBtn.textContent   = 'Cadastrar';
    switchText.innerHTML    = 'Já tem conta? <a onclick="openModal(\'login\')">Entrar</a>';
  }

  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

// ─── Enviar (login / cadastro) ───────────────────────────────────────────────
async function handleSubmit() {
  modalMsg.textContent = '';

  if (!firebaseConfigurado()) {
    showMsg('Cole a URL do seu banco em FIREBASE_URL, no topo do script.js.', 'error');
    return;
  }

  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  const name     = nameInput.value.trim();

  if (!email || !password || (mode === 'register' && !name)) {
    showMsg('Preencha todos os campos.', 'error');
    return;
  }

  submitBtn.disabled = true;
  try {
    const existente = await buscarUsuario(email);

    if (mode === 'register') {
      if (password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      if (existente) throw new Error('Este e-mail já está cadastrado.');

      const salt = novoSalt();
      const hash = await hashSenha(password, salt);
      await criarUsuario({ name, email: email.toLowerCase(), salt, hash, createdAt: Date.now() });

      localStorage.setItem('userName', name);
      showMsg('Conta criada! Bem-vindo(a)!', 'success');
      setTimeout(() => { closeModal(); updateNavAuth(); }, 1000);

    } else {
      const hash = existente ? await hashSenha(password, existente.salt) : null;
      if (!existente || hash !== existente.hash) throw new Error('E-mail ou senha incorretos.');

      localStorage.setItem('userName', existente.name || email);
      showMsg('Login realizado!', 'success');
      setTimeout(() => { closeModal(); updateNavAuth(); }, 800);
    }
  } catch (err) {
    showMsg(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

// ─── Eventos ─────────────────────────────────────────────────────────────────
loginBtn.addEventListener('click',    () => openModal('login'));
registerBtn.addEventListener('click', () => openModal('register'));
modalClose.addEventListener('click',  closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
submitBtn.addEventListener('click',   handleSubmit);
logoutBtn.addEventListener('click',   () => {
  localStorage.removeItem('userName');
  updateNavAuth();
});

// Enter dentro do modal
[emailInput, passwordInput, nameInput].forEach(el => {
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });
});

// ─── Init ────────────────────────────────────────────────────────────────────
updateNavAuth();
