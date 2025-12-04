import mongoose from 'mongoose';

/**
 * Helper to add tenant filter to query
 */
export function withTenantFilter<T>(
  tenantId: string | mongoose.Types.ObjectId,
  filter: any = {}
): any {
  return {
    tenantId,
    ...filter,
  };
}

/**
 * Helper to create tenant-scoped model wrapper
 */
export function createTenantScopedModel<T extends mongoose.Model<any>>(
  Model: T,
  tenantId: string | mongoose.Types.ObjectId
) {
  return {
    find: (filter = {}) => Model.find(withTenantFilter(tenantId, filter)),
    findOne: (filter = {}) => Model.findOne(withTenantFilter(tenantId, filter)),
    findById: (id: string) => Model.findOne(withTenantFilter(tenantId, { _id: id })),
    count: (filter = {}) => Model.countDocuments(withTenantFilter(tenantId, filter)),
    create: (data: any) => Model.create({ ...data, tenantId }),
    updateOne: (filter: any, update: any) =>
      Model.updateOne(withTenantFilter(tenantId, filter), update),
    updateMany: (filter: any, update: any) =>
      Model.updateMany(withTenantFilter(tenantId, filter), update),
    deleteOne: (filter: any) =>
      Model.deleteOne(withTenantFilter(tenantId, filter)),
    deleteMany: (filter: any) =>
      Model.deleteMany(withTenantFilter(tenantId, filter)),
  };
}

/**
 * Validate all documents belong to tenant
 */
export async function validateTenantOwnership(
  Model: mongoose.Model<any>,
  tenantId: string | mongoose.Types.ObjectId,
  ids: string[]
): Promise<boolean> {
  const count = await Model.countDocuments({
    _id: { $in: ids },
    tenantId,
  });

  return count === ids.length;
}
