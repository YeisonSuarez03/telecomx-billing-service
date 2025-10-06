import Billing from '../models/Billing.js';
import User from '../models/User.js';
import { nextSequence, formatBillingId } from '../utils/sequence.js';

export const createBilling = async (req, res) => {
  try {
    const data = req.body;
    if (!data.userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findOne({ userId: data.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isActive) return res.status(400).json({ error: 'User is not active' });

  // generate auto-increment billingId
  const seq = await nextSequence('billingId');
  data.billingId = formatBillingId(seq);

  // ensure generationDate is set to now for new billings
  data.generationDate = new Date();
  data.phone = user.phone;

  const billing = new Billing(data);
  await billing.save();
  res.status(201).json(billing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listBillings = async (req, res) => {
  try {
    const billings = await Billing.find().lean();
    res.json(billings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBilling = async (req, res) => {
  try {
    const { id } = req.params;
    // lookup by billingId
    const billing = await Billing.findOne({ billingId: id });
    if (!billing) return res.status(404).json({ error: 'Billing not found' });

    const user = await User.findOne({ 
      userId: billing.userId,
    });
    res.json({
      billing: {
        userId: billing?.userId,
        billingId: billing?.billingId,
        generationDate: billing?.generationDate,
        dueDate: billing?.dueDate,
        serviceId: billing?.serviceId,
        totalInvoice: billing?.totalInvoice,
        isPaid: billing?.isPaid,
        paymentDate: billing?.paymentDate,
        phone: billing?.phone,
      }, 
      user: {
        userId: user?.userId,
        address: user?.address,
        isActive: user?.isActive,
      }});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findOneAndUpdate({ billingId: id }, req.body, { new: true });
    if (!billing) return res.status(404).json({ error: 'Billing not found' });
    res.json(billing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findOneAndDelete({ billingId: id });
    if (!billing) return res.status(404).json({ error: 'Billing not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBillingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const billings = await Billing.find({ userId }).sort({generationDate: -1});
    res.json(billings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
