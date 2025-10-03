import Counter from '../models/Counter.js';

export const nextSequence = async (name = 'billingId') => {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export const formatBillingId = (num) => {
  // pad to 9 digits like 000011232 if desired
  return String(num).padStart(9, '0');
};
