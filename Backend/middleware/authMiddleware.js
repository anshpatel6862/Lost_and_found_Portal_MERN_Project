const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Header se token nikalo
    const token = req.header('x-auth-token');

    // 2. Check karo token hai ya nahi
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 3. Verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 🔥 CRITICAL FIX: 
        // Hamara payload structure { user: { id: ... } } hai.
        // Isliye hamein 'decoded.user' assign karna hai, sirf 'decoded' nahi.
        req.user = decoded.user; 
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};