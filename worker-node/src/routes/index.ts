import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.render("index", { title: process.env.NAME_APP });
});

export default router;
