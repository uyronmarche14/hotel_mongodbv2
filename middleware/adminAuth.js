const adminAuth = (req, res, next) => {
  // Get token from header
  const token = req.header('Admin-Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No admin token, authorization denied' });
  }

  try {
    // Validate the token (simple implementation - in production, use JWT)
    // These are the hardcoded credentials
    const validToken = 'admin-token-secure-123456';
    
    if (token !== validToken) {
      return res.status(401).json({ message: 'Admin token is not valid' });
    }
    
    // Set isAdmin flag in request
    req.isAdmin = true;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Admin token is not valid' });
  }
};

module.exports = adminAuth; 
 