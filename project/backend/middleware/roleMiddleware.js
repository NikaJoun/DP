const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.roleId)) {
        return res.status(403).send({ error: 'Недостаточно прав для выполнения операции' });
      }
      next();
    };
  };
  
  module.exports = authorizeRole;  