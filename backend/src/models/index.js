import { User } from './User.js';
import { Session } from './Session.js';
import { Product } from './Product.js';
import { Supplier, Material, Provider, Certification } from './Catalog.js';

export const models = { User, Session, Product, Supplier, Material, Provider, Certification };

/** Builds indexes (unique constraints, session expiry) so they exist before the first write. */
export const initModels = () => Promise.all(Object.values(models).map((m) => m.init()));
