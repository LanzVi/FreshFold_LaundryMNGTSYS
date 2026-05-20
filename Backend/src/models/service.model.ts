import { DataTypes, Model } from 'sequelize';
import sequelize from '../_helpers/db'; // Adjust path based on your boilerplate's DB connection file

export class Service extends Model {
    public id!: number;
    public name!: string;
    public ratePerKg!: number;
}

Service.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    ratePerKg: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { sequelize, modelName: 'service' });