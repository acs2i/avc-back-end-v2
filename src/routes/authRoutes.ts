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
    password
  } = req.body;

 console.log("body :" + username)

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
    const error = new HttpError("Cet Email est déja utilisé", 422);
    return next(error);
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = new User({
    username,
    password: passwordHash,
    email
  });
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError(
      "Echec lors de la création du compte, réessayez plus tard.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
});

//LOGIN
//@POST
//api/v1/auth/register
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  let user;
  try {
    user = await User.findOne({ username: username.toLowerCase() });
  } catch (err) {
    const error = new HttpError(
      "Erreur lors de l'authentification, réessayer plus tard.",
      500
    );
  }

  if (!user) {
    return res
      .status(404)
      .json({ message: "L'email que vous avez rentré n'existe pas." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(404)
      .json({ message: "L'email et le mot de passe ne corresponde pas." });
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non défini dans les variables d'environnement.");
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  
  res.status(200).json({
    message: "Logged In",
    user: user.toObject({ getters: true }),
    token: token
  });
});

export default router;
