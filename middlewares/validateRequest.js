const validateRequest = (req, res, next) => {
  const { currency, userTimezone, userRegion } = req.body;

  if (!currency || !userTimezone || !userRegion) {
    return res.status(400).json({ error: "Missing required fields: currency, userTimezone, or userRegion." });
  }

  next();
};

module.exports = validateRequest;
