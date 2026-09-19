require('dotenv').config();
const app = require('./backend/src/app');
const sequelize = require('./backend/src/config/database');

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch((err) => {
  console.error('Erro ao conectar no banco:', err);
});
