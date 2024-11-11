# ![ChatMarks Logo](https://github.com/user-attachments/assets/5b7e648b-3134-40b1-bffc-a99be477bfc8)
# ChatMarks - Bookmark Important AI Conversations

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nhijgdophdlajaepkhffdccjkmccenon?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/chatmarks/nhijgdophdlajaepkhffdccjkmccenon?authuser=1&hl=en-GB)

**[ChatMarks](https://chromewebstore.google.com/detail/chatmarks/nhijgdophdlajaepkhffdccjkmccenon?authuser=1&hl=en-GB)** is a Chrome extension that allows you to bookmark and organize important conversations with AI models like GPT, Gemini, Claude, and Mistral—all in one place. This open-source project aims to make it easy to save, tag, and retrieve key insights from your conversations, enhancing productivity and knowledge retention.

## Features
- **Bookmark AI Conversations**: Save important conversation URLs with popular AI models in one click
- **Tagging**: Organize bookmarks with custom tags for easy retrieval
- **Description Field**: Add a brief description to each bookmark to remember key details
- **Search and Summaries (Upcoming)**: Enhanced search functionality and AI-generated summaries are planned for future updates

## Installation

Get ChatMarks from the [Chrome Web Store](https://chromewebstore.google.com/detail/chatmarks/nhijgdophdlajaepkhffdccjkmccenon?authuser=1&hl=en-GB)

## Contributing

We welcome and encourage contributions from the community! Here's how you can contribute:

1. **Fork the Repository**
   - Click the 'Fork' button at the top right of this repository
   - Clone your fork locally

2. **Star the Repository**
   - If you find this project useful, please star it to show your support

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Development Setup**
   ```bash
   # Install dependencies
   pnpm install
   # or
   npm install

   # Start development server
   pnpm dev
   # or
   npm run dev
   ```

5. **Build and Test**
   ```bash
   # Build for production
   pnpm build
   # or
   npm run build
   ```

6. **Submit a Pull Request**
   - Your PR must include:
     - Clear description of the new feature/fix
     - Screenshots/GIFs demonstrating the changes
     - Built extension zip file
     - All development and build steps you followed
   - Format your PR title as: `[Feature/Fix]: Brief description`

### Development Notes
- The project uses [Plasmo](https://docs.plasmo.com/) framework
- Load the development build from `build/chrome-mv3-dev` during development
- Main files:
  - `popup.tsx`: Extension popup interface
  - `options.tsx`: Options page (optional)
  - `content.ts`: Content scripts

## Building for Production

```bash
pnpm build
# or
npm run build
```

## Deployment

For automated submissions to the Chrome Web Store, we use the [bpp](https://bpp.browser.market) GitHub Action. Check the [setup instructions](https://docs.plasmo.com/framework/workflows/submit) for automated updates.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Get ChatMarks on the [Chrome Web Store](https://chromewebstore.google.com/detail/chatmarks/nhijgdophdlajaepkhffdccjkmccenon?authuser=1&hl=en-GB)!**

---

## Support the Project

If you find ChatMarks useful, please:
- ⭐ Star this repository
- 🐛 Report any bugs you find
- 💡 Suggest new features
- 🤝 Consider contributing
