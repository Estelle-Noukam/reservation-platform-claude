const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try { return res.json(await User.findAll()); }
  catch { return res.status(500).json({error:'Erreur serveur'}); }
});

router.put('/profile', requireAuth, [
  body('email').trim().isEmail().normalizeEmail(),
  body('first_name').trim().isLength({max:100}).optional({checkFalsy:true}),
  body('last_name').trim().isLength({max:100}).optional({checkFalsy:true}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  const { email, first_name, last_name } = req.body;
  try {
    if (await User.emailExists(email, req.session.userId))
      return res.status(409).json({errors:[{msg:'E-mail déjà utilisé'}]});
    const user = await User.update(req.session.userId, {
      email, first_name, last_name,
      username: req.session.username,
      role: req.session.role,
    });
    return res.json(user);
  } catch { return res.status(500).json({error:'Erreur serveur'}); }
});

router.put('/:id', requireAuth, requireAdmin, [
  body('username').trim().isLength({min:3,max:50}).matches(/^[a-zA-Z0-9_]+$/),
  body('email').trim().isEmail().normalizeEmail(),
  body('role').isIn(['admin','user']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  const id = parseInt(req.params.id);
  try {
    if (await User.emailExists(req.body.email, id))
      return res.status(409).json({errors:[{msg:'E-mail déjà utilisé'}]});
    const user = await User.update(id, req.body);
    if (!user) return res.status(404).json({error:'Utilisateur introuvable'});
    return res.json(user);
  } catch { return res.status(500).json({error:'Erreur serveur'}); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.session.userId)
    return res.status(400).json({error:'Impossible de supprimer votre propre compte'});
  try {
    const ok = await User.delete(id);
    if (!ok) return res.status(404).json({error:'Utilisateur introuvable'});
    return res.json({ok:true});
  } catch { return res.status(500).json({error:'Erreur serveur'}); }
});

module.exports = router;
