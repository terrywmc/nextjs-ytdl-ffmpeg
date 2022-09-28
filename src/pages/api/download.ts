// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";

type Data = {
  url?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url } = req.body;
  const options = {
    quality: "highestaudio",
  };
  await ytdl(url, options)
    .on("error", () => {
      res.status(500).send({ success: false });
    })
    .pipe(res);
}
