'use client';
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { useState } from "react";
import {
    NormalInput, 
    LongInput,
    NumberInput,
    HorizontalSelects,
    VerticalSelects,
    DateInputs,
    EstadoInput,
    LeiSelect,
    YesNoInput,
    FileInput,
    CidadeInput
    } from "@/components/inputs/inputs";
import { Toaster } from "sonner";;


export default function forms_acompanhamento(){



    return(
        <main className="
            flex flex-col justify-between items-center
            w-screen
            h-[600vh]
            overflow-scroll">
            
            <Header></Header>
            
            <div className="
            flex flex-col justify-start items-start
            w-[50%]
            bg-[#F2F1EA]
            h-[80%]
            gap-2">
            
                <div className=" bg-amber-600 w-[80%] h-[1%] ml-10 mt-10 flex flex-row">
                        <div className="bg-fuchsia-600 w-[50%] h-full"></div>
                        <div className="bg-emerald-600 w-[50%] h-full"></div>
                </div>

                <div className=" bg-amber-600 w-[80%] h-[1%] ml-10 mt-1 flex flex-row">
                        <div className="bg-fuchsia-600 w-[25%] h-full">
                            <div className="bg-amber-400 w-full h-full "></div>
                        </div>
                        <div className="bg-emerald-600 w-[75%] h-full"></div>
                </div>

            </div>

            <Footer></Footer>
        </main>
    );
}