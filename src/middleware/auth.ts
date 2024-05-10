import jwt from "jsonwebtoken";


export const verifyToken = async (req: any, res: any, next: any) => {
    try {
      let token = req.header("Authorization");
      if (!token) return res.status(500).send({ message: "Accès refusé !" });
  
      if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trimLeft();
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET non défini dans les variables d'environnement.");
      }

  
      const verified = await jwt.verify(token, process.env.JWT_SECRET); // { id: string, iat: Number}
      req.user = verified;
      next();
    } catch (err) {
      console.error("Error in the verify token middlewear: " ,err);
      res.status(500).json({ message: "Erreur" });
    }
  };