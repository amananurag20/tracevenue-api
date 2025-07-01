const express = require("express");
const router = express.Router();
const staffRoleController = require("../controllers/staffRoleController");


router.post("/create-new-role", staffRoleController.createNewRole);
router.post("/get-all-roles/:id", staffRoleController.getAllRoles);
router.delete("/delete-role/:id", staffRoleController.deleteRole);

module.exports = router;
