import { generateStaticParams } from "./generateMetadata";

// Export generateStaticParams for static site generation
export { generateStaticParams };

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
