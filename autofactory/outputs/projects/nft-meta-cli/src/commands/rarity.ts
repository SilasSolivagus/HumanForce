import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { calculateRarity } from '../utils/rarityCalculator';

interface RarityOptions {
  input: string;
  output: string;
}

interface RarityReport {
  totalNfts: number;
  traitCounts: Record<string, Record<string, number>>;
  rankings: Array<{
    tokenId: string;
    rarityScore: number;
    rank: number;
  }>;
}

export async function rarityCommand(options: RarityOptions): Promise<void> {
  const { input, output } = options;

  // Check input directory exists
  if (!(await fs.pathExists(input))) {
    throw new Error(`Input directory not found: ${input}`);
  }

  // Read all metadata files
  const files = await fs.readdir(input);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    throw new Error('No JSON files found in input directory');
  }

  console.log(chalk.gray(`📖 Analyzing ${jsonFiles.length} metadata files...`));

  // Load all metadata
  const allMetadata = [];
  for (const file of jsonFiles) {
    const filePath = path.join(input, file);
    const metadata = await fs.readJson(filePath);
    const tokenId = path.basename(file, '.json');
    allMetadata.push({ tokenId, ...metadata });
  }

  // Calculate rarity
  console.log(chalk.gray('📊 Calculating rarity scores...'));
  const report = calculateRarity(allMetadata);

  // Write report
  await fs.writeJson(output, report, { spaces: 2 });
  
  console.log(chalk.green(`✅ Rarity report saved to: ${output}`));
  console.log(chalk.gray(`   Total NFTs: ${report.totalNfts}`));
  console.log(chalk.gray(`   Traits analyzed: ${Object.keys(report.traitCounts).length}`));
}