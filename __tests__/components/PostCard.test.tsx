import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import PostCard from '@/app/components/post/PostCard'
import { Post } from '@/app/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch globally (for any fetch calls inside PostCard)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

// Mock Post object
const mockPost: Post = {
  id: '1',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'This is a test post excerpt',
  coverImage: null,
  published: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  readTime: 5,
  authorId: '1',
  author: {
    id: '1',
    name: 'Test Author',
    username: 'testauthor',
    image: null,
  },
  tags: ['test', 'example'],
  _count: {
    likes: 10,
    comments: 5,
  },
}

// Helper to render component with a valid session
const renderWithSession = (ui: React.ReactElement) => {
  return render(
    <SessionProvider
      session={{
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: null,
        },
      }}
    >
      {ui}
    </SessionProvider>
  )
}

describe('PostCard', () => {
  it('renders post title', () => {
    renderWithSession(<PostCard post={mockPost} />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('renders post excerpt', () => {
    renderWithSession(<PostCard post={mockPost} />)
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument()
  })

  it('renders author name', () => {
    renderWithSession(<PostCard post={mockPost} />)
    expect(screen.getByText('Test Author')).toBeInTheDocument()
  })

  it('renders tags', () => {
    renderWithSession(<PostCard post={mockPost} />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('example')).toBeInTheDocument()
  })
})
