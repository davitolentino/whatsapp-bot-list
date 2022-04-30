const mime = require("mime");
const path = require("path");

const { MessageMedia } = require("whatsapp-web.js");

const fs = require("fs");

const messageMediaFromFilePath = (filePath) => {
  const b64data = fs.readFileSync(filePath, { encoding: "base64" });
  const mimetype = mime.getType(filePath);
  const filename = path.basename(filePath);

  return new MessageMedia(mimetype, b64data, filename);
};

module.exports = { messageMediaFromFilePath };
