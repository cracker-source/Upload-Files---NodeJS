const { StatusCodes } = require("http-status-codes");
const path = require("path");
const CustomError = require("../errors/index");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadProductImageOld = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded");
  }

  const productImage = req.files.image;

  // checking wheather the file is image or not
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload an image");
  }

  const maxSize = 1024 * 1024; // 1000 === 1 KB

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1 KB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  await productImage.mv(imagePath);

  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${productImage.name}` } });
};

const uploadProductImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );

  // deleting the temporarly stored files
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = {
  uploadProductImage,
};
