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
        res.json(req.budget);
    }

    static updateById = async (req: Request, res: Response) => {
        await req.budget.update(req.body);
        res.status(200).json('Budget updated successfully');
    }

    static deleteById = async (req: Request, res: Response) => {
        await req.budget.destroy();
        res.status(200).json('Budget deleted successfully');
    }
}