import express from 'express';
import { protect } from '../middleware/auth.js';
import { Lead, LEAD_SOURCES, LEAD_STATUSES } from '../models/Lead.js';

export const leadRouter = express.Router();

leadRouter.use(protect);

leadRouter.get('/meta/options', (req, res) => {
  res.json({
    statuses: LEAD_STATUSES,
    sources: LEAD_SOURCES
  });
});

leadRouter.get('/dashboard/summary', async (req, res) => {
  const [statusCounts, totals] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          totalDealValue: { $sum: '$dealValue' },
          wonDealValue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Won'] }, '$dealValue', 0]
            }
          }
        }
      }
    ])
  ]);

  const counts = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));
  const totalRow = totals[0] || { totalLeads: 0, totalDealValue: 0, wonDealValue: 0 };

  res.json({
    totalLeads: totalRow.totalLeads,
    newLeads: counts.New || 0,
    qualifiedLeads: counts.Qualified || 0,
    wonLeads: counts.Won || 0,
    lostLeads: counts.Lost || 0,
    totalDealValue: totalRow.totalDealValue,
    wonDealValue: totalRow.wonDealValue,
    statusCounts: counts
  });
});

leadRouter.get('/', async (req, res) => {
  const { status, source, assignedSalesperson, search } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (source) filters.source = source;
  if (assignedSalesperson) filters.assignedSalesperson = assignedSalesperson;
  if (search) {
    filters.$or = [
      { leadName: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const leads = await Lead.find(filters).sort({ updatedAt: -1 });
  res.json(leads);
});

leadRouter.post('/', async (req, res) => {
  const lead = await Lead.create(req.body);
  res.status(201).json(lead);
});

leadRouter.get('/:id', async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  res.json(lead);
});

leadRouter.put('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  res.json(lead);
});

leadRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid lead status' });
  }

  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  res.json(lead);
});

leadRouter.post('/:id/notes', async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Note content is required' });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  lead.notes.push({
    content,
    createdBy: req.user.name
  });

  await lead.save();
  res.status(201).json(lead);
});

leadRouter.delete('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  res.json({ message: 'Lead deleted' });
});
