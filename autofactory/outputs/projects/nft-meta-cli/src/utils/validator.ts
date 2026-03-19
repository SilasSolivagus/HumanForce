export function validateMetadata(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Data must be an object'] };
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  const required = ['name', 'description', 'image', 'attributes'];
  for (const field of required) {
    if (!(field in obj)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate attributes
  if (obj.attributes !== undefined) {
    if (!Array.isArray(obj.attributes)) {
      errors.push('attributes must be an array');
    } else {
      obj.attributes.forEach((attr: unknown, index: number) => {
        if (typeof attr !== 'object' || attr === null) {
          errors.push(`Attribute ${index} must be an object`);
          return;
        }
        const attrObj = attr as Record<string, unknown>;
        if (typeof attrObj.trait_type !== 'string') {
          errors.push(`Attribute ${index} missing or invalid trait_type`);
        }
        if (attrObj.value === undefined) {
          errors.push(`Attribute ${index} missing value`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}