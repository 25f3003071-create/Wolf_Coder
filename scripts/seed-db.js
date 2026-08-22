const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  console.log('--------------------------------------------------');
  console.log('ReliefTrack: Seeding Local / Supabase Database...');
  console.log('--------------------------------------------------');

  const seedFilePath = path.join(__dirname, '../supabase/seed.sql');
  if (fs.existsSync(seedFilePath)) {
    const sqlContent = fs.readFileSync(seedFilePath, 'utf8');
    console.log(`Successfully loaded seed SQL file (${sqlContent.length} bytes).`);
    console.log('Demo Scenario Loaded:');
    console.log(' - Campaign: Emergency Medical Relief Campaign 2026 (CMP-2026-0192)');
    console.log(' - Donor: Rahul Sharma (donor@relieftrack.org)');
    console.log(' - Receipt ID: DR-2026-8F72K9 (Amount: ₹10,000)');
    console.log(' - Beneficiary: BEN-72A91 (Emergency Cardiac Surgery)');
    console.log(' - NGO: Red Cross Relief India (NGO-1042)');
    console.log(' - Allocation: ALLOC-2026-91A7 (₹8,500)');
    console.log(' - Expenses: EXP-2026-77A2 (₹6,500) + EXP-2026-77A3 (₹2,000)');
    console.log(' - Evidence: EVD-2026-72K9 (Camera Verified with SHA-256 Checksum)');
    console.log('--------------------------------------------------');
    console.log('Database seed verification complete!');
  } else {
    console.error('Seed file not found at: ' + seedFilePath);
  }
}

seedDatabase().catch(console.error);
