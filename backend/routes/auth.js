const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

router.post('/register', [
  body('username').trim().isLength({min:3,max:50}).matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Nom d'utilisateur : 3-50 caractères, lettres/chiffres/_"),
  body('email').trim().isEmail().normalizeEmail().withMessage('E-mail invalide'),
  body('password').isLength({min:8}).matches(/[A-Z]/).matches(/[0-9]/)
    .withMessage('Mot de passe : 8 car. min, 1 majuscule, 1 chiffre'),
  body('confirm_password').custom((val,{req}) => {
    if (val !== req.body.password) throw new Error('Les mots de passe ne correspondent pas');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { username, email, password, first_name, last_name } = req.body;
  try {
    if (await User.emailExists(email))
      return res.status(409).json({ errors: [{msg:'E-mail déjà utilisé'}] });
    if (await User.usernameExists(username))
      return res.status(409).json({ errors: [{msg:"Nom d'utilisateur déjà pris"}] });
    const user = await User.create({ username, email, password, first_name:first_name||'', last_name:last_name||'' });
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.username;
    return res.status(201).json({ user: { id:user.id, username:user.username, role:user.role } });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ errors: [{msg:'Erreur serveur'}] });
  }
});

router.post('/login', [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user || !(await User.verifyPassword(req.body.password, user.password_hash)))
      return res.status(401).json({ errors: [{msg:'Identifiants incorrects'}] });
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ errors: [{msg:'Erreur session'}] });
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.username = user.username;
      return res.json({ user: { id:user.id, username:user.username, role:user.role } });
    });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ errors: [{msg:'Erreur serveur'}] });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Erreur déconnexion' });
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Non authentifié' });
  return res.json({ id:req.session.userId, username:req.session.username, role:req.session.role });
});

module.exports = router;
