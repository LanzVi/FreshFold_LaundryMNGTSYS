import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../_helpers/db'; // Make sure this matches your DB connection helper path

// 1. Define the class inheriting from Model with strict typing signatures
export class Service extends Model<InferAttributes<Service>, InferCreationAttributes<Service>> {
    // CreationOptional tells TypeScript that 'id' is auto-incremented by MySQL and not required during creation
    declare id: CreationOptional<number>;
    declare name: string;
    declare ratePerKg: number;
}

// 2. Initialize the model schema
Service.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ratePerKg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'service',
    tableName: 'services' // Keeps your database naming structure explicit
});