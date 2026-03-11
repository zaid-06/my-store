import { Router } from "express";
import { downloadController } from "./download.controller";

const router = Router();

router.get("/:token", downloadController);

export default router;

