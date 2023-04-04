import multer, { memoryStorage } from "multer";

//
const singleUpload = multer({
  // stores files in memory as a buffer object
  // req.file se file ka reference jaise hi khtm hoga ye memory se buffer delete kr dega
  storage: memoryStorage(),
}).single("file");

export default singleUpload;
