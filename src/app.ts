import express from "express";
import validUrl from 'valid-url';
import { addUrl, getUrl } from "./lib/dummyDB";
import generateUid from "./lib/uid";
const app = express();

app.use(express.json());

app.post("/api/shorten", (req, res) => {
  const { url } = req.body;
  if (!url) throw { status: 400, message: "Missing url param" };
	if(!validUrl.isUri(url)) throw {status: 400, message: "Not a url"};

	const uid = generateUid();
	addUrl(uid, url);
	res.status(200)
	
	res.send({shortUrl: `http://localhost:3000/${uid}`});
	res.end();
	
});

app.get('/:uid',async (req,res) => {
	const {uid}  = req.params;
	const url = await getUrl(uid);
	res.redirect(url)
});

app.use((err, req, res,_) => {
  if (err.status) {
    res.status(err.status);
    res.send({
      error: err.message,
    });
  } else {
		console.log(err);
		res.status(500);
		res.send({error: "Internal server error"})
	}

	res.end();
});

export default app;
