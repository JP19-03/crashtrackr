import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { hasAccess, validateBudgetExists, validateBudgetId, validateBudgetInput } from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { validateExpenseExists, validateExpenseId, validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Validate budget ID parameter
router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists);
router.param('budgetId', hasAccess);

// Validate expense ID parameter
router.param('expenseId', validateExpenseId);
router.param('expenseId', validateExpenseExists);

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

/** Routes for expenses */

router.post("/:budgetId/expenses",
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create
);

router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById);

router.put("/:budgetId/expenses/:expenseId",
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById
);

router.delete("/:budgetId/expenses/:expenseId", ExpensesController.deleteById);

export default router;