# Ever Ease - Secure End-of-Life Planning

Ever Ease is a comprehensive platform that helps users organize their end-of-life planning documents, designate executors, and ensure their wishes are carried out when the time comes.

![Ever Ease](https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## Features

- **Guided Planning**: AI-powered assistant (Emma) guides users through the planning process
- **Document Management**: Securely store and organize important documents
- **Asset Inventory**: Document financial, physical, and digital assets
- **Executor Management**: Designate trusted individuals to carry out your wishes
- **Wishes & Directives**: Record medical directives, funeral preferences, and personal messages
- **End-to-End Encryption**: All sensitive data is encrypted for maximum security
- **Executor Workflow**: Guided process for executors when the time comes

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: Claude API for Emma assistant
- **Payments**: Stripe integration
- **Email**: Resend for transactional emails

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for emails)
- Stripe account (for payments)
- Claude API key (for AI assistant)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/ever-ease.git
   cd ever-ease
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Fill in your Supabase, Stripe, and Resend API keys

4. Start the development server
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations`
3. Set up storage buckets for document uploads
4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy send-email
   supabase functions deploy test-email
   supabase functions deploy send-executor-invitation
   supabase functions deploy stripe-checkout
   supabase functions deploy stripe-webhook
   ```

## Deployment

The application is configured for deployment on Netlify:

```bash
npm run deploy:staging   # Deploy to staging
npm run deploy:production # Deploy to production
```

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/lib` - Utility functions and API clients
  - `/pages` - Application pages
- `/supabase` - Supabase configuration
  - `/migrations` - Database migrations
  - `/functions` - Edge Functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.