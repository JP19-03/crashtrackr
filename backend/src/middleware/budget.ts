import type { Request, Response, NextFunction } from 'express';
import { param, validationResult, body } from 'express-validator';
import Budget from '../models/Budget';

declare global {
    namespace Express {
        interface Request {
            budget?: Budget;
        }
    }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    await param('budgetId')
        .isInt().withMessage("ID not valid")
        .custom((value) => value > 0).withMessage("ID must be greater than 0")
        .run(req)

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)

        if (!budget) {
            res.status(404).json({ error: "Budget not found" })
            return
        }

        req.budget = budget

        next()
    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: "There was an error getting the budget" });
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty().withMessage("Name is required")
        .run(req)
    await body('amount')
        .notEmpty().withMessage("Amount is required")
        .isNumeric().withMessage("Amount must be a number")
        .custom((value) => value > 0).withMessage("Amount must be greater than 0")
        .run(req)

    next()
}

export function hasAccess(req: Request, res: Response, next: NextFunction) {
    if (req.budget.userId !== req.user.id) {
        const error = new Error("Unauthorized")
        res.status(401).json({ error: error.message })
        return
    }
    next()
}