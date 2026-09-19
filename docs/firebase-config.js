// ─────────────────────────────────────────────────────────────────────────────
// Configuração do Firebase — Dark Library
//
// Como preencher:
//  1. Acesse https://console.firebase.google.com e crie um projeto.
//  2. Em "Criação > Authentication > Método de login", ative "E-mail/senha".
//  3. Em "Criação > Firestore Database", crie o banco (modo produção) e cole as
//     regras do arquivo firestore.rules (aba "Regras").
//  4. Em "Configurações do projeto > Seus apps", adicione um app Web (</>) e
//     copie o objeto firebaseConfig para cá.
//
// Obs.: essas chaves do app Web NÃO são segredo (ficam visíveis no navegador).
// Quem protege os dados são as regras do Firestore + o Authentication.
// ─────────────────────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: 'COLE_AQUI_SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJETO',
  storageBucket: 'SEU_PROJETO.firebasestorage.app',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000'
};
