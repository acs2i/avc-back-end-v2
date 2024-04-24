import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import HttpError from "../models/http-errors";
import { Delete, Get, Post } from "../services/fetch";


const router = express.Router();

// Connecté à datalake - TESTED NEW DATA LAKE
//@GET
router.get("/search", async(req: Request, res: Response) => {
  try {
    const page: string | any | string[] | undefined = req.query.page;
    const limit: string | any | string[] | undefined = req.query.limit;

    let intPage;
    let intLimit;

    if(!page) {
        intPage = 1;
    } else {
        intPage = parseInt(page) 
    }


    if(!limit) {
        intLimit = 1000;        
    } else {
        intLimit = parseInt(limit); 
    }    
    
    const value = req.query.value;

    if(!value) {
        throw new Error(req.originalUrl + ", msg: value in product routes get was falsy: " + value);
    } 

    const response = await Get("/product/search", undefined, intPage, intLimit, value as string);

    if(response.status !== 200) {
      throw new Error("Erreur sur le coté de data lake serveur en cherchant les families");
    }
    
    const families = await response.json();
    res.status(201).json(families);

  } catch(err) {
    console.error(err)
    res.status(500).json(err);
  }



})

//GET ALL PRODUCT
// Connecté à datalake - TESTED NEW DATA LAKE
//@GET
//api/v1/product
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {

    const page: string | any | string[] | undefined = req.query.page;
    const limit: string | any | string[] | undefined = req.query.limit;

    let intPage;
    let intLimit;

    if(page === undefined) {
        intPage = 1;
    } else {
        intPage = parseInt(page) 
    }


    if(limit === undefined) {
        intLimit = 1000;        
    } else {
        intLimit = parseInt(limit); 
    }        

    const response = await Get("/product", undefined, intPage, intLimit);

    if(response.status !== 200 ) {
      throw new HttpError("GET tous les produit n'a pas bien functioné ",400);
    }

    const products = await response.json();

    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ error: { message: "un probleme est survenu" } });
  }
});

//GET PRODUCT BY ID
// Connecté à datalake - TESTED FOR NEW DATALAKE
//@GET
//api/v1/product/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  let product = undefined;
  try {

    const response = await Get("/product", id);

    if(response) {
      product = await response.json();
    } else {
      throw new HttpError("Un problème à propos de la creation de la reference s'est passé", 400);
    }

    if (!product) {
      throw new HttpError(
        "Impossible de trouver un utilisateur à l'adresse fournie",
        404
      )    
    }
  
    res.json(product);

  } catch (err) {
    console.error(err)
    next(err);
  }


});

//CREATE
// Connecté à datalake - TESTED NEW DATA LAKE
//@POST
//api/v1/product/create
router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const { creatorId, product } : { creatorId: string | undefined | null, product: any } = req.body;

      if(!creatorId) {
        throw new HttpError("Erreur a propos de creatorId: "+ creatorId , 400);
      }

      const body = JSON.stringify({ ...product})

      const response = await Post("/product", body)

      if(response.status !== 200) {
        throw new HttpError("Erreur à propos de la rèquete vers le data lake pour reference", 400);
      }

      const data = await response.json(); // notez: eventuellement ajoute l'interface de reference du datalake?

      const user = await User.findById(creatorId);

      if (!user) {
        throw new HttpError("Utilisateur non trouvé.", 404);
      }

      // Met a jour le champs products de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            products: {
              _id: data._id,
              reference: data.reference,
              name: data.name,
              date: data.createdAt,
            },
          },
        },
        { new: true }
      );

      if(updatedUser) {
        res.status(201).json(data);
      } else {
        // delete reference
        Delete("/product", creatorId)
        throw new HttpError("Erreur a propos de updated user: "+ updatedUser , 400);

      }


    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//UPDATE
// Connecté à datalake - NOT NOT TESTED FOR NEW DATALAKE
//@PATCH
//api/v1/product/create
// router.patch(
//   "/edit/:id",
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;

//     const {
//       reference,
//       name,
//       family,
//       brand,
//       productCollection,
//       imgPath,
//       creator,
//     } = req.body;

//     try {
//       // Vérifier si le produit existe
//       const productResponse = await Get("/reference", id);

//       if (!productResponse) {
//         throw new HttpError("La rèquete pour le produit ne s'est pas bien passé.", 404);
//       }

//       // Vérifier si l'utilisateur existe
//       const user = await User.findById(creator);
//       if (!user) {
//         throw new HttpError("Utilisateur non trouvé.", 404);
//       }

      
//       const product = await productResponse.json();
//       const oldProduct = product;   // il peut etre utilisé en cas de défaire
//       // Mettre à jour les détails du produit
//       product.reference = reference;
//       product.name = name;
//       product.family = family;
//       product.brand = brand;
//       product.productCollection = productCollection;
//       product.imgPath = imgPath;

//       if(product.creator === undefined ) product.creator  = []

//       // console.log("PRODUCT: " , product)
//       product.creator.push({
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//       });


//       const putResponse = await Put("/reference", JSON.stringify(product))

//       // Enregistrer les modifications du produit
//       // const updatedProduct = await product.save();

//       if(putResponse.status !== 200) {
//         throw new HttpError("Erreur de put sur le produit", 400)
//       }

//       // Mettre à jour le champ products de l'utilisateur
//       const updatedUser : Document | null | undefined = await User.findByIdAndUpdate(
//         creator,
//         {
//           $push: {
//             products: {
//               _id: product._id,
//               reference: product.reference,
//               name: product.name,
//               date: product.updatedAt,
//             },
//           },
//         },
//         { new: true }
//       )
      
//       // Mettre à jour l'utilisateur
//       if(updatedUser === undefined || updatedUser === null) {
//         // Défaire la rèquete vers data lake
//         Put("/reference", JSON.stringify(oldProduct))
  
//         throw new HttpError("L'utilisateur ne pouvait pas etre mis à jour", 400);
//       }

//       res
//         .status(200)
//         .json(product );
//     } catch (err) {
//       return next(err);
//     }
//   }
// );

//DELETE PRODUCT
//@DELETE
//api/v1/product/delete/:id
// Pas de CRUD o: que le CRU ;)
// router.delete(
//   "/delete/:id",
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const productId = req.params.id;
//       // await Product.findByIdAndDelete(productId);
//       const response = await fetch(dataLakeUri + "/reference/" + productId, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           "app-id": "password"
//         }    
//       });

//       if(response.status !== 200) {
//         throw new Error("Produit n'etait pas supprimé")
//       } 

//       res.status(200).json({ message: "Produit supprimé avec succès" });
//     } catch (error) {
//       console.error(error)
//       res.status(500).json({ message: "Erreur lors de la suppression" });
//     }
//   }
// );

export default router;
