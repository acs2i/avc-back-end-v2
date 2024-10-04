import { verifyToken } from "./../../middleware/auth";
import express, { Request, Response } from "express";
import { DRAFT } from "./shared";
import DraftModel from "../../models/draftSchema";
import GroupModel from "../../models/groupSchema";
import User from "../../models/UserModel";
import { Get } from "../../services/fetch";

const router = express.Router();

router.get(DRAFT + "/id", async (req: Request, res: Response) => {
  try {
 
    /* Check to make sure every key exists  */
    // Also, the say "ids" but they're really the NAMES or CODES of each one. This was easier for Vince to implement on the front end
    const tag_ids: string[] = req.query.tag_ids as string[]
    const supplier_ids: string[] = req.query.supplier_ids as string[]
    const brand_ids: string[] = req.query.brand_ids as string[];
    // const collection_ids: string[] = req.query.collection_ids as string[]
    // const reference: string = req.query.reference as string;
    // const creator_id: string = req.query.creator_id as string;

    // Vérifications des champs
    if (!tag_ids || !Array.isArray(tag_ids)) {
      throw new Error("tag_ids does not exist or is not an array");
    }
    
    if (!supplier_ids || !Array.isArray(supplier_ids)) {
      throw new Error("supplier_ids does not exist or is not an array");
    }

    if (!brand_ids || !Array.isArray(brand_ids)) {
      throw new Error("brand_ids does not exist or is not an array");
    }

    // if (!collection_ids || !Array.isArray(collection_ids)) {
    //   throw new Error("collection_ids does not exist or is not an array");
    // }

    // if (!reference) {
    //   throw new Error("reference does not exist");
    // }

    // if (!creator_id) {
    //   throw new Error("creator_id does not exist");
    // }

    const finalTagIds: any[] = [];
    // Vérifiez si tag_ids est un tableau et qu'il contient des éléments
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (let tagName of tag_ids) {
        const response = await Get("/tag/field/code/value", tagName);
        if (!response) {
          throw new Error(`The tag with this name was not found: ${tagName}`);
        }

        let result: any[] = await response.json();
        
        if(result.length > 0) {
          finalTagIds.push(result[0]._id)
        }
      }
    }

    let suppliers: any[] = [];
    if (Array.isArray(supplier_ids) && supplier_ids.length > 0) {
      for (let supplierName of supplier_ids) {
        const response = await Get("/supplier/field/company_name/value", supplierName);
        if (!response) {
          throw new Error(`The supplier with this name was not found: ${supplierName}`);
        }

        let result: any[] = await response.json();
        if (result.length === 0) {
          throw new Error(`The result of the supplier with this name was not found: ${supplierName}`);
        }

        suppliers = [...result];
      }
    }

    let finalBrandIds: any[] = [];
    if (Array.isArray(brand_ids) && brand_ids.length > 0) {
      for (let brand of brand_ids) {
        const response = await Get("/brand/field/label/value", brand);
        if (!response) {
          throw new Error(`The brand with this name was not found: ${brand}`);
        }

        let result: any[] = await response.json();
        if (!result) {
          throw new Error(`The result of the brand with this name was not found: ${brand}`);
        }

        result.forEach((r: any) => finalBrandIds.push(r._id));
      }
    }

    // let finalCollectionIds: any[] = [];
    // if (Array.isArray(collection_ids) && collection_ids.length > 0) {
    //   for (let collection of collection_ids) {
    //     const response = await Get("/collection/field/code/value", collection);
    //     if (!response) {
    //       throw new Error(`The collection with this name was not found: ${collection}`);
    //     }

    //     let result: any = await response.json();
    //     if (result.length === 0) {
    //       throw new Error(`The result of the collection with this name was not found: ${collection}`);
    //     }

    //     finalCollectionIds.push(result._id);
    //   }
    // }

    // const existingDraft = await DraftModel.findOne({ reference });
    // if (existingDraft) {
    //   throw new Error(`${req.originalUrl}, msg: There already is a draft with this name`);
    // }

    const result = { 
       
      finalBrandIds, finalTagIds, suppliers };
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
});

router.get(
  DRAFT + "/:id",
  // verifyToken,
  async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
      const _id = req.params.id;

      if (!_id) {
        throw new Error("Id was falsy");
      }

      const data = await DraftModel.findById(_id);

      if (!data) {
        throw new Error("Finding the Drafts returned falsy for some reason");
      }

      if (!req.user) {
        throw new Error("User was not authenticated");
      }

      // Make sure authorization token matches
      const idFromToken = req.user.id;

      const { creator_id } = data;

      const creatorId: string = creator_id as unknown as string;

      if (creatorId != idFromToken) {
        throw new Error(
          "Id passed from user does not match their authentication token"
        );
      }

      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(400).json({});
    }
  }
);

// This will just fetch all the drafts that are in the avc backend database
router.get(
  DRAFT + "/creator-id/:creatorId",
  verifyToken,
  async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
      const creatorId = req.params.creatorId;

      if (!creatorId) {
        throw new Error("Creator Id was falsy");
      }

      if (!req.user) {
        throw new Error("User was not authenticated");
      }
      // Make sure authorization token matches
      const idFromToken = req.user.id;

      if (creatorId !== idFromToken) {
        throw new Error(
          "Id passed from user does not match their authentication token"
        );
      }

      const filter = { creator_id: idFromToken };

      const data = await DraftModel.find(filter);

      if (!data) {
        throw new Error("Finding the Drafts returned falsy for some reason");
      }

      const total = await DraftModel.countDocuments(filter);

      res.status(200).json({ data, total });
    } catch (err) {
      console.error(req.originalUrl + ", msg: error : " + err);
      res.status(400).json({});
    }
  }
);

// This will just fetch all the drafts that are in the avc backend database
router.get(
  DRAFT + "/ga-libelle/:designation_longue",
  verifyToken,
  async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
      const designation_longue = req.params.designation_longue;

      if (!designation_longue) {
        throw new Error("Creator Id was falsy");
      }

      const filter = { designation_longue };

      const data = await DraftModel.findOne(filter);

      if (!data) {
        throw new Error("Finding the Drafts returned falsy for some reason");
      }

      res.status(200).json(data);
    } catch (err) {
      console.error(req.originalUrl + ", msg: error : " + err);
      res.status(400).json({});
    }
  }
);

router.get(DRAFT + "/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const drafts = await DraftModel.find({ creator_id: userId }).populate("creator_id");
    res.status(200).json(drafts);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des brouillons.",
    });
  }
});

router.get(
  DRAFT + "/draft/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const draft = await DraftModel.findById(id);
      res.status(200).json(draft);
    } catch (err) {
      console.error("Error: ", err);
      res.status(500).json({
        error:
          "Une erreur est survenue lors de la récupération des brouillons.",
      });
    }
  }
);

router.delete(
  DRAFT + "/draft/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const draft = await DraftModel.findById(id);

      if (!draft) {
        return res.status(404).json({ error: "Brouillon non trouvé" });
      }

      await DraftModel.findByIdAndDelete(id);
      res.status(200).json("Brouillon supprimé");
    } catch (err) {
      console.error("Error: ", err);
      res
        .status(500)
        .json({
          error: "Une erreur est survenue lors de la suppression du brouillon.",
        });
    }
  }
);

export default router;
