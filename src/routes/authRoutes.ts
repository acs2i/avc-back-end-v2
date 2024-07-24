import express, {Request, Response, NextFunction} from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/auth";
import jwt from "jsonwebtoken";

const router = express.Router();

//REGISTER
//@POST
//api/v1/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  const {
    username,
    email,
    password,
    authorization,
    comment,
    additionalFields
  } = req.body;


  let existingUser;
  try {
    existingUser = await User.findOne({ email: email.toLowerCase() });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("Cet Email est déjà utilisé", 422);
    return next(error);
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  let additionalFieldsMap = new Map<string, any>();
  if (additionalFields) {
    try {
      additionalFieldsMap = new Map(additionalFields.map((field: { key: string; value: any }) => [field.key, field.value]));
    } catch (err) {
      const error = new HttpError(
        "Invalid format for additionalFields.",
        400
      );
      return next(error);
    }
  }

  const newUser = new User({
    username,
    password: passwordHash,
    email,
    authorization,
    comment,
    additionalFields: additionalFieldsMap
  });

  try {
    await newUser.save();
  } catch (err) {
    console.error("Error saving user:", err);  // Log the error
    const error = new HttpError(
      "Echec lors de la création du compte, réessayez plus tard.",
      500
    );
    return next(error);
  }

  res.status(200).json({ user: newUser.toObject({ getters: true }) });
});

//LOGIN
//@POST
//api/v1/auth/register
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  let user;
  try {
    user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ error: "Cet utilisateur n'existe pas." });
      }
    
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(404).json({ error: "L'identifiant et le mot de passe ne correspondent pas" });
      }
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET non défini dans les variables d'environnement");
      }
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      
      res.status(200).json({
        message: "Logged In",
        user: user.toObject({ getters: true }),
        token: token
      });
  } catch (err) {
    console.error("Error: " , err);
    res.status(400).json({})
  }

 
});

//LOGIN
//@GET
//api/v1/auth/register
router.get("/all-users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});


//Userbyid
//@GET
//api/v1/auth/user/:id
router.get("/:userId", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});

//Notifications
//@GET
//api/v1/auth/user/:userId/notifications
router.get("/:userId/notifications", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const markAsRead = req.query.markAsRead === 'true';
  try {
    const user = await User.findById(userId).select('notifications');
    
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user.notifications);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});

//Mise a jour notifications
//@PATCH
//api/v1/auth/user/:userId/notifications
router.patch("/:userId/notifications", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const markAsRead = req.query.markAsRead === 'true';

  try {
    const user = await User.findById(userId).select('notifications');
    
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (markAsRead) {
      user.notifications.forEach(notification => {
        notification.read = true;
      });
      await user.save();
    }
    
    res.status(200).json(user.notifications);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});



//Update user
//@GET
//api/v1/auth/user/:id
router.patch("/:userId", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { username, authorization, email, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (username) {
      user.username = username;
    }

    if (authorization) {
      user.authorization = authorization;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      // Hash the new password before saving it
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Sauvegarder les modifications
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de l'utilisateur." });
  }
});

export default router;
