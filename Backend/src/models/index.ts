import { Account } from './account.model'; // Assuming your boilerplate already has an Account model
import { Service } from './service.model';
import { Order } from './order.model';

// Relationships / Associations
Account.hasMany(Order, { foreignKey: 'accountId' });
Order.belongsTo(Account, { foreignKey: 'accountId' });

Service.hasMany(Order, { foreignKey: 'serviceId' });
Order.belongsTo(Service, { foreignKey: 'serviceId' });

export { Account, Service, Order };