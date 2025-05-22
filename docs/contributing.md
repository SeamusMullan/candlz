# Contributing to CherryBomb

Thank you for considering contributing to CherryBomb! We welcome contributions from the community to help make this tool even better. Whether you're interested in fixing bugs, adding new features, improving documentation, or helping with testing, your efforts are appreciated.

## How to Contribute

There are many ways to contribute:

- **Reporting Bugs**: If you find a bug, please open an issue on our GitHub repository. Include detailed steps to reproduce the bug, expected behavior, and actual behavior. Include screenshots or logs if possible.
- **Suggesting Enhancements**: If you have an idea for a new feature or an improvement to an existing one, please open an issue to discuss it. Provide a clear description of the enhancement and its potential benefits.
- **Code Contributions**: If you'd like to contribute code, please follow the development setup and pull request process outlined below.
- **Documentation**: Help us improve our documentation by correcting errors, adding missing information, or making it clearer.
- **Testing**: Help test new features or verify bug fixes.

## Development Setup

To get started with developing CherryBomb:

1. **Fork the Repository**: Click the "Fork" button on the [CherryBomb GitHub page](https://github.com/seamusmullan/CherryBomb) to create your own copy.

2. **Clone Your Fork**: Clone your forked repository to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/CherryBomb.git
   cd CherryBomb
   ```

3. **Install Dependencies**: CherryBomb is an Electron application. You'll need Node.js and npm (or Yarn) installed.

   ```bash
   # Navigate to the application directory if it's nested, e.g., cherrybomb/app
   npm install
   # or
   yarn install
   ```

4. **Run in Development Mode**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   This should start the Electron application in development mode with hot reloading for the frontend.

5. **Build for Production**:

   ```bash
   npm run build
   # or
   yarn build
   ```

## Pull Request Process

1. **Create a Branch**: Create a new branch for your feature or bug fix from the `main` or `develop` branch (please check which is the current primary development branch).

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Your Changes**: Implement your feature or bug fix. Ensure your code follows the project's coding style and conventions.

3. **Test Your Changes**: Add unit tests for new functionality and ensure all tests pass.

   ```bash
   npm test
   # or
   yarn test
   ```

4. **Lint Your Code**: Ensure your code adheres to the project's linting rules.

   ```bash
   npm run lint
   # or
   yarn lint
   ```

5. **Commit Your Changes**: Write clear and concise commit messages. Reference any related issues.

   ```bash
   git add .
   git commit -m "feat: Implement X feature (closes #123)"
   # or
   git commit -m "fix: Resolve Y bug (fixes #456)"
   ```

6. **Push to Your Fork**: Push your changes to your forked repository.

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request (PR)**: Go to the original CherryBomb repository on GitHub and open a pull request from your branch to the main development branch.
   - Provide a clear title and description for your PR.
   - Link any related issues.
   - Explain the changes you've made and why.

8. **Code Review**: Your PR will be reviewed by maintainers. Address any feedback or requested changes.

9. **Merge**: Once approved, your PR will be merged.

## Coding Conventions

- Follow existing code style (e.g., TypeScript, React best practices).
- Use linters and formatters (e.g., ESLint, Prettier) as configured in the project.
- Write clear, readable, and maintainable code.
- Comment complex logic where necessary.

## Documentation Contributions

For documentation changes, you can directly edit Markdown files in the `docs` directory and submit a PR. Ensure your changes are clear, accurate, and well-formatted.

## Issue Tracking

- Use GitHub Issues to report bugs and suggest features.
- Check existing issues before creating a new one to avoid duplicates.
- Be clear and provide as much detail as possible.

## Community and Support

If you have questions or need help, you can:

- Open an issue on GitHub for discussion.
- (If available) Join our community chat/forum.

We appreciate your help in making CherryBomb a valuable tool for the community!
