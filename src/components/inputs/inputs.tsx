'use client';
import React from "react";
import { useState, SetStateAction, Dispatch, useEffect } from "react";
import { State, City, ICity } from "country-state-city";
import { Upload } from "lucide-react";
import { toast } from "sonner"
import { Input } from "@/components/ui/input"


// Props são como parâmetros, atributos. Como uma classe
interface TextProps{
    text: string;
    attribute: string;
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<string>>;
}

export const NormalInput: React.FC<TextProps> = (props) => {
    return(
        <div className="
            grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr]
            md:gap-x-4
            py-3
            items-center">

            <h1 className="
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="
                w-full
                h-[6dvh]
                bg-white dark:bg-blue-fcsn3
                rounded-[7px]
                border-1 border-blue-fcsn
                transition-all duration-300
                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                px-3"/>
        </div>
    );
}

export const GrowInput: React.FC<TextProps> = (props) => {
    return(
        <div className="
            grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr]
            md:gap-x-4
            py-3
            items-center
            grow">

            <h1 className="
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="
                w-full
                h-[6dvh]
                bg-white dark:bg-blue-fcsn3
                rounded-[7px]
                border-1 border-blue-fcsn
                transition-all duration-300
                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                px-3"/>
        </div>
    );
}

export const ShortInput: React.FC<TextProps> = (props) => {
    return(
        <div className="
            grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr]
            md:gap-x-4
            py-3
            items-center">

            <h1 className="
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="
                w-[12dvh]
                h-[6dvh]
                bg-white dark:bg-blue-fcsn3
                rounded-[7px]
                border-1 border-blue-fcsn
                transition-all duration-300
                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                px-3"/>
        </div>
    );
}

export const LongInput: React.FC<TextProps> = (props) => {
    return(
        <div className="
            flex flex-col justify-between
            h-[23dvh]
            py-3">
                        
            <h1 className="
                w-full
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <textarea
                spellCheck="false"
                onChange={(event) => {props.setAttribute(event.target.value)}}
                className="
                    w-full
                    h-full
                    bg-white dark:bg-blue-fcsn3
                    rounded-[7px]
                    border-1 border-blue-fcsn
                    transition-all duration-300
                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                    px-3
                    resize-none"
                ></textarea>     
        </div>
    );
}

interface HorizontalProps{
    text: string;
    list: string[];
    attribute: number;
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<number>>;
}

