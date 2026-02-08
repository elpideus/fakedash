/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Boolean indicating valid email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate required field
 * @param value - Field value
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateRequired = (value: string, fieldName: string): { isValid: boolean; message: string } => {
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            message: `${fieldName} è obbligatorio`
        };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate minimum length
 * @param value - Field value
 * @param minLength - Minimum required length
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateMinLength = (
    value: string,
    minLength: number,
    fieldName: string
): { isValid: boolean; message: string } => {
    if (value.length < minLength) {
        return {
            isValid: false,
            message: `${fieldName} deve contenere almeno ${minLength} caratteri`
        };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate maximum length
 * @param value - Field value
 * @param maxLength - Maximum allowed length
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldName: string
): { isValid: boolean; message: string } => {
    if (value.length > maxLength) {
        return {
            isValid: false,
            message: `${fieldName} non può superare ${maxLength} caratteri`
        };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate post data
 * @param post - Post object to validate
 * @returns Array of validation errors
 */
export const validatePost = (post: { title: string; content: string }): string[] => {
    const errors: string[] = [];

    const titleRequired = validateRequired(post.title, 'Titolo');
    if (!titleRequired.isValid) errors.push(titleRequired.message);

    const contentRequired = validateRequired(post.content, 'Contenuto');
    if (!contentRequired.isValid) errors.push(contentRequired.message);

    const titleLength = validateMaxLength(post.title, 200, 'Titolo');
    if (!titleLength.isValid) errors.push(titleLength.message);

    return errors;
};

/**
 * Validate user data
 * @param user - User object to validate
 * @returns Array of validation errors
 */
export const validateUser = (user: { name: string; email: string }): string[] => {
    const errors: string[] = [];

    const nameRequired = validateRequired(user.name, 'Nome');
    if (!nameRequired.isValid) errors.push(nameRequired.message);

    const emailRequired = validateRequired(user.email, 'Email');
    if (!emailRequired.isValid) errors.push(emailRequired.message);

    if (user.email && !isValidEmail(user.email)) {
        errors.push('Email non valida');
    }

    const nameLength = validateMaxLength(user.name, 100, 'Nome');
    if (!nameLength.isValid) errors.push(nameLength.message);

    return errors;
};

/**
 * Validate ID format
 * @param id - ID to validate
 * @returns Boolean indicating valid ID
 */
export const isValidId = (id: string | number): boolean => {
    if (typeof id === 'number') {
        return id > 0;
    }
    return id.trim() !== '' && /^[a-zA-Z0-9-]+$/.test(id);
};

/**
 * Validate pagination parameters
 * @param pageIndex - Page index (0-based)
 * @param pageSize - Items per page
 * @returns Boolean indicating valid pagination
 */
export const validatePagination = (pageIndex: number, pageSize: number): boolean => {
    return pageIndex >= 0 && pageSize > 0 && pageSize <= 100;
};