import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/auth";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// REGISTER
// @POST
// api/v1/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, authorization, comment, additionalFields } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email.toLowerCase() });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again later.", 500);
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
      const error = new HttpError("Invalid format for additionalFields.", 400);
      return next(error);
    }
  }

  const newUser = new User({
    username,
    password: passwordHash,
    email,
    authorization,
    comment,
    additionalFields: additionalFieldsMap,
  });

  try {
    await newUser.save();
  } catch (err) {
    console.error("Error saving user:", err);
    const error = new HttpError("Echec lors de la création du compte, réessayez plus tard.", 500);
    return next(error);
  }

  res.status(200).json({ user: newUser.toObject({ getters: true }) });
});

// LOGIN
// @POST
// api/v1/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  let user;
  console.log(username);
  try {
    user = await User.findOne({ username });
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
      token,
    });
  } catch (err) {
    console.error("Error: ", err);
    res.status(400).json({});
  }
});

// FORGOT PASSWORD
// @POST
// api/v1/auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure d'expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);;
    await user.save();

    // Configuration du transporteur d'email
    const transporter = nodemailer.createTransport({
      service: "Outlook365",
      host: "acs2i-fr.mail.protection.outlook.com",
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Réinitialisation du mot de passe",
      text: `Vous recevez cet e-mail car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n
            Cliquez sur le lien suivant ou copiez-le dans votre navigateur pour compléter le processus :\n\n
            ${resetURL}\n\n
            Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Un e-mail a été envoyé avec les instructions pour réinitialiser votre mot de passe." });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de réinitialisation de mot de passe", error);
    res.status(500).json({ error: "Une erreur est survenue." });
  }
});

// RESET PASSWORD
// @POST
// api/v1/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Remplacez `resetPasswordExpiry` par `resetPasswordExpires`
    });
    
    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined; // Remplacez `resetPasswordExpiry` par `resetPasswordExpires`
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe", error);
    res.status(500).json({ error: "Une erreur est survenue." });
  }
});

// GET ALL USERS
// @GET
// api/v1/auth/all-users
router.get("/all-users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});

// GET USER BY ID
// @GET
// api/v1/auth/user/:id
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

// GET USER NOTIFICATIONS
// @GET
// api/v1/auth/user/:userId/notifications
router.get("/:userId/notifications", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("notifications");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json(user.notifications);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs." });
  }
});

// UPDATE USER NOTIFICATIONS
// @PATCH
// api/v1/auth/user/:userId/notifications
router.patch("/:userId/notifications", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const markAsRead = req.query.markAsRead === "true";

  try {
    const user = await User.findById(userId).select("notifications");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (markAsRead) {
      user.notifications.forEach((notification) => {
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

// UPDATE USER
// @PATCH
// api/v1/auth/user/:id
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
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de l'utilisateur." });
  }
});

export default router;
