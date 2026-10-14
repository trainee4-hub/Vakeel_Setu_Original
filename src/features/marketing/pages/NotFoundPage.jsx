import { useNavigate } from "react-router-dom";
import { Button, LinkButton } from "@shared/components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main
      className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-slate-50"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <div className="mx-auto max-w-lg text-center">
        <p className="text-7xl font-extrabold tracking-tight text-amber-500 sm:text-8xl">
          404
        </p>
        <h1
          id="not-found-heading"
          className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or you don't have access to it.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton to="/" variant="primary" icon="home">
            Go to homepage
          </LinkButton>
          <Button
            variant="secondary"
            icon="arrow_back"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>
      </div>
    </main>
  );
}

export { NotFoundPage };
