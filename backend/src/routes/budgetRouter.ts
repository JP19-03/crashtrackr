import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

// Get all budgets
router.get("/", BudgetController.getAll);

// Create a budget
router.post("/",
    body('name')
        .notEmpty().withMessage("Name is required"),
    body('amount')
        .notEmpty().withMessage("Amount is required")
        .isNumeric().withMessage("Amount must be a number")
        .custom((value) => value > 0).withMessage("Amount must be greater than 0"),
    handleInputErrors,
    BudgetController.create
);

// Get a budget by ID
router.get("/:id",
    param('id')
        .isInt().withMessage("ID not valid")
        .custom((value) => value > 0).withMessage("ID must be greater than 0"),
    handleInputErrors,
    BudgetController.getById
);

// Update a budget by ID
router.put("/:id",
    param('id')
        .isInt().withMessage("ID not valid")
        .custom((value) => value > 0).withMessage("ID must be greater than 0"),
    handleInputErrors,
    body('name')
        .notEmpty().withMessage("Name is required"),
    body('amount')
        .notEmpty().withMessage("Amount is required")
        .isNumeric().withMessage("Amount must be a number")
        .custom((value) => value > 0).withMessage("Amount must be greater than 0"),
    handleInputErrors,
    BudgetController.updateById
);

// Delete a budget by ID
router.delete("/:id",
    param('id')
        .isInt().withMessage("ID not valid")
        .custom((value) => value > 0).withMessage("ID must be greater than 0"),
    handleInputErrors,
    BudgetController.deleteById
);

export default router;