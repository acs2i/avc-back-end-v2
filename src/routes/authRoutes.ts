import express, {Request, Response, NextFunction} from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth";

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
    imgPath,
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
      console.log("Additional Fields Map:", additionalFieldsMap);
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
    imgPath,
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
  
  try {
    const user = await User.findOne({ username: username });
    
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

    // Créer un nouvel objet sans la propriété password
    const { password: _, ...userWithoutPassword } = user.toObject({ getters: true });
    
    res.status(200).json({
      message: "Logged In",
      user: userWithoutPassword,
      token: token
    });
  } catch (err) {
    console.error("Error: " , err);
    res.status(500).json({ error: "Une erreur est survenue lors de la connexion" });
  }
});

//ALL USERS
//@GET
//api/v1/auth/register/all-users
router.get("/all-users", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
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


//Update user
//@GET
//api/v1/auth/user/:id
router.patch("/:userId", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { username, authorization, email } = req.body;

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

    // Sauvegarder les modifications
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de l'utilisateur." });
  }
});

export default router;
