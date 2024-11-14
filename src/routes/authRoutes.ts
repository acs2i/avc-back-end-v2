import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/auth";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();


router.get("/search", verifyToken, async (req: Request, res: Response) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ msg: "Le paramètre 'username' est requis." });
    }

    const regEx = new RegExp(username as string, "i");
    const filter = { username: regEx };

    const data = await User.find(filter);

    if (!data || data.length === 0) {
      return res.status(404).json({ msg: "Aucun utilisateur trouvé." });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur du serveur lors de la récupération des utilisateurs." });
  }
});

// REGISTER
// @POST
// api/v1/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      username,
      email,
      password,
      authorization,
      comment,
      additionalFields,
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
        additionalFieldsMap = new Map(
          additionalFields.map((field: { key: string; value: any }) => [
            field.key,
            field.value,
          ])
        );
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
      additionalFields: additionalFieldsMap,
    });

    try {
      await newUser.save();
    } catch (err) {
      console.error("Error saving user:", err);
      const error = new HttpError(
        "Echec lors de la création du compte, réessayez plus tard.",
        500
      );
      return next(error);
    }

    res.status(200).json({ user: newUser.toObject({ getters: true }) });
  }
);

// LOGIN
// @POST
// api/v1/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
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
        return res
          .status(404)
          .json({
            error: "L'identifiant et le mot de passe ne correspondent pas",
          });
      }
      if (!process.env.JWT_SECRET) {
        throw new Error(
          "JWT_SECRET non défini dans les variables d'environnement"
        );
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
  }
);

