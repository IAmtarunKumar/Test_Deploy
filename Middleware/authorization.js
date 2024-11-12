const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // // Check for Authorization header and ensure it starts with "Bearer"
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return res.status(401).json({ message: "Access token missing or malformed." });
  // }

  const token = authHeader.split(' ')[1]; // Extract token
  
  try {
    // Verify the token using the secret key from .env
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Check if decoded token has user information
    if (!decoded || !decoded.user) {
      return res.status(403).json({ message: 'Invalid token: User data not found in payload.' });
    }

    // Attach decoded user data to the request object
    req.user = decoded.user;

    // console.log("Authenticated user:", req.user); // Log for debugging purposes
    next();  // Pass control to the next middleware or route handler
  } catch (error) {
     console.error("Token verification error:", error.message);
    return res.status(403).json({ message: 'Invalid token: Verification failed.' });
  }
};

const authorize = (requiredPermission) => async (req, res, next) => {
  try {
    const userRole = await User.findById(req.user.roles._id) 
    const hasPermission = userRole.permissions.some((perm) => perm.name === requiredPermission);

    if (!hasPermission) return res.status(403).json({ message: "Access denied" });
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization error", error: error.message });
  }
};

 
module.exports = {auth,authorize};
