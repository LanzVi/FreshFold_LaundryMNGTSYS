import { Request, Response } from 'express';
import { Service } from '../models/service.model';

export async function getAllServices(req: Request, res: Response) {
    try {
        const services = await Service.findAll();
        return res.status(200).json(services);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving services', error });
    }
}