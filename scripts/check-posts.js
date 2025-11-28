// Simple script to check posts in database
const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function checkPosts() {
  try {
    console.log('📊 Checking posts in database...\n');

    // Get all posts with author info
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            username: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`Found ${posts.length} posts:\n`);

    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   Author: ${post.author.name} (@${post.author.username})`);
      console.log(`   Published: ${post.published ? 'Yes' : 'No (Draft)'}`);
      console.log(`   Created: ${post.createdAt.toLocaleDateString()}`);
      console.log(`   Slug: ${post.slug}`);
      console.log('');
    });

    // Check users
    const users = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    console.log('👥 Users and their post counts:');
    users.forEach(user => {
      console.log(`   ${user.name} (@${user.username}): ${user._count.posts} posts`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts();