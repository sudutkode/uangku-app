import { DataSource } from 'typeorm';
import axios from 'axios';
import { TransactionType } from '../entities/transaction-type.entity';
import { Icon } from '../entities/icon.entity';
import { overrides } from '../../common/constants';

async function seedTransactionType(dataSource: DataSource) {
  const transactionTypeRepo = dataSource.getRepository(TransactionType);
  const defaultTypes = ['Income', 'Expense', 'Transfer'];

  for (const name of defaultTypes) {
    const exists = await transactionTypeRepo.findOne({ where: { name } });
    if (!exists) {
      await transactionTypeRepo.save(transactionTypeRepo.create({ name }));
    }
  }
}

async function seedIcons(dataSource: DataSource) {
  const iconRepo = dataSource.getRepository(Icon);

  const count = await iconRepo.count();
  if (count > 5000) {
    console.log('⏭️  Icons already seeded, skipping...');
    return;
  }

  console.log('📥 Downloading MCI Metadata (7000+ icons)...');

  try {
    const { data: mciData } = await axios.get(
      'https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/meta.json',
    );

    const iconsToSave = mciData.map((item: any) => {
      const cleanName = item.name.replace(/-outline/g, '');

      const label =
        overrides[item.name] ||
        cleanName
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

      return iconRepo.create({
        name: item.name,
        label: label,
        tags: item.aliases || [],
      });
    });

    await iconRepo.save(iconsToSave, { chunk: 500 });
    console.log(`✅ Seeded ${iconsToSave.length} Icons`);
  } catch (err) {
    console.error('❌ Icon Seeding Failed:', err.message);
  }
}

export async function seedInitialData(dataSource: DataSource) {
  await seedTransactionType(dataSource);
  await seedIcons(dataSource);
}
