const User = require('../models/user');

const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email });

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
    res.json(users);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'name', 'email'] });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json(safeUser(user));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [updated] = await User.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Atualizado com sucesso' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Removido com sucesso' });
  } catch (err) { next(err); }
};
