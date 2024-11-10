import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers['authorization'];
  const token = req.cookies.token;
  const tokenHeader = authHeader && authHeader.split(' ')[1];
  

  if (token == null) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token required' 
    });
  }

  jwt.verify(tokenHeader, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;