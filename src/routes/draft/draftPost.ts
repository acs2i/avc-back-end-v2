import { verifyToken } from "./../../middleware/auth";
import express, { Request, Response } from "express";
import { DRAFT } from "./shared";
import DraftModel from "../../models/draftSchema";
import User from "../../models/UserModel";
import { Document, Query } from "mongoose";
import { Get } from "../../services/fetch";

const router = express.Router();

router.post(DRAFT + "/import", async (req: Request, res: Response) => {
  try {
 
    console.log("HERERRERE")
    /* Check to make sure every key exists  */
    // Also, the say "ids" but they're really the NAMES or CODES of each one. This was easier for Vince to implement on the front end
    const {tag_ids, supplier_ids, brand_ids, collection_ids, reference, creator_id} = req.body; 

      if (!tag_ids) {
        throw new Error("tag_ids does not exist");
      }
      
      if (!supplier_ids) {
        throw new Error("supplier_ids does not exist");
      }
      
      if (!brand_ids) {
        throw new Error("brand_ids does not exist");
      }
      
      if (!collection_ids) {
        throw new Error("collection_ids does not exist");
      }
      
      if (!reference) {
        throw new Error("reference does not exist");
      }
      
      if (!creator_id) {
        throw new Error("creator_id does not exist");
      }
      

    const finalTagIds : any[]= []
    // Make sure tag ids exist
    if(tag_ids.length > 0) {
      for(let tagName of tag_ids) {
        const response = await Get("/tag/field/code/value", tagName);
        if(!response) {
          throw new Error(`The tag with this name was not found: ${tagName}`)
        }
        // Check to make sure the family is family
        let result: any[] = await response.json();
        let finalResult = result.filter((val, i) => { 
          
          let levelName;

          if(i === 0) levelName = "famille"
          if(i === 1) levelName = "sous-famille"
          else levelName = "sous-sous-famille"

          return val.level.toLowerCase().trim() === levelName
        } )
        if(finalResult.length === 0) {
          throw new Error(`No matching result with a level of family  ${finalResult}`)
        }
        // Push all the ids into the tag Ids
        finalResult.forEach((r) => finalTagIds.push(r._id))
      }
    }


    // let suppliers: any[] = []
    if(supplier_ids.length > 0) {
      for(let supplierName of supplier_ids) {
        const response = await Get("/supplier/field/company_name/value", supplierName)

        if(!response) {
          throw new Error(`The supplier with this name was not found: ${supplierName}`)
        }

        let result: any[] = await response.json();
        
        if(result.length === 0) {
          throw new Error(`The result of the supplier with this name was not found: ${supplierName}`)
        }

        console.log("result: " , result)

        // suppliers= [...result]
      }
    }

    // let finalBrandIds: any[] = []
    
    if(brand_ids.length > 0) {
      for(let brand of brand_ids) {
        const response = await Get("/brand/field/code/value", brand)

        if(!response) {
          throw new Error(`The brand with this name was not found: ${brand}`)
        }

        let result: any[] = await response.json();

        
        if(!result) {
          throw new Error(`The result of the brand with this name was not found: ${brand}`)
        }

        // result.forEach((r: any) => finalBrandIds.push(r._id))
        
      }
    }

    // let finalCollectionIds = []

    for(let collection of collection_ids) {
      const response = await Get("/collection/field/code/value", collection)

      if(!response) {
        throw new Error(`The collection with this name was not found: ${collection}`)
      }

      let result: any = await response.json();
      
      if(result.length === 0) {
        throw new Error(`The result of the brand with this name was not found: ${collection}`)

      }

      // finalCollectionIds.push(result._id)


    }
    
    

    const existingDraft = await DraftModel.findOne({ reference });

    if (existingDraft) {
      throw new Error(
        req.originalUrl + ", msg: There already is a draft with this name"
      );
    }


    // We will not be creating the object
    // let finalSupplierObj = []

    // for(let i = 0; i < suppliers.length; i++) {
    //   finalSupplierObj.push({ supplier_id: suppliers[i]._id})
    // }

    // const draft = { collection_ids, brand_ids, finalTagIds, reference , suppliers : finalSupplierObj} 

    // const newDraft = await new DraftModel({ ...draft });

    // if (!newDraft) {
    //   throw new Error(
    //     req.originalUrl +
    //       " msg: draft save did not work for some reason: " +
    //       draft
    //   );
    // }

    // const result: Document | null | undefined = await newDraft.save({
    //   timestamps: true,
    // });
    // if (creator_id) {
    //   await User.findByIdAndUpdate(creator_id, {
    //     $push: { products: newDraft._id },
    //   });
    // }

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});


router.post(DRAFT, async (req: Request, res: Response) => {
  try {
    const draft = req.body;
    const userId = req.body.creator_id;

    if (!draft) {
      throw new Error("req.body was falsy");
    }

    const id = req.body.id;
    const { long_label } = draft;

    const existingDraft = await DraftModel.findOne({ long_label, id });

    if (existingDraft) {
      throw new Error(
        req.originalUrl + ", msg: There already is a draft with this name"
      );
    }

    const newDraft = await new DraftModel({ ...draft, id });

    if (!newDraft) {
      throw new Error(
        req.originalUrl +
          " msg: draft save did not work for some reason: " +
          draft
      );
    }

    const result: Document | null | undefined = await newDraft.save({
      timestamps: true,
    });
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { products: newDraft._id },
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});

router.post(DRAFT + "/batch", async (req: Request, res: Response) => {
  try  {
    const drafts = req.body.drafts;
    const userId = req.body.creator_id;

    if (drafts.length === 0) {
      throw new Error("req.body was empty");
    }

    if(!userId) {
      throw new Error("No user id was present on the request")
    }

    // const id = req.body.id;
    // const { long_label } = draft;

    // const existingDraft = await DraftModel.findOne({ long_label, id });

    // if (existingDraft) {
    //   throw new Error(
    //     req.originalUrl + ", msg: There already is a draft with this name"
    //   );
    // }

    // const newDraft = await new DraftModel({ ...draft, id });

    // if (!newDraft) {
    //   throw new Error(
    //     req.originalUrl +
    //       " msg: draft save did not work for some reason: " +
    //       draft
    //   );
    // }

    // const result: Document | null | undefined = await newDraft.save({
    //   timestamps: true,
    // });
    // if (userId) {
    //   await User.findByIdAndUpdate(userId, {
    //     $push: { products: newDraft._id },
    //   });
    // }

    const insertedDrafts : any[] = await DraftModel.insertMany(drafts)
    const draftIds = insertedDrafts.map((draft) => draft._id);

    await User.findByIdAndUpdate(userId, {
      $push: { products: draftIds},
    });
    

    res.status(200).json(insertedDrafts);
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});

router.post(DRAFT + "/draft/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status !== 'number') {
    return res.status(400).json({ error: "Le champ 'status' est requis et doit être un nombre." });
  }

  try {
    // Mettre à jour le statut du brouillon
    const updatedDraft = await DraftModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ error: "Brouillon non trouvé" });
    }

    // Trouver l'utilisateur qui a créé le brouillon
    const user = await User.findById(updatedDraft.creator_id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Ajouter une notification à l'utilisateur
    user.notifications.push({
      message: `La référence ${updatedDraft.reference} que vous venez de créer est en cours de validation.`,
      date: new Date(),
      read: false
    });
    await user.save();

    res.status(200).json(updatedDraft);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du brouillon." });
  }
});


export default router;