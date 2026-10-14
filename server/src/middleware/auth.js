export function auth(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "A valid bearer token is required to view a post." });
  }

  const providedToken = authorization.slice("Bearer ".length).trim();

  if (!providedToken) {
    return res.status(401).json({ error: "A valid bearer token is required to view a post." });
  }

  next();
}
