// #STAGE3-A
// NoSQL Injection Protection - Input validation and sanitization utilities for MongoDB

// Validates string input and blocks MongoDB operator characters ($ and .)
function validateStringInput(value, fieldName, options = {}) {
  const { maxLength = 500, allowDots = false } = options;

  // Type check - prevents object injection like { "$gt": "" }
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string, received ${typeof value}`
    };
  }

  if (value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`
    };
  }

  // Block $ character - prevents MongoDB operator injection
  if (value.includes('$')) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid character: $`
    };
  }

  // Block dots - prevents nested field access injection
  if (!allowDots && value.includes('.')) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid character: .`
    };
  }

  return {
    isValid: true,
    sanitized: value.trim()
  };
}

// Validates book_id - only allows lowercase letters, numbers, and underscores
function validateBookId(bookId) {
  const result = validateStringInput(bookId, 'book_id', { maxLength: 255 });
  if (!result.isValid) return result;

  // Whitelist pattern - safe characters only
  const bookIdPattern = /^[a-z0-9_]+$/;
  if (!bookIdPattern.test(result.sanitized)) {
    return {
      isValid: false,
      error: 'book_id must contain only lowercase letters, numbers, and underscores'
    };
  }

  return result;
}

// Validates title for regex search - escapes special characters to prevent ReDoS attacks
function validateTitleSearch(title) {
  const result = validateStringInput(title, 'title', { maxLength: 500, allowDots: true });
  if (!result.isValid) return result;

  // Escape regex chars so ".*" becomes "\.\*" (prevents wildcard injection)
  const regexSafe = escapeRegex(result.sanitized);

  return {
    isValid: true,
    sanitized: result.sanitized,
    regexSafe: regexSafe
  };
}

// Escapes regex special characters for safe use in RegExp
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validates numeric parameters - rejects objects to prevent operator injection
function validateNumericParam(value, fieldName, options = {}) {
  const { min, max } = options;

  if (value === undefined || value === null || value === '') {
    return { isValid: true, value: undefined };
  }

  // Reject objects like { $gt: 0 }
  if (typeof value === 'object') {
    return {
      isValid: false,
      error: `${fieldName} must be a number, received object`
    };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`
    };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${max}`
    };
  }

  return {
    isValid: true,
    value: num
  };
}

// Validates date parameters
function validateDateParam(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, value: undefined };
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    return {
      isValid: false,
      error: `${fieldName} must be a date string, received object`
    };
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date`
    };
  }

  return {
    isValid: true,
    value: date
  };
}

// Middleware: validates book ID in route params
function validateBookIdParam(req, res, next) {
  const result = validateBookId(req.params.bookId);
  if (!result.isValid) {
    return res.status(400).json({ error: result.error });
  }
  req.params.bookId = result.sanitized;
  next();
}

// Middleware: validates book creation/update body
function validateBookBody(req, res, next) {
  const { title } = req.body;

  if (title !== undefined) {
    const result = validateStringInput(title, 'title', { maxLength: 500, allowDots: true });
    if (!result.isValid) {
      return res.status(400).json({ error: result.error });
    }
    req.body.title = result.sanitized;
  }

  next();
}

// Middleware: validates query params for book listing (duration, segments, dates, title)
function validateBookQueryParams(req, res, next) {
  const errors = [];

  const numericParams = [
    { name: 'minDuration', options: { min: 0 } },
    { name: 'maxDuration', options: { min: 0 } },
    { name: 'minSegments', options: { min: 0 } },
    { name: 'maxSegments', options: { min: 0 } }
  ];

  for (const param of numericParams) {
    if (req.query[param.name] !== undefined) {
      const result = validateNumericParam(req.query[param.name], param.name, param.options);
      if (!result.isValid) {
        errors.push(result.error);
      } else {
        req.query[param.name] = result.value;
      }
    }
  }

  const dateParams = ['startDate', 'endDate'];
  for (const param of dateParams) {
    if (req.query[param] !== undefined) {
      const result = validateDateParam(req.query[param], param);
      if (!result.isValid) {
        errors.push(result.error);
      } else {
        req.query[param] = result.value;
      }
    }
  }

  // Title search with regex escaping for safe queries
  if (req.query.title !== undefined) {
    const result = validateTitleSearch(req.query.title);
    if (!result.isValid) {
      errors.push(result.error);
    } else {
      req.query.title = result.sanitized;
      req.query.titleRegexSafe = result.regexSafe;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = {
  validateStringInput,
  validateBookId,
  validateTitleSearch,
  validateNumericParam,
  validateDateParam,
  validateBookIdParam,
  validateBookBody,
  validateBookQueryParams,
  escapeRegex
};
