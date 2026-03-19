import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface ValidateOptions {
  input: string;
}

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  const { input } = options;

  // Check if input is file or directory
  const stat = await fs.stat(input);
  const files: string[] = [];

  if (stat.isDirectory()) {
    const allFiles = await fs.readdir(input);
    files.push(...allFiles.filter(f => f.endsWith('.json')).map(f => path.join(input, f)));
  } else {
    files.push(input);
  }

  if (files.length === 0) {
    throw new Error('No JSON files found');
  }

  console.log(chalk.gray(`🔍 Validating ${files.length} file(s)...`));

  const results: ValidationResult[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const file of files) {
    const result = await validateFile(file);
    results.push(result);
    
    if (result.valid) {
      validCount++;
      console.log(chalk.green(`✅ ${path.basename(file)}`));
    } else {
      invalidCount++;
      console.log(chalk.red(`❌ ${path.basename(file)}`));
      result.errors.forEach(err => console.log(chalk.red(`   - ${err}`)));
    }
  }

  console.log(chalk.blue(`\n📊 Summary: ${validCount} valid, ${invalidCount} invalid`));
  
  if (invalidCount > 0) {
    process.exit(1);
  }
}

async function validateFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath,
    valid: true,
    errors: []
  };

  try {
    const content = await fs.readJson(filePath);

    // Check required fields
    const requiredFields = ['name', 'description', 'image', 'attributes'];
    for (const field of requiredFields) {
      if (!(field in content)) {
        result.valid = false;
        result.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate attributes format
    if (content.attributes) {
      if (!Array.isArray(content.attributes)) {
        result.valid = false;
        result.errors.push('attributes must be an array');
      } else {
        for (let i = 0; i < content.attributes.length; i++) {
          const attr = content.attributes[i];
          if (!attr.trait_type || !attr.value) {
            result.valid = false;
            result.errors.push(`Attribute ${i} missing trait_type or value`);
          }
        }
      }
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${error}`);
  }

  return result;
}