import type { Request, Response } from 'express';
import Budget from '../models/Budget';

export class BudgetController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                // TODO: Filter by authenticated user
            });

            res.status(200).json(budgets);
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: "There was an error getting the budgets" });
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body);

            await budget.save();

            res.status(201).json('Budget created successfully');
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: "There was an error creating the budget" });
        }
    }

    static getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const budget = await Budget.findByPk(id);

            if (!budget) {
                const error = new Error("Budget not found");
                res.status(404).json({ error: error.message });
                return;
            }

            res.status(200).json(budget);
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: "There was an error getting the budget" });
        }
    }

    static updateById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const budget = await Budget.findByPk(id);

            if (!budget) {
                const error = new Error("Budget not found");
                res.status(404).json({ error: error.message });
                return;
            }

            // Update the budget
            await budget.update(req.body);

            res.status(200).json('Budget updated successfully');
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: "There was an error getting the budget" });
        }
    }

    static deleteById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const budget = await Budget.findByPk(id);

            if (!budget) {
                const error = new Error("Budget not found");
                res.status(404).json({ error: error.message });
                return;
            }

            await budget.destroy();

            res.status(200).json('Budget deleted successfully');
        } catch (error) {
            // console.log(error);
            res.status(500).json({ error: "There was an error getting the budget" });
        }
    }
}