'use client';

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { FaCheckCircle, FaSearch, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";

// Interface (base) para cada projeto
interface ProjectProps {
    id: number;
    name: string;
    status: 'aprovado' | 'pendente' | 'reprovado';
    value: string;
    incentiveLaw: string;
    description: string;
    ODS: { id: number; src: string }[];
}

// Componente Project
const Project: React.FC<ProjectProps> = ({ id, name, status, value, incentiveLaw, description, ODS}) => (
  <div className="bg-white-off rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0 md:1/2 sm:1/4 ">
    <section className="flex flex-col col-span-2 mr-4">
        <div className="flex flex-row gap-2 mb-2">
            <h2>{name}</h2>
            <div>
            {status === 'aprovado' && (
                  <FaCheckCircle color="green" />
                )}
                {status === 'pendente' && (
                  <FaClockRotateLeft color="DarkOrange" />
                )}
                {status === 'reprovado' && (
                  <FaTimesCircle color="red" />
                )}
            </div>
        </div>
        <p className="mb-2">{value}</p>
        <div className=" bg-pink-fcsn rounded-2xl px-4 py-2 size-fit text-center mb-2">{incentiveLaw}</div>
        <p className="mr-10 text-justify">{description}</p>
    </section>
    <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1  col-span-1">
    {ODS.map((img) => (
        <img key={img.id} src={img.src} alt={`ODS ${id}`} className="w-20 h-20" />
      ))}
    </section>
  </div>
);

export default function TodosProjetos(){

    // Array de todos os projetos (usado com exemplo)
    // AllProjects é do tipo ProjectProps
    const AllProjects: ProjectProps[] =
    [
        {id: 1, name: "Projeto A", status: 'aprovado', value: "R$: 9.990,99", incentiveLaw: "cultura", description: "popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, comes from a line in section 1.10.32.The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.", ODS: [{id: 1, src: "/ods/ods1.png"}, {id: 2, src: "/ods/ods2.png"}, {id: 3, src: "/ods/ods3.png"}, {id: 4, src: "/ods/ods4.png"}, {id: 5, src: "/ods/ods5.png"}, {id: 6, src: "/ods/ods6.png"}, {id: 7, src: "/ods/ods7.png"}, {id: 8, src: "/ods/ods8.png"}, {id: 9, src: "/ods/ods9.png"}, {id: 10, src: "/ods/ods10.png"}]},
        {id: 2, name: "Projeto B", status: 'reprovado', value: "R$: 10.990,99", incentiveLaw: "esporte", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, neque accusamus? Fugit ipsum error nihil maiores dolorem numquam assumenda provident eos suscipit quia debitis libero, exercitationem reprehenderit repudiandae voluptas consequuntur." , ODS: [{id: 11, src: "/ods/ods11.png"}, {id: 12, src: "/ods/ods12.png"}, {id: 13, src: "/ods/ods13.png"}]},
        {id: 3, name: "Projeto C", status: 'pendente', value: "R$: 7.500,99", incentiveLaw: "saude", description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).", ODS: [{id: 14, src: "/ods/ods14.png"}, {id: 15, src: "/ods/ods15.png"}, {id: 16, src: "/ods/ods16.png"}, {id: 17, src: "/ods/ods17.png"}]}
    ]
    return(
        <div className="flex flex-col min-h-screen">
            <main className="flex flex-1 flex-col px-4 sm:px-8 md:px-20 lg:px-32 py-4 gap-y-10 ">
                {/* Cabeçalho */}
                <section>
                    <h1 className="text-xl md:text-3xl font-bold text-blue-fcsn mt-3">Projetos</h1>
                    <div  className="flex flex-row gap-x-4 mt-3">
                        <div className="bg-white-off p-2 rounded-lg shadow-md">
                            <FaSearch size={24} />
                        </div>
                    
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            className="bg-white-off px-3 flex-1 rounded-lg shadow-md"
                        />
                        
                    </div>

                </section>

                <section>
                {AllProjects.map((project) => (
                  <Project 
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    status={project.status}
                    value={project.value}
                    incentiveLaw={project.incentiveLaw}
                    description={project.description}
                    ODS={project.ODS}
                  />
                ))}  
              </section>
            </main>
            <Footer />
        </div>
    );
}