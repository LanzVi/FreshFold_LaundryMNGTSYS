import { DataTypes, Model } from 'sequelize';
import sequelize from '../_helpers/db';

export class Order extends Model {
    public id!: number;
    public accountId!: number;
    public serviceId!: number;
    public weightInKg!: number;
    public totalPrice!: number;
    public status!: string;
}

Order.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    serviceId: { type: DataTypes.INTEGER, allowNull: false },
    weightInKg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Pending' }
}, { sequelize, modelName: 'order' });