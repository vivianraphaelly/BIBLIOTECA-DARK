const Task = require('../models/Task');

exports.create = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const task = await Task.create({ title, userId: req.userId });
    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.userId } });
    return res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { id: req.params.id, userId: req.userId }
    });
    if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada' });
    return res.json({ message: 'Atualizada com sucesso' });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada' });
    return res.json({ message: 'Removida com sucesso' });
  } catch (err) {
    next(err);
  }
};
