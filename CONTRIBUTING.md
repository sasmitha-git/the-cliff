# Contributing to The Cliff

Thank you for your interest in contributing! Here's how you can help.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/the-cliff.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** and commit: `git commit -m "Add your feature"`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Submit a Pull Request**

## Development Setup

```bash
# Frontend setup
npm install
npm run dev

# Backend setup (in another terminal)
cd server
npm install
npm run dev
```

## Code Style

- **TypeScript**: Strict mode enabled, all files must pass `npm run build`
- **Formatting**: Use the project's existing style
- **Components**: Keep them small and focused
- **Types**: Define proper TypeScript interfaces

## Testing

```bash
# Verify TypeScript compilation
npm run build

# Server development
cd server
npm run dev
```

## Commit Messages

Write clear commit messages:
- ✅ `Add session recovery feature`
- ✅ `Fix LIVE badge showing on offline streams`
- ❌ `fixed bug`
- ❌ `update`

## What to Contribute

### Good First Issues
- Documentation improvements
- Bug fixes
- Code cleanup
- Test coverage

### Feature Ideas
- Email verification
- Stream recording
- Stream replay
- User following system
- Advanced analytics
- Mobile app

## Questions?

Open an issue or discussion in the repository.

