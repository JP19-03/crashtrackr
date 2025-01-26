import type { Request, Response, NextFunction } from 'express';
import { param, validationResult, body } from 'express-validator';
import Expense from '../models/Expense';

declare global {
    namespace Express {
        interface Request {
            expense?: Expense;
        }
    }
}

export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
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

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId')
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

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params
        const expense = await Expense.findByPk(expenseId)

        if (!expense) {
            res.status(404).json({ error: "Expense not found" })
            return
        }

        req.expense = expense

        next()
    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: "There was an error getting the budget" });
    }
}