// FORGOT PASSWORD
// @POST
// api/v1/auth/forgot-password
router.post(
  "/forgot-password",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 heure d'expiration

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpiry);
      await user.save();

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
      const companyName = process.env.COMPANY_NAME || "Aux Vieux Campeur";
      const companyLogo = process.env.COMPANY_LOGO || "https://cdn.widilo.fr/s-img/logo-au-vieux-campeur.png";
      const primaryColor = process.env.PRIMARY_COLOR || "#14532D";
      const year = new Date().getFullYear();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Inter', Arial, sans-serif;
            }
            
            body {
              background-color: #f9fafb;
              color: #1f2937;
              line-height: 1.7;
              -webkit-font-smoothing: antialiased;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            
            .email-wrapper {
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              overflow: hidden;
            }
            
            .email-header {
              background: ${primaryColor};
              padding: 40px 40px;
              text-align: center;
            }
            
            .email-header img {
              width: auto;
              height: 40px;
              margin-bottom: 20px;
            }
            
            .header-title {
              color: white;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
            }
            
            .email-body {
              padding: 40px;
              background: white;
            }
            
            .greeting {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #111827;
            }
            
            .message {
              color: #4b5563;
              margin-bottom: 30px;
              font-size: 16px;
            }
            
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            
            .button {
              display: inline-block;
              padding: 14px 44px;
              background-color: ${primaryColor};
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: background-color 0.2s;
            }
            
            .button:hover {
              background-color: ${primaryColor}dd;
            }
            
            .security-notice {
              margin: 30px 0;
              padding: 20px;
              background: #fff8f1;
              border-left: 4px solid #f97316;
              border-radius: 8px;
            }
            
            .security-notice-title {
              display: flex;
              align-items: center;
              font-weight: 600;
              color: #9a3412;
              margin-bottom: 8px;
            }
            
            .security-notice-icon {
              margin-right: 8px;
              font-size: 20px;
            }
            
            .security-notice-text {
              color: #9a3412;
              font-size: 14px;
            }
            
            .alternative-link {
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              margin: 30px 0;
            }
            
            .alternative-link-text {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 10px;
            }
            
            .link-display {
              word-break: break-all;
              color: ${primaryColor};
              font-size: 14px;
              text-decoration: none;
            }
            
            .email-footer {
              text-align: center;
              padding: 30px 40px;
              background: #f9fafb;
            }
            
            .footer-text {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 10px;
            }
            
            .social-links {
              margin: 20px 0;
            }
            
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #6b7280;
              text-decoration: none;
              font-size: 14px;
            }
            
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }
            
            .company-info {
              color: #9ca3af;
              font-size: 12px;
            }
            
            @media (max-width: 600px) {
              .container {
                padding: 20px 10px;
              }
              
              .email-header, .email-body, .email-footer {
                padding: 20px;
              }
              
              .header-title {
                font-size: 20px;
              }
              
              .button {
                padding: 12px 30px;
                font-size: 14px;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="email-header">
                <img src="${companyLogo}" alt="${companyName}" />
                <h1 class="header-title">Réinitialisation de votre mot de passe</h1>
                <p class="header-subtitle">Suivez les instructions ci-dessous</p>
              </div>
              
              <div class="email-body">
                <p class="greeting">Bonjour ${user.username},</p>
                
                <p class="message">
                  Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte ${companyName}. 
                  Si vous êtes à l'origine de cette demande, vous pouvez réinitialiser votre mot de passe en cliquant sur le bouton ci-dessous.
                </p>
                
                <div class="button-container">
                  <a href="${resetURL}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                
                <div class="security-notice">
                  <div class="security-notice-title">
                    <span class="security-notice-icon">⚠️</span>
                    <span>Informations de sécurité importantes</span>
                  </div>
                  <p class="security-notice-text">
                    Ce lien expirera dans 1 heure pour des raisons de sécurité.<br>
                    Si vous n'avez pas demandé cette réinitialisation, veuillez sécuriser votre compte immédiatement en contactant notre support.
                  </p>
                </div>
                
                <div class="alternative-link">
                  <p class="alternative-link-text">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                  <a href="${resetURL}" class="link-display">${resetURL}</a>
                </div>
              </div>
              
              <div class="email-footer">
                <p class="footer-text">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                
                <div class="social-links">
                  <a href="#" class="social-link">Support</a>
                  <a href="#" class="social-link">Site Web</a>
                  <a href="#" class="social-link">Documentation</a>
                </div>
                
                <div class="divider"></div>
                
                <p class="company-info">
                  © ${year} ${companyName}. Tous droits réservés.<br>
                  Développé avec ❤️ en France
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Bonjour ${user.username},

Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte ${companyName}.

Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant ou le copier dans votre navigateur :
${resetURL}

⚠️ IMPORTANT :
- Ce lien expirera dans 1 heure pour des raisons de sécurité.
- Si vous n'avez pas demandé cette réinitialisation, veuillez sécuriser votre compte immédiatement.

Besoin d'aide ? Contactez notre support.

Cet email a été envoyé automatiquement, merci de ne pas y répondre.

© ${year} ${companyName}. Tous droits réservés.
Développé avec ❤️ en France
      `;

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: `${companyName} - Réinitialisation de votre mot de passe`,
        text: textContent,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Un e-mail a été envoyé avec les instructions pour réinitialiser votre mot de passe.",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail de réinitialisation de mot de passe", error);
      res.status(500).json({ error: "Une erreur est survenue." });
    }
  }
);

// RESET PASSWORD
// @POST
// api/v1/auth/reset-password
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
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

      res
        .status(200)
        .json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe",
        error
      );
      res.status(500).json({ error: "Une erreur est survenue." });
    }
  }
);

// GET ALL USERS
// @GET
// api/v1/auth/all-users
router.get(
  "/all-users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      console.error("Error: ", err);
      res
        .status(500)
        .json({
          error:
            "Une erreur est survenue lors de la récupération des utilisateurs.",
        });
    }
  }
);

// GET USER BY ID
// @GET
// api/v1/auth/user/:id
router.get(
  "/:userId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId);
      res.status(200).json(user);
    } catch (err) {
      console.error("Error: ", err);
      res
        .status(500)
        .json({
          error:
            "Une erreur est survenue lors de la récupération des utilisateurs.",
        });
    }
  }
);

// GET USER NOTIFICATIONS
// @GET
// api/v1/auth/user/:userId/notifications
router.get(
  "/:userId/notifications",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).select("notifications");

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.status(200).json(user.notifications);
    } catch (err) {
      console.error("Error: ", err);
      res
        .status(500)
        .json({
          error:
            "Une erreur est survenue lors de la récupération des utilisateurs.",
        });
    }
  }
);




// UPDATE USER NOTIFICATIONS
// @PATCH
// api/v1/auth/user/:userId/notifications
router.patch(
  "/:userId/notifications",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
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
      res
        .status(500)
        .json({
          error:
            "Une erreur est survenue lors de la récupération des utilisateurs.",
        });
    }
  }
);

// UPDATE USER
// @PATCH
// api/v1/auth/user/:id
router.patch(
  "/:userId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
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
      res
        .status(500)
        .json({
          error:
            "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
        });
    }
  }
);

export default router;
