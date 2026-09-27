function invalid(message) {
  return { success: false, message };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export const createTodoBodySchema = {
  safeParse(input) {
    if (!isObject(input)) {
      return invalid('request body must be a JSON object');
    }

    if (typeof input.title !== 'string' || input.title.trim() === '') {
      return invalid('title must be a non-empty string');
    }

    return { success: true, data: { title: input.title.trim() } };
  },
};

export const updateTodoBodySchema = {
  safeParse(input) {
    if (!isObject(input)) {
      return invalid('request body must be a JSON object');
    }

    if (typeof input.completed !== 'boolean') {
      return invalid('completed must be a boolean');
    }

    return { success: true, data: { completed: input.completed } };
  },
};

export const todoIdParamsSchema = {
  safeParse(input) {
    if (!isObject(input) || typeof input.id !== 'string' || !/^[1-9]\d*$/.test(input.id)) {
      return invalid('id must be a positive integer');
    }

    const id = Number(input.id);

    if (!Number.isSafeInteger(id) || id > 2147483647) {
      return invalid('id must be a positive integer');
    }

    return { success: true, data: { id } };
  },
};

function parsePositiveQueryInteger(input, field, defaultValue, maximum) {
  const value = input[field];

  if (value === undefined) {
    return { success: true, value: defaultValue };
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return invalid(`${field} must be a positive integer`);
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > maximum) {
    return invalid(`${field} must be no greater than ${maximum}`);
  }

  return { success: true, value: number };
}

export const todoListQuerySchema = {
  safeParse(input) {
    if (!isObject(input)) {
      return invalid('query parameters must be an object');
    }

    const q = input.q === undefined ? '' : input.q;
    if (typeof q !== 'string' || q.trim().length > 100) {
      return invalid('q must be a string of at most 100 characters');
    }

    const status = input.status ?? 'all';
    if (!['all', 'active', 'completed'].includes(status)) {
      return invalid('status must be all, active, or completed');
    }

    const sortBy = input.sortBy ?? 'id';
    if (!['id', 'title'].includes(sortBy)) {
      return invalid('sortBy must be id or title');
    }

    const order = input.order ?? 'asc';
    if (!['asc', 'desc'].includes(order)) {
      return invalid('order must be asc or desc');
    }

    const pageResult = parsePositiveQueryInteger(input, 'page', 1, 1000000);
    if (!pageResult.success) return pageResult;

    const pageSizeResult = parsePositiveQueryInteger(input, 'pageSize', 10, 50);
    if (!pageSizeResult.success) return pageSizeResult;

    return {
      success: true,
      data: {
        q: q.trim(),
        status,
        sortBy,
        order,
        page: pageResult.value,
        pageSize: pageSizeResult.value,
      },
    };
  },
};
