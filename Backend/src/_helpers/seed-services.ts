// src/_helpers/seed-services.ts
import { Service } from '../models/service.model';

export async function seedLaundryServices() {
    const servicesCount = await Service.count();
    if (servicesCount === 0) {
        await Service.bulkCreate([
            { name: 'Wash & Fold', ratePerKg: 65.00 },
            { name: 'Dry Cleaning', ratePerKg: 140.00 },
            { name: 'Ironing & Press', ratePerKg: 40.00 },
            { name: 'Bedsheet & Linens', ratePerKg: 120.00 },
            { name: 'Express Wash & Fold', ratePerKg: 99.50 }
        ]);
        console.log('Laundry services rates successfully seeded.');
    }
}