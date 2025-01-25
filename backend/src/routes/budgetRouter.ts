import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { validateBudgetExists, validateBudgetId, validateBudgetInput } from "../middleware/budget";

const router = Router();

// Validate budget ID parameter
router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists);

// Get all budgets
router.get("/", BudgetController.getAll);

// Create a budget
router.post("/",
    validateBudgetInput,
    handleInputErrors,
    BudgetController.create
);

// Get a budget by ID
router.get("/:budgetId", BudgetController.getById);

// Update a budget by ID
router.put("/:budgetId",
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById
);

// Delete a budget by ID
router.delete("/:budgetId", BudgetController.deleteById);

export default router;