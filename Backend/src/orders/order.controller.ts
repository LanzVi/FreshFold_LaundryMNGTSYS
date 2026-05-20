// src/orders/order.controller.ts
import { Request, Response } from 'express';
import { Service } from '../models/service.model';
import { Order } from '../models/order.model';

export async function createOrder(req: Request, res: Response) {
    try {
        const { serviceId, weightInKg } = req.body;
        const customerId = req.user.id; // Pulled securely from JWT

        // 1. Fetch current price from Database
        const service = await Service.findByPk(serviceId);
        if (!service) return res.status(404).json({ message: 'Service type not found' });

        // 2. Perform backend pricing calculation
        const calculatedTotal = service.ratePerKg * weightInKg;

        // 3. Create order record
        const newOrder = await Order.create({
            accountId: customerId,
            serviceId,
            weightInKg,
            totalPrice: calculatedTotal,
            status: 'Pending'
        });

        return res.status(201).json({ message: 'Laundry order placed successfully!', order: newOrder });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
}