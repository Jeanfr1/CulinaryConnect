export async function generateStaticParams() {
  // For static export, we'll generate a few placeholder IDs
  // In a real app, you would fetch these from your database
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    // Add more IDs as needed
  ];
}
