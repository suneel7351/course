import Datauri from "datauri/parser.js";
import path from "path";
// Datauri to convert the uploaded file to a base64-encoded data URI

const dUri = new Datauri();

const dataUri = (req) => {
  return dUri.format(
    path.extname(req.file.originalname).toString(),
    req.file.buffer
  );
};
export default dataUri;
