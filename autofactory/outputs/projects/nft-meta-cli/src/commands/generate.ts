import fs from 'fs-extra';
import path from 'path';
import { parseCSV } from '../utils/csvParser';
import chalk from 'chalk';

interface GenerateOptions {
  input: string;
  output: string;
  baseUri: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const { input, output, baseUri } = options;

  // Check input file exists
  if (!(await fs.pathExists(input))) {
    throw new Error(`Input file not found: ${input}`);
  }

  // Create output directory
  await fs.ensureDir(output);

  // Parse CSV
  console.log(chalk.gray(`📖 Reading CSV: ${input}`));
  const records = await parseCSV(input);
  console.log(chalk.gray(`   Found ${records.length} records`));

  // Generate metadata for each record
  let generated = 0;
  for (const record of records) {
    const metadata = buildMetadata(record, baseUri);
    const tokenId = record.token_id || String(generated + 1);
    const outputPath = path.join(output, `${tokenId}.json`);
    
    await fs.writeJson(outputPath, metadata, { spaces: 2 });
    generated++;
  }

  console.log(chalk.green(`✅ Generated ${generated} metadata files in ${output}`));
}

function buildMetadata(record: Record<string, string>, baseUri: string): NFTMetadata {
  const attributes: Array<{ trait_type: string; value: string }> = [];
  
  // Extract attributes (columns that aren't standard fields)
  const standardFields = ['token_id', 'name', 'description', 'image'];
  
  for (const [key, value] of Object.entries(record)) {
    if (!standardFields.includes(key.toLowerCase()) && value) {
      attributes.push({
        trait_type: key,
        value: value
      });
    }
  }

  // Build image URL
  let imageUrl = record.image || '';
  if (baseUri && !imageUrl.startsWith('http')) {
    imageUrl = `${baseUri}/${imageUrl}`.replace(/\/+/g, '/');
  }

  return {
    name: record.name || `NFT #${record.token_id}`,
    description: record.description || '',
    image: imageUrl,
    attributes
  };
}