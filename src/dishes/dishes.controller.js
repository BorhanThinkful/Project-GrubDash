const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  
  const newDishId = nextId();
  const newDishes = {
    id: newDishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url
  };
  dishes.push(newDishes);
  res.status(201).json({ data: newDishes });
}


const dishesExists = (req, res, next) => {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish === undefined) {
    return next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
  }
  res.locals.dish = foundDish;
  next();
};



function read(req,res,next){
  const newDish = {
    id: nextId,
    dishId: res.locals.dish.id,
    name: res.locals.dish.name,
    description: res.locals.dish.description,
    price: res.locals.dish.price,
    image_url: res.locals.dish.image_url,
  };
  dishes.push(newDish);
  res.json({data: res.locals.dish});
};

function update(req, res, next) {
  let foundDish = res.locals.dish;
  const { data: { id, name, description, image_url, price } = {} } = req.body;
  if (id) {
    if (foundDish.id !== id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${foundDish.id}, Route: ${id}`,
      });
    }
  }
  foundDish = {
    ...foundDish,
    name: name,
    description: description,
    image_url: image_url,
    price: price,
  };
  res.json({ data: foundDish });
};

function list(req, res, next) {
  res.json({ data: dishes });
};

function priceIsValid(req, res, next){
  const { data: { price }  = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)){
      return next({
          status: 400,
          message: `Dish must have a price that is an integer greater than 0`
      });
  }
  next();
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `Dish must include a ${propertyName}`
    });
  };
};



module.exports={
  create: [
     bodyDataHas("name"),
     bodyDataHas("description"),
     bodyDataHas("price"),
     bodyDataHas("image_url"),
     priceIsValid,
      create
  ],
  list,
  read: [dishesExists, read],
  update: [
      dishesExists,
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      priceIsValid,
      update
  ],
  dishesExists,
}