export const HorizontalSelects: React.FC<HorizontalProps> = (props) => {
    const { setAttribute } = props; // Destructure specific props
    const [clicked, setClicked] = useState<number>(-1);

    useEffect(() => {
        setAttribute(clicked); // Use destructured prop
    }, [clicked, setAttribute]); // Include only necessary dependencies
    
    return(

        <div className="
            flex flex-col justify-center
            h-min
            py-6">
                        
            <h1 className="
            w-full
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold">
                {props.text} {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h1>
            
            <div className="
                grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
                justify-items-start
                w-full
                gap-y-2 lg:gap-x-4
                text-wrap">

                {props.list.map((string, index) => (
                    
                    <div
                        key={index} 
                        className="
                            flex flex-row justify-center items-center
                            w-fit">

                        <div className="
                            flex flex-col justify-center items-center
                            w-[30px]
                            h-[30px]">

                            <button
                                onClick={(event) => {
                                    event.preventDefault();
                                    setClicked(index);
                            }}
                            className="
                                w-[20px]
                                h-[20px]
                                bg-white 
                                cursor-pointer
                                rounded-full
                                border-1">

                            {clicked == index && (
                                <div className="
                                    flex flex-col justify-center items-center 
                                    w-full 
                                    h-full
                                    rounded-full 
                                    border-1">
                                    <div className="
                                        w-[10px]
                                        h-[10px]
                                        bg-blue-fcsn 
                                        rounded-full"
                                    ></div>
                                </div>
                                // Bolinha que aparece quando clica no input
                            )} 
                            </button>
                        </div>

                        <h1 className="
                            w-fit
                            text-md
                            text-blue-fcsn dark:text-white-off"
                        >{ string }</h1>
                    </div>
                ))}
            </div>        
        </div>
    );
}

export const LeiSelect: React.FC<HorizontalProps> = (props) => {
    return(
        <div className="
            grid grid-rows-2 md:grid-rows-none md:grid-cols-[auto_1fr]
            md:gap-x-4
            w-full
            py-3
            justify-center
            items-center">
                        
            <h1 className="
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <select 
                defaultValue={""}
                onChange={(event) => {
                    props.setAttribute( Number(event.target.value) );
                    }}
                className="
                    w-full md:max-w-[270px]
                    h-[5vh] min-h-[45px] max-h-[70px]
                    bg-white dark:bg-blue-fcsn3
                    border-1 border-blue-fcsn
                    text-blue-fcsn3
                    cursor-pointer 
                    rounded-[7px]
                    transition-all duration-300 
                    focus:ring focus:border-1 focus:border-blue-fcsn focus:shadow-2xl 
                    px-5">

                <option 
                    disabled 
                    value={""}
                >Escolha uma opção</option>
                
                {props.list.map((string, index) => (
                    // Para cada item da lista tem um item no select
                    <option 
                        key={index}
                        value={index}
                    >{string}</option>
                ))}
            </select>
        </div>
    );
}

interface NumberProps{
    text: string;
    index: number;
    attribute: number[];
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<number[]>>;
}

export const NumberInput: React.FC<NumberProps> = (props) => {
    return(
        <div className="
            flex flex-row justify-start items-center
            py-3">
                        
            <h1 className="
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <div className="
                w-[120px]
                flex flex-col justify-center items-center">

                <input
                    type="number"
                    onChange={(event) => {
                        let new_array;
                        new_array = props.attribute;
                        new_array[props.index] = Number(event.target.value);
                        props.setAttribute(new_array);
                    }}
                    className="
                        w-[75px] 
                        h-[50px] 
                        bg-white dark:bg-blue-fcsn3
                        rounded-[7px] 
                        border-1 border-blue-fcsn 
                        transition-all duration-300 
                        focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn 
                        px-3 
                        no-spinner 
                        text-center"/>
            </div>
        </div>
    );
}

interface LocationProps{
    text: string;
    estados: string[];
    cidades: string[];
    isNotMandatory: boolean;
    setEstados: Dispatch<SetStateAction<string[]>>;
    setCidades: Dispatch<SetStateAction<string[]>>;
}

export const EstadoInput: React.FC<LocationProps> = (props) => {
    
    return(
        <div className="
            flex flex-row justify-between items-start 
            h-[200px] 
            py-3">
            
            <h1 className="
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <div className="
                flex flex-col justify-center
                w-3/5 
                h-full 
                border-1 border-blue-fcsn 
                rounded-[7px]">

                <select 
                    defaultValue={""}
                    onChange={(event) => {
                        if(!props.estados.includes(event.target.value)){
                            props.setEstados(prevStates => ([...prevStates, event.target.value]));
                        // Verifica se o Estado já não está na lista antes de adicionar
                    }}} 
                    className="
                        h-1/4 
                        bg-white dark:bg-blue-fcsn3
                        text-blue-fcsn
                        cursor-pointer 
                        pl-5 
                        rounded-t-[7px]">
                    
                    <option 
                        disabled 
                        value={""}
                    >Escolha uma ou mais opções</option>
                    
                    {State.getStatesOfCountry("BR").map((state, index) => (
                        <option
                            key={index}
                            value={[state.name, state.isoCode]}
                        >{state.name}</option>
                    ))}
                </select>

                <div className="border-[1px] border-gray-500"></div>
                
                <div className="
                    h-full 
                    bg-white dark:bg-blue-fcsn3 
                    text-blue-fcsn3
                    rounded-[7px] 
                    overflow-y-auto overflow-hidden scrollbar-thin">
                    
                    {props.estados.map((estado, index) => (
                        <button
                            key={index}
                            onClick={(event) => {
                                event.preventDefault();
                                props.setEstados(prev => prev.filter(item => item !== estado));
                                props.setCidades(prev => {
                                    const estadoUF = estado.slice(estado.length-2);
                                    const cidadesDoEstado = new Set(City.getCitiesOfState("BR", estadoUF).map(cidade => cidade.name));
                                    return prev.filter(item => !cidadesDoEstado.has(item));
                                });
                            }}
                        className="
                            cursor-pointer
                            px-2"
                        >{estado.slice(0, -3)}</button>
                    ))}
                </div>
            </div>
        
        </div>
    );
}

export const CidadeInput: React.FC<LocationProps> = (props) => {
        
    function getCidades(estados: string[]){
        let todasCidades: string[] = [];
        let cidades: ICity[];
        for(const estado of estados){
            cidades = City.getCitiesOfState("BR", estado.slice(estado.length-2));
            todasCidades.push(...cidades.map(cidade => cidade.name))
        }
        return todasCidades;
    }
    // Função que pega todas as cidades dos estados selecionados
    
    return(
        <div className="
            flex flex-row justify-between items-start 
            h-[200px] 
            py-3">
            
            <h1 className="
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <div className="
                w-3/5
                h-full 
                flex flex-col justify-center 
                border-1 border-blue-fcsn 
                rounded-[7px]">

                <select 
                    defaultValue={""} 
                    onChange={(event) => {
                    if(!props.cidades.includes(event.target.value)){
                        props.setCidades(prevCities => ([...prevCities, event.target.value]));
                    }}} 
                    className="
                        h-1/4 
                        bg-white dark:bg-blue-fcsn3
                        text-blue-fcsn
                        cursor-pointer
                        pl-5 
                        rounded-[7px]">
                    
                    <option 
                        disabled 
                        value=""
                    >Escolha uma ou mais opções</option>
                    
                    {props.estados.map((estado, index) => (
                        <option 
                            key={index} 
                            value={""} 
                            onClick={() => {
                                const cidades = City.getCitiesOfState("BR", estado.slice(estado.length-2));
                                props.setCidades(prevCities => {
                                    const cidadesAdicionar = cidades.filter(cidade => !props.cidades.includes(cidade.name)).map(cidade => cidade.name)
                                    return [...prevCities, ...cidadesAdicionar];
                            });
                        }}>Adicionar todas as cidades de {estado.slice(0, -3)}</option>
                    ))}

                    {getCidades(props.estados).map((city, index) => (
                        <option 
                            key={index} 
                            value={ city }
                        >{ city }</option>
                    ))}
                </select>

                <div className="
                    border-[1px] border-gray-500"></div>
                
                <div className="
                    h-full 
                    bg-white dark:bg-blue-fcsn3
                    text-blue-fcsn3
                    rounded-[7px] 
                    overflow-y-auto overflow-hidden scrollbar-thin">
                   
                    {props.cidades.map((cidade, index) => (
                        <button 
                            key={index} 
                            onClick={(event) => {
                                event.preventDefault();
                                props.setCidades(prev => prev.filter(item => item !== cidade))
                        }} className="
                            cursor-pointer 
                            px-2"
                        >{cidade}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface DateProps{
    text: string;
    isNotMandatory: boolean;
    firstAttribute: string;
    setFirstAttribute: Dispatch<SetStateAction<string>>;
    secondAttribute: string;
    setSecondAttribute: Dispatch<SetStateAction<string>>;
}

export const DateInputs: React.FC<DateProps> = (props) => {
    return(
        <div className="
            flex flex-row flex-wrap justify-start items-center
            w-full
            py-3
            gap-5">

            <h1 className=" 
                text-xl md:text-xl lg:lg
                text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <div className="
                flex flex-row justify-start items-center       
                w-1/2">

                <input 
                    type="date" 
                    onChange={(event) => { props.setFirstAttribute(event.target.value)}} 
                    className="
                        h-[40px]
                        w-[140px] 
                        bg-white dark:bg-blue-fcsn3
                        cursor-text 
                        text-blue-fcsn3
                        border-1 border-blue-fcsn 
                        rounded-[7px] 
                        transition-all duration-300 
                        focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn 
                        text-center"/>

                <h1 className="
                text-xl
                text-blue-fcsn
                px-2"
                >a</h1>
                <input

                    type="date" 
                    onChange={(event) => { props.setSecondAttribute(event.target.value)}} 
                    className="
                        h-[40px]
                        w-[140px] 
                        bg-white dark:bg-blue-fcsn3
                        cursor-text 
                        text-blue-fcsn3
                        border-1 border-blue-fcsn 
                        rounded-[7px]
                        transition-all duration-300 
                        focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn 
                        text-center"/>

            </div>
        </div>
    );
}

interface YesNoProps{
    text: string;
    list: string[];
    attribute: boolean;
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<boolean>>; 
}

export const YesNoInput: React.FC<YesNoProps> = (props) => {
    return(

        <div className="
            flex flex-row justify-start items-center
            w-full
            py-3">
                
            <h1 className="
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <div className="
            flex flex-col justify-center items-start
            mr-4">
            <select
                defaultValue={""}
                className="
                w-full max-w-[250px] min-w-[185px]
                h-[8dvh] max-h-[45px]
                ml-4
                bg-white dark:bg-blue-fcsn3
                border-blue-fcsn border-1
                text-blue-fcsn
                cursor-pointer 
                rounded-[5px] 
                transition-all duration-300 
                focus:ring focus:border-1 focus:border-blue-fcsn focus:shadow-2xl 
                px-5">

                <option 
                disabled 
                value={""}
                >Escolha uma opção</option>

                {props.list.map((string, index) => (
                <option 
                    key={index} 
                    value={index}
                >{string}</option>
                ))}
            </select>    
            </div>
        </div>
    );
}

interface VerticalProps{
    text: string;
    subtext: string;
    list: string[];
    attribute: boolean[];
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<boolean[]>>;
}

export const VerticalSelects: React.FC<VerticalProps> = (props) => {
    // Acompanha a ordem de seleção
    const [selectionOrder, setSelectionOrder] = useState<number[]>([]);

    const handleCheckboxChange = (index: number) => {
        const new_array = [...props.attribute];
        
        if (new_array[index]) {
            // Se deschecar alguma caixa, remove essa da ordem armazenada e atualiza a array
            new_array[index] = false;
            setSelectionOrder(prev => prev.filter(i => i !== index));
            props.setAttribute(new_array);
        } else {
            // Se checar alguma caixa
            if (selectionOrder.length < 3) {
                // Se tem menos de 3 caixas checadas, apenas adiciona
                new_array[index] = true;
                setSelectionOrder(prev => [...prev, index]);
                props.setAttribute(new_array);
            } else {
                // Se já tem 3 caixas checadas, desseleciona a primeira checada e checa a que foi clicada
                const firstChecked = selectionOrder[0];
                new_array[firstChecked] = false;
                new_array[index] = true;
                setSelectionOrder(prev => [...prev.slice(1), index]); // Atualiza a ordem
                props.setAttribute(new_array);
            }
        }
    };

    return(
        <div className="
            flex flex-col justify-between items-start
            py-3
            gap-y-2">
            <h1 className="
            w-full
            text-xl md:text-xl lg:lg
            text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

                <p className="
                text-lg
                text-blue-fcsn dark:text-white-off"
                >{ props.subtext }</p>
            
            <div className="flex flex-col gap-y-2">
            {props.list.map((string, index) => (
                <div 
                key={index} 
                className="flex flex-row gap-x-2 md:gap-x-0 gap-y-2">
                <div className="
                    flex flex-col justify-center items-center
                    w-[3vw]
                    gap-y-2">
                    
                    <input 
                    type="checkbox" 
                    checked={props.attribute[index]} 
                    onChange={() => handleCheckboxChange(index)}
                    className="
                        w-[20px] 
                        h-[20px]
                        focus:ring focus:ring-blue-fcsn accent-blue-fcsn 
                        cursor-pointer"/>
                </div>
                <h1 className="
                    text-xl text-blue-fcsn dark:text-white-off"
                >{"ODS " + (index + 1) + ": " + string}</h1>
                </div>
            ))}
            </div>
        </div>
    );
}

interface FileProps{
    text: string;
    files: File[];
    isNotMandatory: boolean;
    setFiles: Dispatch<SetStateAction<File[]>>;
}

export const FileInput: React.FC<FileProps> = (props) => {
    const [fileSize, setFileSize] = useState<number>(0)
    const [isDragging, setIsDragging] = useState(false);
    
    useEffect(() => {
        setFileSize(props.files.length);
    }, [props.files]);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if(files?.length > 0) {
            props.setFiles(prev => [...prev, ...files]);
        }
    };
    
    return(
        <div className="
            flex flex-col justify-around items-center
            h-[30dvh]
            py-3">

            <div className="
                w-full
                md:text-nowrap
                flex flex-row justify-start items-center">
                
                <h1 className="
                    text-xl md:text-xl lg:lg
                    text-blue-fcsn dark:text-white-off font-bold"
                >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    w-full
                    flex flex-col items-center justify-center
                    min-h-[100px]
                    bg-white dark:bg-blue-fcsn3
                    border-1 border-blue-fcsn
                    rounded-[7px]
                    cursor-pointer
                    transition-all
                    ${isDragging ? 'border-dashed' : 'hover:bg-gray-100 dark:hover:bg-blue-fcsn'}
                    p-4
                `}>
                <input 
                    type="file" 
                    className="hidden" 
                    multiple
                    onChange={(event) => {
                        const files = event.target.files;
                        if(files){
                            props.setFiles(prev => [...prev, ...Array.from(files)]);
                        }
                    }}
                />
                
                {fileSize === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-blue-fcsn">
                        <Upload className="w-8 h-8 text-blue-fcsn dark:text-white-off" />
                        <p className="text-center text-blue-fcsn3 dark:text-white-off">
                            {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos aqui'}
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-2">
                        {props.files.map((file, index) => (
                            <div 
                                key={index}
                                className="
                                    flex flex-row justify-between items-center
                                    w-full
                                    py-2
                                    px-4
                                    hover:bg-gray-100 dark:hover:bg-blue-fcsn3
                                    rounded-md
                                    group">
                                <span className="text-blue-fcsn3 dark:text-white-off">{file.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        props.setFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="
                                        text-red-500
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity
                                        cursor-pointer
                                        hover:text-red-700">
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                </label>
            </div>
        </div>
    );
}

export const FileInputBlank: React.FC<FileProps> = (props) => {
    const [fileSize, setFileSize] = useState<number>(0)
    
    useEffect(() => {
        let len: number = 0;
        for(const file in props.files){
            len += 1;
        }
        setFileSize(len);
    }, [props.files]);
    // Lista de arquivo não tem len... tive que fazer eu mesmo
    
    return(
        

            <div className="
                w-full
                md:text-nowrap
                flex flex-row justify-start items-center">
                
                <h1 className="
                    text-xl md:text-xl lg:lg
                    text-blue-fcsn dark:text-white-off font-bold"
                >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

                <label className="
                    w-[35dvw] max-w-[250px] min-w-[100px] md:min-w-[160px]
                    min-h-[30px] max-h-[60px] sm:w-[40dvw] md:w-[25dvw] lg:w-[20dvw]
                    bg-white dark:bg-blue-fcsn3 
                    justify-center text-center text-lg font-sembold text-blue-fcsn dark:text-white-off
                    border-1 border-blue-fcsn 
                    cursor-pointer 
                    rounded-[7px] 
                    mx-5"
                    >

                        <div className="flex flex-row items-center gap-3 w-full justify-center">
                            <Upload className="text-blue-fcsn dark:text-white-off"></Upload>
                            <p>Adicionar Arquivo</p>
                        </div>

                    <input 
                        type="file" 
                        className="hidden" 
                        onChange={(event) => {
                            const files = event.target.files
                            if(files){
                                props.setFiles(prev => [...prev, ...Array.from(files)]);
                            }
                        }}/>
                </label>
            </div>
       
    );
}
// 712 linhas po, vai ver é bom colocar em arquivos diferentes