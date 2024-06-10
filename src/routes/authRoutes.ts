import express, {Request, Response, NextFunction} from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import bcrypt from "bcrypt";
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
    comment,
    additionalFields: additionalFieldsMap
  });

  try {
    await newUser.save();
    console.log("New user created:", newUser);  // Log the new user
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

export default router;
