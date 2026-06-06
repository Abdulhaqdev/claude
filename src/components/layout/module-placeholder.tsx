import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function ModulePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <Header title={title} description={description} />
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-muted-foreground">
            {title} module is connected to the backend API. Use the seed script to populate demo data.
          </p>
        </Card>
      </div>
    </>
  );
}
