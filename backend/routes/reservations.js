const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Resource = require('../models/Resource');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.session.role === 'admin') {
      return res.json(await Reservation.findAll());
    }
    return res.json(await Reservation.findByUser(req.session.userId));
  } catch(err) { console.error(err); return res.status(500).json({error:'Erreur serveur'}); }
});

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try { return res.json(await Reservation.stats()); }
  catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const r = await Reservation.findById(parseInt(req.params.id));
    if (!r) return res.status(404).json({error:'Réservation introuvable'});
    if (req.session.role !== 'admin' && r.user_id !== req.session.userId)
      return res.status(403).json({error:'Accès refusé'});
    return res.json(r);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.post('/', requireAuth, [
  body('resource_id').isInt({min:1}).withMessage('Ressource invalide'),
  body('start_time').isISO8601().withMessage('Date de début invalide'),
  body('end_time').isISO8601().withMessage('Date de fin invalide'),
  body('end_time').custom((val,{req}) => {
    if (new Date(val) <= new Date(req.body.start_time))
      throw new Error('La fin doit être après le début');
    return true;
  }),
  body('start_time').custom(val => {
    if (new Date(val) < new Date())
      throw new Error('Impossible de réserver dans le passé');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  const { resource_id, start_time, end_time, notes } = req.body;
  try {
    const resource = await Resource.findById(resource_id);
    if (!resource) return res.status(404).json({errors:[{msg:'Ressource introuvable'}]});
    if (!resource.available) return res.status(400).json({errors:[{msg:'Ressource non disponible'}]});
    const free = await Resource.isAvailableForSlot(resource_id, start_time, end_time);
    if (!free) return res.status(409).json({errors:[{msg:'Créneau déjà réservé'}]});
    const r = await Reservation.create({
      user_id: req.session.userId,
      resource_id, start_time, end_time, notes: notes||''
    });
    return res.status(201).json(r);
  } catch(err) { console.error(err); return res.status(500).json({error:'Erreur serveur'}); }
});

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const r = await Reservation.findById(parseInt(req.params.id));
    if (!r) return res.status(404).json({error:'Réservation introuvable'});
    if (req.session.role !== 'admin' && r.user_id !== req.session.userId)
      return res.status(403).json({error:'Accès refusé'});
    if (r.status === 'cancelled')
      return res.status(400).json({error:'Déjà annulée'});
    const updated = await Reservation.cancel(parseInt(req.params.id));
    return res.json(updated);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.patch('/:id/status', requireAuth, requireAdmin, [
  body('status').isIn(['confirmed','cancelled','pending']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({errors:errors.array()});
  try {
    const r = await Reservation.updateStatus(parseInt(req.params.id), req.body.status);
    if (!r) return res.status(404).json({error:'Réservation introuvable'});
    return res.json(r);
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ok = await Reservation.delete(parseInt(req.params.id));
    if (!ok) return res.status(404).json({error:'Réservation introuvable'});
    return res.json({ok:true});
  } catch(err) { return res.status(500).json({error:'Erreur serveur'}); }
});

module.exports = router;
