// TODO: build the full admin shell (sidebar nav, auth, mobile-first layout) in a later stage.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}
