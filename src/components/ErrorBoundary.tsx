import { Component, type ReactNode } from 'react';
import { colors } from '../design-system/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full"
          style={{ background: colors.bg.primary }}
        >
          <svg
            width={40}
            height={40}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text.tertiary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.text.emphasis,
              marginTop: 16,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginTop: 6,
            }}
          >
            An unexpected error occurred in this view.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 20,
              padding: '8px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border.default}`,
              background: colors.bg.secondary,
              color: colors.text.emphasis,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
