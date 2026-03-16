
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl shadow-xl p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-bold">Algo deu errado!</h2>
                        <p className="text-muted-foreground text-sm">
                            Ocorreu um erro inesperado ao tentar carregar a página.
                        </p>

                        {this.state.error && (
                            <div className="text-left bg-muted p-4 rounded-lg overflow-auto max-h-40 text-xs font-mono border border-border">
                                <p className="font-bold text-destructive mb-2">{this.state.error.name}: {this.state.error.message}</p>
                                <p className="text-muted-foreground whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Recarregar Página
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="block w-full text-center text-sm text-primary hover:underline mt-2"
                        >
                            Voltar para Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
