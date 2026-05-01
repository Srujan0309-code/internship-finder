/**
 * Generates pagination metadata and applies skip/limit to a Mongoose query.
 * @param {Object} model - Mongoose model
 * @param {Object} query - MongoDB filter object
 * @param {Object} options - { page, limit, sort, select, populate }
 * @returns { data, meta }
 */
const paginate = async (model, query = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';
  const populate = options.populate || null;

  let dbQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (select) dbQuery = dbQuery.select(select);
  if (populate) dbQuery = dbQuery.populate(populate);

  const [data, total] = await Promise.all([dbQuery.lean(), model.countDocuments(query)]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

module.exports = paginate;
