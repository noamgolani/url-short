import express from "express";
import path from 'path';
import validUrl from "valid-url";
import { addUrl, getUrl, getUrlData, updateStats } from "./lib/dummyDB";
const app = express();

app.use(express.json());

app.use('/app',express.static(path.resolve('./public')));

app.get('/app', (req,res) => {
	res.sendFile(path.resolve('./public/index.html'));
});

app.post("/api/shorten", async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) throw { status: 400, message: "Missing url param" };
    if (!validUrl.isUri(url)) throw { status: 400, message: "Not a url" };

    const uid = await addUrl(url);
    res.status(200);

    res.send({ shortUrl: `http://localhost:3000/${uid}` });
    res.end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats/:uid", async (req, res, next) => {
  const { uid } = req.params;
  try {
    const data = await getUrlData(uid);
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.get("/:uid", async (req, res, next) => {
  const { uid } = req.params;
  try {
    const url = await getUrl(uid);
    updateStats(uid);
    res.redirect(url);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, _) => {
  if (err.status) {
    res.status(err.status);
    res.send({
      error: err.message,
    });
  } else {
    console.log(err);
    res.status(500);
    res.send({ error: "Internal server error" });
  }

  res.end();
});

export default app;
