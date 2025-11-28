const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function testFollowFunctionality() {
  try {
    console.log('🔍 Testing Follow Functionality...\n');

    // Check if users exist
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      },
      take: 5
    });

    console.log('📊 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
      console.log(`    Followers: ${user._count.followers}, Following: ${user._count.following}, Posts: ${user._count.posts}`);
    });

    // Check follow relationships
    const follows = await prisma.follow.findMany({
      include: {
        follower: { select: { username: true } },
        following: { select: { username: true } }
      },
      take: 10
    });

    console.log('\n👥 Follow relationships:');
    if (follows.length === 0) {
      console.log('  No follow relationships found');
    } else {
      follows.forEach(follow => {
        console.log(`  ${follow.follower.username} follows ${follow.following.username}`);
      });
    }

    // Test follow constraint
    console.log('\n🔧 Testing follow constraint...');
    const uniqueConstraint = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'follows' AND constraint_type = 'UNIQUE'
    `;
    console.log('Unique constraints on follows table:', uniqueConstraint);

  } catch (error) {
    console.error('❌ Error testing follow functionality:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFollowFunctionality();