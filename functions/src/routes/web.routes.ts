import {Router as expressRouter} from "express";

import WebContoller from "../controllers/web.controller";

const router = expressRouter();

router.post("/", WebContoller.extractWeb);

export default router;
