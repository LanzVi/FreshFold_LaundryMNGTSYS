// src/app/_services/laundry.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class LaundryService {
    constructor(private http: HttpClient) {}

    getServices() {
        return this.http.get<any[]>(`${environment.apiUrl}/services`);
    }

    placeOrder(serviceId: number, weightInKg: number) {
        return this.http.post(`${environment.apiUrl}/orders`, { serviceId, weightInKg });
    }
    
    getAdminOrders() {
        return this.http.get<any[]>(`${environment.apiUrl}/admin/orders`);
    }
}