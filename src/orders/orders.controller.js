const path = require("path");
const { isArray } = require("util");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const orderIsValid = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  let invalidOrder = [];
  if (deliverTo === undefined || deliverTo === "") {
    invalidOrder.push("deliverTo");
  }
  if (mobileNumber === undefined || mobileNumber === "") {
    invalidOrder.push("mobileNumber");
  }
  if (dishes === undefined || !Array.isArray(dishes) || dishes.length === 0) {
    invalidOrder.push("dish");
  }

  if (invalidOrder.length !== 0) {
    return next({
      status: 400,
      message: `please check this following inputs: ${invalidOrder}`,
    });
  } else {
    dishes.forEach((dish, index) => {
      if (
        dish.quantity <= 0 ||
        !dish.quantity ||
        !Number.isSafeInteger(dish.quantity)
      ) {
        return next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
    return next();
  }
};

function list(req, res) {
  res.json({ data: orders });
};

function update(req, res, next) {
  let foundOrder = res.locals.order;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body;
  if (id) {
    if (foundOrder.id !== id) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${foundOrder.id}, Route: ${id}`,
      });
    }
  }

  if (status)
    foundOrder = {
      ...foundOrder,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
  res.json({ data: foundOrder });
};

function ordersExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrders = orders.find(order => order.id === orderId);
  if (foundOrders) {
    res.locals.order = foundOrders;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
};

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
  const newOrderId = nextId();
  const newOrders = {
    id: newOrderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
    
  };
  orders.push(newOrders);
  res.status(201).json({ data: newOrders });
}

// function bodyDataHas(propertyName) {
//   return function (req, res, next) {
//     const { data = {} } = req.body;
//     if (data[propertyName]) {
//       return next();
//     }
//     next({
//         status: 400,
//         message: `Order must include a ${propertyName}`
//     });
//   };
// };

function statusPropertyIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }

  status === "delivered"
    ? next({
        status: 400,
        message: `A delivered order cannot be changed`,
      })
    : next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
}

function destroy(req, res, next) {
  const { orderId } = req.params;

  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}


function read(req, res, next) {
  res.json({ data: res.locals.order });
};

module.exports = {
  create: [
//       bodyDataHas("deliverTo"),
//       bodyDataHas("mobileNumber"),
//       bodyDataHas("status"),
//       bodyDataHas("dishes"),
      orderIsValid,
      create],
  list,
  read: [ordersExists, read],
  update: [
      ordersExists,orderIsValid, statusPropertyIsValid,
//       bodyDataHas("deliverTo"),
//       bodyDataHas("mobileNumber"),
//       bodyDataHas("status"),
//       bodyDataHas("dishes"),
      update
  ],
  delete: [ordersExists, destroy],
  ordersExists,
  
};