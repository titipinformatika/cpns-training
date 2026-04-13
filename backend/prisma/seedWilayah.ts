import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWilayah() {
  console.log('🚀 Starting Wilayah Seeding...');

  try {
    // 1. Fetch Provinces
    console.log('fetching provinces...');
    const provincesRes = await fetch('https://wilayah.id/api/provinces.json');
    const { data: provinces }: any = await provincesRes.json();

    for (const prov of provinces) {
        console.log(`Processing Province: ${prov.name} (${prov.code})`);
        
        await prisma.provinsi.upsert({
            where: { kode: prov.code },
            update: { nama: prov.name },
            create: { kode: prov.code, nama: prov.name },
        });

        // 2. Fetch Regencies for each province
        const regenciesRes = await fetch(`https://wilayah.id/api/regencies/${prov.code}.json`);
        const { data: regencies }: any = await regenciesRes.json();

        for (const reg of regencies) {
            await prisma.kota.upsert({
                where: { kode: reg.code },
                update: { nama: reg.name, provinsi_kode: prov.code },
                create: { 
                    kode: reg.code, 
                    nama: reg.name, 
                    provinsi_kode: prov.code 
                },
            });
        }
        
        // Anti rate-limit delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ Wilayah Seeding Completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedWilayah();
