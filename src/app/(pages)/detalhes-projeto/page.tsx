'use client';
import { useState } from "react";
import { Toaster } from "sonner";
import ods7 from '@/assets/ODS 7.png'
import ods13 from '@/assets/ODS 13.png'
import link from '@/assets/Link-svg.svg'
import presentation from '@/assets/Presentation-svg.svg'
import positivo from '@/assets/positivo-svg.svg'
import negativo from '@/assets/negativo-svg.svg'
import atencao from '@/assets/atencao-svg.svg'

export default function ProjectDetailsPage() {
    const [notes, setNotes] = useState<string>("");

    return (
        <main className="flex flex-col items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-4xl p-6 space-y-6">
                {/* Project Header */}
                <div className="flex flex-row">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold">Projeto XYZ</h1>
                        <h2 className="text-2xl text-gray-700 font-medium">Instituição ABCDEF</h2>
                        <p className="text-gray-600">Via Lei de Incentivo Fulano de Tal, projeto n. 1343/2024</p>
                        <p className="text-gray-600">Público beneficiado: <span className="font-bold">crianças, jovens</span></p>
                    </div>

                    <div className = "h-full w-[80%] flex flex-col gap-3">
                        <div className="flex flex-row gap-5 justify-end">
                            <div className="bg-[var(--nacional)] text-white w-[20%] flex justify-center rounded-2xl border-[var(--nacional)]"> 
                                Nacional
                            </div>
                            <div className="bg-[var(--cultura)] w-[20%] flex justify-center rounded-2xl border-[var(--cultura)] text-white"> 
                                Cultura
                            </div>
                        </div>
                        <div className="flex flex-row justify-end gap-5">
                            <div className="items-center text-sm w-[20%] flex justify-center rounded-2xl border-2 border-[var(--cultura)] text-[var(--cultura)] font-bold">
                                INSTAGRAM</div>
                            <div className="p-1 rounded-2xl border-2 border-[var(--cultura)] text-[var(--cultura)"><img src = {link.src} alt="" /></div>
                            <div className="p-1 rounded-2xl border-2 border-[var(--cultura)] text-[var(--cultura)"><img src = {presentation.src} alt="" /></div>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300 my-4" />

                <div className="flex flex-row gap-3 size-20">
                    <img src = {ods7.src} alt="" />
                    <img src = {ods13.src} alt="" />
                </div>

                <div className="flex flex-row justify-between gap-5">
                    {/* Financial Information */}
                    <div className="flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                        <div>
                            <p className="text-gray-500">valor captado</p>
                            <p className="text-3xl font-bold">R$100.230.430,00</p>
                        </div>
                        <div>
                            <p className="text-gray-500">valor apto para captar</p>
                            <p className="text-2xl font-medium">R$500.000.000,00</p>
                        </div>
                        <div>
                            <p className="text-gray-500">período de captação</p>
                            <p className="text-xl font-semibold">01/01/2024 – 01/03/2024</p>
                        </div>
                    </div>

                    {/* Project Description */}
                    <div className="space-y-1 self-center">
                        <p className="text-gray-700">Breve descrição: Rerum fuga repellendus consequatur 
                            Jure iste ut quisquam ut. Vitae quo qui odio aliquid ducimus ipsum recusandae 
                            voluptates. Quo non dolorem velit numquam molilita nemo dolor.</p>
                        <p className="font-semibold">Indicado por: Fulano de Tal</p>
                    </div>
                </div>
                
                <hr className="border-gray-300 my-4" />

                <div className="flex flex-row justify-between">
                    {/* Locations */}
                    <div className="w-1/2 flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                        <h3 className="text-xl font-bold mb-2">LOCAIS DE ATUAÇÃO</h3>
                        <p className="text-gray-700 font-medium">Minas Gerais, São Paulo, 
                            Espírito Santo, Campinas (SP), Belo Horizonte (MG), Vitória (ES), Vila Velha (ES)</p>
                        <p className="text-gray-700 mt-2">Especificações do território de atuação: 
                            Lorem ipsum dolor sit amet.</p>
                    </div>

                    <div>
                        <div className="flex flex-row gap-5">
                            <div className="flex flex-col gap-3 items-end bg-white-off p-5 rounded-2xl"><span className="text-3xl font-bold">1000</span>beneficiários diretos</div>
                            <div className="flex flex-col gap-3 items-end bg-white-off p-5 rounded-2xl"><span className="text-3xl font-bold">5000</span>beneficiários indiretos</div>
                        </div>
                        <div className="mt-5 flex flex-col gap-3 items-end font-medium text-xl bg-white-off p-5 rounded-2xl">Período de execução <span className="text-2xl font-bold">01/01/2022 - 01/02/2025</span></div>
                    </div>
                </div>

                <hr className="border-gray-300 my-4" />

                <div className="flex flex-col gap-5">
                    <div className="flex flex-row gap-5">
                        {/* Counterparts */}
                        <div className="flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                            <h3 className="text-xl font-bold mb-2">CONTRAPARTIDAS</h3>
                            <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. 
                                Velit odit blanditis reiclendis pariatur sit repudiandae animi rerum. 
                                Et adipisci corporis est minus veniam sed.</p>
                        </div>

                        {/* Positive Points */}
                        <div className="flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                            <h3 className="flex flex-row justify-between text-xl font-bold mb-2">PONTOS POSITIVOS <span className="size-6"><img src = {positivo.src} alt="" /></span></h3>
                            <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. 
                                Velit odit blanditis reiclendis pariatur sit repudiandae animi rerum. 
                                Et adipisci corporis est minus veniam sed.</p>
                        </div>
                    </div>

                    <div className="flex flex-row gap-5">
                        {/* Executed Counterparts */}
                        <div className="flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                            <h3 className="text-xl font-bold mb-2">CONTRAPARTIDAS EXECUTADAS</h3>
                            <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. 
                                Velit odit blanditis reiclendis pariatur sit repudiandae animi rerum. 
                                Et adipisci corporis est minus veniam sed.</p>
                        </div>

                        {/* Negative Points */}
                        <div className="flex flex-col gap-3 bg-white-off p-5 rounded-2xl">
                            <h3 className="flex flex-row justify-between text-xl font-bold mb-2">PONTOS NEGATIVOS<span className="size-6"><img src = {negativo.src} alt="" /></span></h3>
                            <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. 
                                Velit odit blanditis reiclendis pariatur sit repudiandae animi rerum. 
                                Et adipisci corporis est minus veniam sed.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-5">
                    {/* Points of Attention */}
                    <div className="w-[50%] flex flex-col gap-3 bg-yellow-50 p-5 rounded-2xl">
                        <h3 className="flex flex-row justify-between text-xl font-bold mb-2">PONTOS DE ATENÇÃO <span className="size-6"><img src = {atencao.src} alt="" /></span></h3>
                        <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. 
                            Velit odit blanditis reiciendis pariatur sit repudiandae animi rerum. 
                            Et adipisci corporis est minus veniam sed.</p>
                    </div>

                    <div>
                    {/* Diversity */}

                    </div>

                    {/* Diversity */}
                    <div>
                        
                    </div>
                </div>

                <hr className="border-gray-300 my-4" />

                {/* Beneficiary Testimonial */}
                <div>
                    <h3 className="text-xl font-bold mb-2">RELATO DE BENEFICIÁRIO</h3>
                    <p className="text-gray-700">Odit minus ipsam eaque enim enim et quas. Velit odit blanditis reiciendis pariatur sit repudiandae animi rerum. Et adipisci corporis est minus veniam sed.</p>
                </div>

                <hr className="border-gray-300 my-4" />

                {/* Institution Information */}
                <div>
                    <h3 className="text-xl font-bold mb-2">SOBRE A INSTITUIÇÃO</h3>
                    <p className="text-gray-700"><span className="font-semibold">CNPJ:</span> 13.083.277/0001-17</p>
                    <p className="text-gray-700"><span className="font-semibold">Representante legal:</span> Mário José de Souza</p>
                    <p className="text-gray-700"><span className="font-semibold">Contato:</span> +55 (11) 1111-1111 | mario@instituicao.org</p>
                    <p className="text-gray-700"><span className="font-semibold">Endereço:</span> Av. Getúlio Vargas, 192, 6o andar – Feira de Santana, BA – 49820-349</p>
                    <p className="text-gray-700"><span className="font-semibold">Dados bancários:</span> Itaú, Agência 0000-0, CC 00000-0</p>
                    <p className="text-gray-700"><span className="font-semibold">Observações:</span> Lorem ipsum dolor sin amet.</p>
                </div>

                <hr className="border-gray-300 my-4" />

                {/* Admin Notes */}
                <div>
                    <h3 className="text-xl font-bold mb-2">ANOTAÇÕES DO ADMINISTRADOR</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li className="text-gray-700">Odit minus ipsam eaque enim enim et quas. Velit odit blanditis reiciendis pariatur sit repudiandae animi rerum. Et adipisci corporis est minus veniam sed.</li>
                        <li className="text-gray-700">Odit minus ipsam eaque enim enim et quas. Velit odit blanditis reiciendis pariatur sit repudiandae animi rerum. Et adipisci corporis est minus veniam sed.</li>
                    </ul>
                    <textarea
                        className="w-full mt-4 p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Adicionar novas anotações..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Adicionar
                    </button>
                    <div className="text-gray-500">
                        <p>Data de submissão: 24 de agosto de 2024</p>
                        <p className="text-right">submissão 3/3</p>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
        </main>
    );
}