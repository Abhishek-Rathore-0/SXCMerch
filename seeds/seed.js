const mongoose = require("mongoose");
const Product = require("../models/merchandise");
const item = require("./data");

mongoose
  .connect("mongodb://localhost:27017/sxcdatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo Connection Open!!");
  })
  .catch((err) => {
    console.log("ERROR");
    console.log(err);
  });

const seedDB = async () => {
  await Product.deleteMany({});
  for (let i = 0; i < item.length; i++) {
    const store = new Product({
      pName: item[i].pName,
      pPrice: item[i].pPrice,
      pImage: item[i].pImage,
      pDescription: item[i].pDescription,
      pCategory: item[i].pCategory,
    });
    await store.save();
  }
};

seedDB();
