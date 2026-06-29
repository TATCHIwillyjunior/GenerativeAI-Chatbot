import jwt from "jsonwebtoken";

const DEMO_USER = {
  id: "user-1",
  email: "demo@noise.ai",
  password: "password123",
};

export function loginHandler(req, res) {
  const { email, password } = req.body;

  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: DEMO_USER.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const [, token] = authHeader.split(" ");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
