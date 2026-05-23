const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const Reservation = require('../models/Reservation');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const validators = [
  body('name').trim().isLength({min:2,max:100}).withMessage('Nom requis (2-100 car.)'),
  body('category').trim().notEmpty().withMessage('Catégorie requise'),
  body('capacity').optional({checkFalsy:true}).isInt({min:1}).withMessage('Capacité invalide'),
];

router.get('/', requireAuth, async (req, res) => {
  try { return res.json(await Resource.findAll()); }
  catch(err) { console.error(err); return res.status(500).json({error:'Erreur serveur'}); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(parseInt(req.params.id));
    if (!resource) return res.status(404).json({error:'Ressource introuvable'});
    return res.json(resource);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.get('/:id/slots', requireAuth, async (req, res) => {
  try {
    const slots = await Reservation.findByResource(parseInt(req.params.id));
    return res.json(slots);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.post('/', requireAuth, requireAdmin, validators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  try {
    const r = await Resource.create(req.body);
    return res.status(201).json(r);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.put('/:id', requireAuth, requireAdmin, validators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  try {
    const r = await Resource.update(parseInt(req.params.id), req.body);
    if (!r) return res.status(404).json({error:'Ressource introuvable'});
    return res.json(r);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ok = await Resource.delete(parseInt(req.params.id));
    if (!ok) return res.status(404).json({error:'Ressource introuvable'});
    return res.json({ok:true});
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

module.exports = router;
