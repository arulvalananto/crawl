import {Request, Response} from "express";
import axios, {AxiosResponse} from "axios";

import ExtractWeb from "../common/ExtractWeb";

/**
 * controller function for website/webpage extraction
 */
class WebContoller {
  /**
   * Extract website/webpage based on given url
   * @param {Request} req
   * @param {Response} res
   */
  static async extractWeb(req: Request, res: Response) {
    try {
      const {url} = req.body;

      const response: AxiosResponse<string> = await axios.get(url);
      const html = response.data;

      const extractWeb = new ExtractWeb(url, html);

      res.status(200).json(extractWeb.getData());
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({message: error.message});
      } else {
        res.status(400).json({message: "Something went wrong!"});
      }
    }
  }
}

export default WebContoller;
