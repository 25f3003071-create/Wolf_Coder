function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `UNAUTHORIZED: Role '${req.user.role}' is not permitted. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

module.exports = { requireRole };
