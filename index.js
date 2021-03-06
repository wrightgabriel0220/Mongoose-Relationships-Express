const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Farm = require('./models/farm');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const categories = ["fruit", "vegetable", "dairy"];

const Product = require("./models/product");
const { findById, findByIdAndDelete } = require("./models/farm");

mongoose
  .connect("mongodb://localhost:27017/farmStandTake2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO, A MONGO CONNECTION ERROR!!!");
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// FARM ROUTES
// Read - Farms Index
app.get('/farms', catchAsync(async (req, res) => {
  const farms = await Farm.find({});
  res.render('farms/index', { farms });
}))

// Create - Farms
app.get('/farms/new', (req, res) => {
  res.render('farms/new');
})

// Read - Farms Show 
app.get('/farms/:id', catchAsync(async (req, res) => {
  const farm = await Farm.findById(req.params.id).populate('products');
  res.render('farms/show', { farm });
}))

app.delete('/farms/:id', catchAsync(async (req, res) => {
  console.log("DELETING!")
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect('/farms');
}))

app.post('/farms', catchAsync(async (req, res) => {
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect('/farms');
}))

// PRODUCT ROUTES
// Create - Products
app.get('/farms/:id/products/new', catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    res.render('products/new', { categories, farm });
}))

app.post('/farms/:id/products', catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`);
}))

app.get("/products/:id/details", catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("farm");
  res.render("products/details", { product });
}));



/*app.get("/products", async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  } else {
    const products = await Product.find({});
    res.render("products/index", { products, category });
  }
});

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.get("/products/:id/edit", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect("/products");
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });
  res.redirect(`/products/${product._id}`);
});

*/
app.delete("/products/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = Product.findById(id);
  const farm = product.farm;
  await product.deleteOne();
  console.log(farm);
  res.redirect(`/farms/${farm}`);
}));
/*

//------------------------------------------------------------------------------------------------------

app.get("/*", (req, res) => {
  console.log("Couldn't find requested address. Redirected to index page");
  res.redirect("/products");
});*/

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  if(!err.message) err.message = "Oh No, Something Went Wrong!";
  console.log(err.message);
})

app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000!");
});
