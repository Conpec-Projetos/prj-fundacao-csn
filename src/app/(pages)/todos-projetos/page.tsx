import Footer from "@/components/footer/footer";
import TodosProjetosClient from "@/components/todosProjetos/TodosProjetosClient";
import { getProjects } from "@/app/actions/todosProjetosActions";
import { getLeisFromDB } from "@/lib/utils";

export default async function TodosProjetosPage() {
  const projects = await getProjects();
  const leis = await getLeisFromDB();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col px-4 sm:px-8 md:px-20 lg:px-32 py-4 gap-y-10 ">
        <TodosProjetosClient allProjects={projects} incentiveLaws={leis} />
      </main>
      <Footer />
    </div>
  );
}