//const router = require("express").Router();
const router = require("express").Router({ mergeParams: true });
// TODO: Implement the /dishes routes needed to make the tests pass
const ordersRouter = require("../orders/orders.router");
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
router.use("/:orderId/dishes", controller.dishesExists, ordersRouter);


router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);



module.exports = router;
