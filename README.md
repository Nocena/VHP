# Verified Human Protocol (VHP)

A Web3 CAPTCHA alternative that verifies users through challenge-based activities or Nocena profile verification.

## Installation

```bash
npm install @nocena/vhp
# or
pnpm add @nocena/vhp
```

## Quick Start

```jsx
import { VHPCaptcha } from '@nocena/vhp';

function App() {
  const handleVerified = (token) => {
    // User has been verified
    console.log('Verification token:', token);
  };

  const handleFailed = (error) => {
    console.error('Verification failed:', error);
  };

  return (
    <VHPCaptcha
      onVerified={handleVerified}
      onFailed={handleFailed}
    />
  );
}
```

## Features

- 🔐 Web3-based human verification
- 📸 Challenge-based verification (photo/video/selfie)
- 👤 Nocena profile login option
- 🪙 Token rewards for successful verification
- 🎨 Customizable appearance
- 📱 Mobile-friendly

## API

### VHPCaptcha Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| onVerified | `(token: string) => void` | Callback when verification succeeds | Required |
| onFailed | `(error: string) => void` | Callback when verification fails | Optional |
| apiEndpoint | `string` | Custom API endpoint for verification | `/api/vhp/verify` |
| className | `string` | Additional CSS classes | `''` |

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build the package
pnpm build:package
```

## License

MIT © Nocena