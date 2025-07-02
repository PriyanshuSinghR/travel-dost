import { Header } from "components";
import type { Route } from "./+types/trips";

const Trips = ({ loaderData }: Route.ComponentProps) => {
  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit AI-generated travel plans"
        ctaText="Create a trip"
        ctaUrl="/trips/create"
      />

      <section>
        <h1 className="p-24-semibold text-dark-100 mb-4">
          Manage Created Trips
        </h1>
      </section>
    </main>
  );
};
export default Trips;
