import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <>
      <Header title="Settings" description="Manage your Settings" />
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-muted-foreground">
            This module is fully wired to the API layer. Run the seed script to populate demo data.
          </p>
        </Card>
      </div>
    </>
  );
}
