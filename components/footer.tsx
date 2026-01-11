export function Footer() {
  return (
    <footer className="flex items-center justify-center p-3 pb-6 w-full max-w-3xl mx-auto">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} NYCU Winlab.
      </p>
    </footer>
  );
}
