'use client';
import React from "react";
import { Dispatch, SetStateAction, useEffect, useState, useMemo, useRef } from 'react';
import { State, City } from "country-state-city";
import { Upload } from "lucide-react";


// Props são como parâmetros, atributos. Como uma classe
interface TextProps{
    text: string;
    attribute: string;
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<string>>;
}

export const NormalInput: React.FC<TextProps> = (props) => {
    return(
        <div className="grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr] md:gap-x-4 py-2 items-center">

            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3"/>
        </div>
    );
}

export const GrowInput: React.FC<TextProps> = (props) => {
    return(
        <div className="grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr] md:gap-x-4 py-2 items-center grow">

            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn  focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3"/>
        </div>
    );
}

export const ShortInput: React.FC<TextProps> = (props) => {
    return(
        <div className="grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr] md:gap-x-4 py-2 items-center">

            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <input
            type="text"
            onChange={(event) => {props.setAttribute(event.target.value)}}
            className="w-[6vw] h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn  focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3"/>
        </div>
    );
}

export const LongInput: React.FC<TextProps> = (props) => {
    return(
        <div className="flex flex-col justify-between h-[23dvh] mt-2">
                        
            <h1 className="w-full text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold pb-1"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <textarea
                spellCheck="false"
                onChange={(event) => {props.setAttribute(event.target.value)}}
                className="w-full h-full bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3 resize-none"
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

export const HorizontalSelects: React.FC<HorizontalProps> = (props) => { // Não é mais horizontal, talvez seja legal mudar o nome
    const { setAttribute } = props;
    const [clicked, setClicked] = useState<number>(-1);

    useEffect(() => {
        setAttribute(clicked);
    }, [clicked, setAttribute]); 
    
    return(
        <div className="flex flex-col justify-center h-min my-4">
            <h1 className="w-full text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold pb-2">
                {props.text} {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h1>
            <div className="flex flex-col justify-items-start w-full gap-y-2 text-wrap">
                {props.list.map((string, index) => (
                    <div
                        key={index} 
                        className="flex flex-row justify-center items-center w-fit">
                        <div className="flex flex-col justify-center items-center w-[30px] h-[30px]">
                            <button
                                onClick={(event) => {
                                    event.preventDefault();
                                    setClicked(index);
                                }}
                                className="w-[20px] h-[20px] bg-white cursor-pointer rounded-full border-1">
                            {clicked == index && (
                                <div className="flex flex-col justify-center items-center w-full h-full rounded-full border-1">
                                    <div className="w-[10px] h-[10px] bg-blue-fcsn rounded-full"></div>
                                </div>
                            )} 
                            </button>
                        </div>
                        <h1 className="w-fit text-lg text-blue-fcsn dark:text-white-off">{ string }</h1>
                    </div>
                ))}
            </div>        
        </div>
    );
}

export const LeiSelect: React.FC<HorizontalProps> = (props) => {
    return(
        <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-[auto_1fr] md:gap-x-4 w-full py-3 justify-center items-center">
                        
            <h1 className="
                text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <select 
                defaultValue={""}
                onChange={(event) => {props.setAttribute( Number(event.target.value) )}}
                className="w-full md:max-w-[270px] h-[5vh] min-h-[45px] max-h-[70px] text-blue-fcsn3 dark:text-white-off bg-white dark:bg-blue-fcsn3 border-blue-fcsn border-1 cursor-pointer rounded-[7px] focus:ring focus:border-1 focus:border-blue-fcsn focus:shadow-2xl px-5">
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
        <div className="flex flex-row justify-start items-center py-3">
                        
            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <div className="w-auto flex flex-col justify-center items-center px-3">

                <input
                    type="number"
                    onChange={(event) => {
                        const new_array = [...props.attribute];
                        new_array[props.index] = Number(event.target.value);
                        props.setAttribute(new_array);
                    }}
                    className="w-[6vw] min-w-[70px] max-w-[120px] h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-2 no-spinner text-center"/>
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
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Memoize a lista de todos os estados para evitar recálculos
    const allBrazilianStates = useMemo(() => State.getStatesOfCountry("BR"), []);

    // Memoize a lista de estados filtrados
    const filteredStates = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return allBrazilianStates.filter(state =>
            state.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !props.estados.includes(state.name)
        );
    }, [searchTerm, allBrazilianStates, props.estados]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setShowSuggestions(true);
    };

    const handleSelectState = (stateName: string) => {
        const stateValue = stateName;
        if (!props.estados.includes(stateValue)) {
            props.setEstados(prevStates => [...prevStates, stateValue]);
        }
        setSearchTerm("");
        setShowSuggestions(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    return(
        <div className="flex flex-row justify-between items-start h-auto py-3" ref={wrapperRef}> {/* Adicione a ref aqui */}
            
            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            {/* Container principal para input, sugestões e lista de selecionados */}
            <div className="flex flex-col justify-start w-3/5 max-h-[15vh] border border-blue-fcsn rounded-[7px] bg-white dark:bg-blue-fcsn3 relative">
                {/* Input de busca */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Digite para buscar um estado..."
                    className="w-full min-h-[50px] text-blue-fcsn dark:text-white-off bg-transparent pl-5 rounded-t-[7px] focus:outline-none box-border"
                />

                {/* Lista de sugestões (posicionada absolutamente) */}
                {showSuggestions && filteredStates.length > 0 && (
                    <ul className="absolute top-[50px] left-[-1px] right-[-1px] z-15 bg-white dark:bg-blue-fcsn3 border-l border-r border-b border-blue-fcsn rounded-b-[7px] max-h-[50vh] overflow-y-auto shadow-lg">
                        {filteredStates.map((state) => (
                            <li
                                key={state.isoCode}
                                onMouseDown={() => handleSelectState(state.name)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                            >
                                {state.name}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Divisor */}
                <div className="border-t border-blue-fcsn3 dark:border-blue-fcsn"></div>
                
                {/* Área de estados selecionados */}
                <div className="h-[calc(100%-51px)] text-blue-fcsn3 rounded-b-[7px] overflow-y-auto scrollbar-thin p-2">
                    {props.estados.map((estado) => (
                        <button
                            key={estado}
                            onClick={(event) => {
                                event.preventDefault();
                                props.setEstados(prev => prev.filter(item => item !== estado));
                                
                                const stateObject = allBrazilianStates.find(s => s.name === estado);
                                if (stateObject) {
                                    const estadoUF = stateObject.isoCode;
                                    const cidadesDoEstado = new Set(City.getCitiesOfState("BR", estadoUF).map(cidade => cidade.name));
                                    props.setCidades(prevCidades => prevCidades.filter(item => !cidadesDoEstado.has(item)));
                                }
                            }}
                            className="text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1 inline-flex"
                        >
                            {estado}
                        </button>
                    ))}
                    {props.estados.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Selecione pelo menos um estado.</p>
                    )}
                </div>
            </div>
        
        </div>
    );
}

export const CidadeInput: React.FC<LocationProps> = (props) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Helper para obter todos os estados brasileiros. Pode ser otimizado se já disponível do componente pai.
    const getAllBrazilianStates = () => State.getStatesOfCountry("BR");

    // Memoize todos os nomes de cidades disponíveis dos estados selecionados
    const allCityNamesFromSelectedStates = useMemo(() => {
        const cityNames: string[] = [];
        if (props.estados && props.estados.length > 0) {
            const brazilianStates = getAllBrazilianStates();
            props.estados.forEach(estadoNome => { // estadoNome é o nome do estado
                if (!estadoNome) return;
                const stateObject = brazilianStates.find(s => s.name === estadoNome);
                if (stateObject) {
                    const stateIsoCode = stateObject.isoCode;
                    const citiesFromState = City.getCitiesOfState("BR", stateIsoCode);
                    cityNames.push(...citiesFromState.map(city => city.name));
                }
            });
        }
        return [...new Set(cityNames)]; // Remove duplicatas, caso haja
    }, [props.estados]);

    // Memoize a lista de cidades filtradas para as sugestões do autocomplete
    const filteredCitySuggestions = useMemo(() => {
        if (!searchTerm.trim() || props.estados.length === 0) {
            return []; // Não mostrar sugestões se o input estiver vazio ou nenhum estado selecionado
        }
        return allCityNamesFromSelectedStates.filter(cityName =>
            cityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !props.cidades.includes(cityName) // Não sugerir cidades já selecionadas
        );
    }, [searchTerm, allCityNamesFromSelectedStates, props.cidades, props.estados.length]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        if (props.estados.length > 0 && allCityNamesFromSelectedStates.length > 0) {
            setShowSuggestions(true); // Mostra sugestões ao digitar, apenas se houver estados e cidades disponíveis
        }
    };

    const handleSelectCity = (cityName: string) => {
        if (!props.cidades.includes(cityName)) {
            props.setCidades(prevCities => [...prevCities, cityName]);
        }
        setSearchTerm(""); // Limpa o input após seleção
        setShowSuggestions(false);
    };

    const handleAddAllCitiesFromState = (stateName: string) => { // stateName é o nome do estado
        if (!stateName) return;
        const brazilianStates = getAllBrazilianStates();
        const stateObject = brazilianStates.find(s => s.name === stateName);

        if (stateObject) {
            const stateIsoCode = stateObject.isoCode;
            const citiesOfThisState = City.getCitiesOfState("BR", stateIsoCode);
            const cityNamesToAdd = citiesOfThisState
                .map(city => city.name)
                .filter(name => !props.cidades.includes(name)); // Adiciona apenas cidades ainda não selecionadas
            
            if (cityNamesToAdd.length > 0) {
                props.setCidades(prevCities => [...new Set([...prevCities, ...cityNamesToAdd])]); // Garante unicidade ao adicionar
            }
        }
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleRemoveAllCities = () => {
        props.setCidades([]);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    return(
        <div className="flex flex-row justify-between items-start h-auto py-3" ref={wrapperRef}> {/* Adicione a ref aqui */}
            
            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>
            
            <div className="flex flex-col justify-start w-3/5 max-h-[45vh] border border-blue-fcsn rounded-[7px] bg-white dark:bg-blue-fcsn3 relative">
                {/* Input de busca de cidade */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => { 
                        if (props.estados.length > 0 && allCityNamesFromSelectedStates.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={props.estados.length === 0 ? "Selecione um estado primeiro" : "Buscar cidade..."}
                    className="w-full min-h-[50px] text-blue-fcsn dark:text-white-off bg-transparent pl-5 rounded-t-[7px] focus:outline-none box-border"
                    disabled={props.estados.length === 0}
                />

                {showSuggestions && filteredCitySuggestions.length > 0 && (
                    <ul className="absolute top-[50px] left-[-1px] right-[-1px] z-15 bg-white dark:bg-blue-fcsn3 border-l border-r border-b border-blue-fcsn rounded-b-[7px] max-h-[50vh] overflow-y-auto shadow-lg">
                        {filteredCitySuggestions.map((cityName, index) => (
                            <li
                                key={`city-sugg-${index}-${cityName}`}
                                // Use onMouseDown para garantir que o evento de clique seja processado antes do onBlur
                                onMouseDown={() => handleSelectCity(cityName)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                            >
                                {cityName}
                            </li>
                        ))}
                    </ul>
                )}
                
                <div className="border-t border-blue-fcsn3 dark:border-blue-fcsn"></div>
                
                <div className="h-[calc(100%-51px)] overflow-y-auto scrollbar-thin">
                    {props.estados.length > 0 && (
                        <div className="sticky top-0 z-10 bg-white dark:bg-blue-fcsn3 flex flex-wrap max-h-[10vh] p-2 border-b border-blue-fcsn3 dark:border-blue-fcsn overflow-y-scroll">
                            <div className="w-full flex justify-start gap-x-1 mb-0.5">
                                <span className="text-xs h-[24px] text-gray-500 dark:text-gray-400 py-0.5">Opções rápidas:</span>
                                {props.cidades.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAllCities}
                                        className="text-xs text-red-600 dark:text-red-50 bg-red-100 dark:bg-red-fcsn hover:bg-red-200 dark:hover:bg-red-400 cursor-pointer px-2 py-1 rounded">
                                        Remover todas
                                    </button>
                                )}
                            </div>
                            
                            <div className="w-full flex flex-wrap">
                                {props.estados.map((estadoNome) => (
                                    <button
                                        key={`add-all-${estadoNome}`}
                                        type="button"
                                        onMouseDown={() => handleAddAllCitiesFromState(estadoNome)} // Use onMouseDown
                                        className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1">
                                        Adicionar todas de {estadoNome}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-2">
                        {props.cidades.length > 0 ? props.cidades.map((cidade, index) => (
                            <button
                                key={`${cidade}-${index}-selected`}
                                type="button" 
                                onClick={(event) => {
                                    event.preventDefault();
                                    props.setCidades(prev => prev.filter(item => item !== cidade));
                                }}
                                className="text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1 inline-flex"
                            >
                                {cidade}
                            </button>
                        )) : (
                            props.estados.length > 0 && <p className="text-xs text-gray-400 dark:text-gray-500 px-2">Nenhuma cidade selecionada.</p>
                        )}
                         {props.estados.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Selecione estados para ver opções de cidades.</p>
                        )}
                    </div>
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
        <div className="flex flex-row flex-wrap justify-start items-center w-full py-3 gap-5">

            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <div className="flex flex-row justify-start items-center w-1/2">

                <input 
                    type="date" 
                    onChange={(event) => { props.setFirstAttribute(event.target.value)}} 
                    className="w-[150px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center text-blue-fcsn rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn"/>

                <p className="text-xl text-blue-fcsn dark:text-white-off px-2"
                >a</p>
                <input

                    type="date" 
                    onChange={(event) => { props.setSecondAttribute(event.target.value)}} 
                    className="w-[150px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center text-blue-fcsn rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn "/>

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
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIndex = event.target.value;
        if (selectedIndex === "0") { // "Sim"
            props.setAttribute(true);
        } else if (selectedIndex === "1") { // "Não"
            props.setAttribute(false);
        }
    };

    const selectValue = props.attribute === true ? "0" : props.attribute === false ? "1" : "";


    return(

        <div className="flex flex-row justify-start items-center w-full py-3">
                
            <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

            <div className="flex flex-col justify-center items-start mr-4">
            <select
                value={selectValue}
                onChange={handleChange}
                className="w-full max-w-[250px] min-w-[185px] h-[8dvh] max-h-[45px] ml-4 text-blue-fcsn dark:text-white-off bg-white dark:bg-blue-fcsn3 border-blue-fcsn border-1 cursor-pointer rounded-[5px] focus:ring focus:border-1 focus:border-blue-fcsn focus:shadow-2xl px-5">
                <option 
                    disabled 
                    value={""}
                >Escolha uma opção</option>

                {props.list.map((string, index) => (
                <option 
                    key={index} 
                    value={index.toString()}
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
    // Garante que o array de atributos tenha o mesmo tamanho da lista e só valores booleanos
    useEffect(() => {
        if (props.attribute.length !== props.list.length) {
            const newArray = props.list.map((_, i) => !!props.attribute[i]);
            props.setAttribute(newArray);
        }
    }, [props.list.length, props.attribute, props.setAttribute]);

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
        <div className="flex flex-col justify-between items-start py-3 gap-y-2">
            <h1 className="w-full xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
            >{ props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}</h1>

                <p className="text-lg text-blue-fcsn dark:text-white-off"
                >{ props.subtext }</p>
            
            <div className="flex flex-col gap-y-2">
            {props.list.map((string, index) => (
                <div 
                key={index} 
                className="flex flex-row gap-x-2 md:gap-x-0 gap-y-2">
                <div className="flex flex-col justify-center items-center w-[3vw] gap-y-2">
                    
                    <input 
                    type="checkbox" 
                    checked={props.attribute[index]} 
                    onChange={() => handleCheckboxChange(index)}
                    className="w-[20px] h-[20px] accent-blue-fcsn dark:accent-gray-100 cursor-pointer"/>
                </div>
                <h1 className="text-lg text-blue-fcsn dark:text-white-off"
                >{"ODS " + (index + 1) + ": " + string}</h1>
                </div>
            ))}
            </div>
        </div>
    );
}

interface PublicoBeneficiadoInputProps extends Omit<VerticalProps, 'subtext'> {
    outroAttribute: string;
    setOutroAttribute: Dispatch<SetStateAction<string>>;
}

export const PublicoBeneficiadoInput: React.FC<PublicoBeneficiadoInputProps> = (props) => {
    const { list, attribute, setAttribute, outroAttribute, setOutroAttribute, isNotMandatory } = props;

    useEffect(() => {
        // Garante que o array de atributos tenha o mesmo tamanho da lista
        if (attribute.length !== list.length || attribute.some(val => typeof val !== 'boolean')) {
            const newArray = list.map((_, i) => !!attribute[i]);
            setAttribute(newArray);
        }
    }, [list, attribute, setAttribute]);

    const handleCheckboxChange = (index: number) => {
        const new_array = [...attribute];
        new_array[index] = !new_array[index];
        setAttribute(new_array);

        // Se a checkbox "Outro" for desmarcada, limpa o valor do input de texto
        if (list[index].toLowerCase().startsWith('outro') && !new_array[index]) {
            setOutroAttribute("");
        }
    };

    const isOutroOption = (label: string) => label.toLowerCase().startsWith('outro');

    return (
        <div className="flex flex-col justify-between items-start py-3 gap-y-2">
            <h1 className="w-full text-xl text-blue-fcsn dark:text-white-off font-bold">
                {props.text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h1>
            
            <div className="flex flex-col gap-y-2">
                {list.map((string, index) => (
                    <div 
                        key={index} 
                        className="flex flex-row items-center gap-x-2 md:gap-x-0 gap-y-2">
                        
                        <div className="flex flex-col justify-center items-center w-[3vw] gap-y-2">
                            <input 
                                type="checkbox" 
                                checked={attribute[index]} 
                                onChange={() => handleCheckboxChange(index)}
                                className="w-[20px] h-[20px] accent-blue-fcsn dark:accent-gray-100 cursor-pointer"
                            />
                        </div>
                        
                        <h1 className="text-lg text-blue-fcsn dark:text-white-off mr-2">
                            {string}
                        </h1>

                        {/* Renderiza o campo de input se for a opção "Outro" */}
                        {isOutroOption(string) && (
                            <input
                                type="text"
                                value={outroAttribute}
                                onChange={(e) => setOutroAttribute(e.target.value)}
                                disabled={!attribute[index]} // Desabilita se "Outro" não estiver marcado
                                className="h-[40px] flex-grow bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3 disabled:bg-gray-100 dark:disabled:bg-blue-fcsn disabled:cursor-not-allowed"
                                placeholder="Especifique..."
                            />
                        )}
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
        <div className={`flex ${fileSize === 0 ? 'flex-row items-center gap-4' : 'flex-col gap-2'} py-3`}>

            <div className={`${fileSize === 0 ? 'flex-shrink-0' : 'w-full'} md:text-nowrap flex flex-row justify-start items-center`}>
                <h1 className="text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold">
                    { props.text } {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
                </h1>
            </div>

            <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    ${fileSize === 0 ? 'h-[80px] max-w-[290px] flex-grow' : 'w-full min-h-[100px] max-h-[300px] overflow-y-auto'} 
                    flex flex-col items-center justify-center
                    bg-white dark:bg-blue-fcsn3 border-1 border-blue-fcsn rounded-[7px] 
                    cursor-pointer p-4
                    ${isDragging ? 'border-dashed bg-blue-50' : 'hover:bg-gray-50 dark:hover:bg-blue-fcsn'}
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
                    <div className="flex flex-row items-center gap-2 text-blue-fcsn dark:text-white-off">
                        <Upload className="w-7 h-7" />
                        <p className="text-md text-blue-fcsn3 dark:text-white-off">
                            {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos aqui'}
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-2">
                        {props.files.map((file, index) => (
                            <div 
                                key={index}
                                className="flex flex-row justify-between items-center w-full hover:bg-gray-100 dark:hover:bg-blue-fcsn2 rounded-md group py-2 px-4">
                                <span className="text-blue-fcsn3 dark:text-white-off">{file.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        props.setFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-600 dark:text-red-50 bg-red-100 dark:bg-red-fcsn hover:bg-red-200 dark:hover:bg-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-[2px]">
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </label>
        </div>
    );
}

interface SingleEstadoProps {
    text: string;
    attribute: string; // Armazenará a sigla do estado selecionado (ex: "SP")
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<string>>;
}

export const SingleEstadoInput: React.FC<SingleEstadoProps> = (props) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // Busca todos os estados brasileiros da biblioteca
    const allBrazilianStates = useMemo(() => State.getStatesOfCountry("BR"), []);

    // Encontra o nome completo do estado selecionado para exibição no input
    const selectedStateName = useMemo(() => {
        if (!props.attribute) return "";
        const state = allBrazilianStates.find(s => s.isoCode === props.attribute);
        return state ? state.name : "";
    }, [props.attribute, allBrazilianStates]);

    // Filtra os estados com base na busca do usuário (por nome ou sigla)
    const filteredStates = useMemo(() => {
        if (!searchTerm.trim()) {
            return allBrazilianStates;
        }
        return allBrazilianStates.filter(state =>
            state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            state.isoCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allBrazilianStates]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        // Se o usuário apagar o campo, o estado selecionado também é limpo
        if (newSearchTerm === "") {
            props.setAttribute("");
        }
        setShowSuggestions(true);
    };

    const handleSelectState = (state: { name: string; isoCode: string }) => {
        props.setAttribute(state.isoCode); // Armazena a sigla (isoCode)
        setSearchTerm(state.isoCode);
        setShowSuggestions(false);
    };

    return (
        <div className="grid grid-rows-2 lg:grid-rows-none lg:grid-cols-[auto_1fr] md:gap-x-4 py-2 items-center">
            <h1 className="text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold">
                {props.text} {props.isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h1>

            <div className="relative">
                <input
                    type="text"
                    value={searchTerm || selectedStateName}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay para permitir o clique na sugestão
                    className="w-full max-w-[80px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3"
                />

                {showSuggestions && filteredStates.length > 0 && (
                    <ul className="absolute min-w-[130px] top-full -inset-x-1/2 z-10 bg-white dark:bg-blue-fcsn3 border-1 border-blue-fcsn rounded-[7px] max-h-[25vh] overflow-y-auto shadow-lg">
                        {filteredStates.map((state) => (
                            <li
                                key={state.isoCode}
                                onClick={() => handleSelectState(state)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                            >
                                {state.name} ({state.isoCode})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}