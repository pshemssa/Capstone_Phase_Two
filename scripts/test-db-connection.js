// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
// });

// async function testConnection() {
//   console.log('🔍 Testing database connection...\n');
  
//   try {
//     // Test connection
//     await prisma.$connect();
//     console.log('✅ Database connected successfully!\n');
    
//     // Test query
//     console.log('🔍 Testing query...');
//     const result = await prisma.$queryRaw`SELECT 1 as test`;
//     console.log('✅ Query successful:', result);
    
//     // Check if tables exist
//     console.log('\n🔍 Checking tables...');
//     const tables = await prisma.$queryRaw`
//       SELECT table_name 
//       FROM information_schema.tables 
//       WHERE table_schema = 'public'
//     `;
//     console.log('✅ Tables found:', tables);
    
//     console.log('\n✅ All tests passed! Database is ready to use.');
    
//   } catch (error) {
//     console.error('\n❌ Database connection failed!\n');
//     console.error('Error:', error.message);
//     console.error('\n📋 Troubleshooting:');
//     console.error('1. Check your DATABASE_URL in .env file');
//     console.error('2. Verify database server is running');
//     console.error('3. Check network/firewall settings');
//     console.error('4. For Supabase: Check if project is paused');
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testConnection();

