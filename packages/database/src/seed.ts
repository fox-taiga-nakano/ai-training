import { db } from './index';

async function main() {
  // Create departments
  const engineering = await db.department.create({
    data: {
      name: 'エンジニアリング',
      description: 'ソフトウェア開発チーム',
    },
  });

  const sales = await db.department.create({
    data: {
      name: '営業',
      description: '営業チーム',
    },
  });

  const hr = await db.department.create({
    data: {
      name: '人事',
      description: '人事チーム',
    },
  });

  // Create employees
  await db.employee.createMany({
    data: [
      {
        name: '田中太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        position: 'シニアエンジニア',
        salary: 8000000,
        departmentId: engineering.id,
        status: 'ACTIVE',
      },
      {
        name: '佐藤花子',
        email: 'sato@example.com',
        phone: '090-2345-6789',
        position: '営業マネージャー',
        salary: 7000000,
        departmentId: sales.id,
        status: 'ACTIVE',
      },
      {
        name: '鈴木一郎',
        email: 'suzuki@example.com',
        phone: '090-3456-7890',
        position: 'フロントエンドエンジニア',
        salary: 6000000,
        departmentId: engineering.id,
        status: 'ACTIVE',
      },
      {
        name: '高橋美咲',
        email: 'takahashi@example.com',
        phone: '090-4567-8901',
        position: '人事スペシャリスト',
        salary: 5500000,
        departmentId: hr.id,
        status: 'ACTIVE',
      },
    ],
  });

  console.log('データベースにシードデータを追加しました。');
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
