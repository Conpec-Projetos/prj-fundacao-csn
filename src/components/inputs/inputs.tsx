'use client';
import React from "react";
import { Dispatch, SetStateAction, useEffect, useState, useMemo, useRef } from 'react';
import { State, City } from "country-state-city";
import { Upload } from "lucide-react";
import { AiOutlineClose } from "react-icons/ai";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { RiArrowDropDownLine } from "react-icons/ri";



// Props são como parâmetros, atributos. Como uma classe
interface TextProps{
    text: string;
    attribute: string;
    isNotMandatory: boolean;
    setAttribute: Dispatch<SetStateAction<string>>;
}

interface HookFormInputProps {
    text: string;
    isNotMandatory: boolean;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    type?: string;
    className?: string;
    placeholder?: string;
}

interface HookFormSelectProps {
    text: string;
    list: string[];
    isNotMandatory: boolean;
    registration: UseFormRegisterReturn;
    error?: FieldError;
}

const bordaErro = "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500";
const bordaBase = "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn";

export const NormalInput: React.FC<HookFormInputProps> = ({ text, isNotMandatory, registration, error, type = "text", placeholder }) => {
    return (
        <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
            {/* O <h1> foi trocado por <label> para melhorar a acessibilidade,
              associando o texto ao campo de input.*/}
            <label htmlFor={registration.name} className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            
            {/* Um contêiner para o input e sua mensagem de erro */}
            <div className="w-full">
                <input
                    id={registration.name}
                    type={type}
                    placeholder={placeholder}
                    {...registration} // Espalha as propriedades (name, onChange, onBlur, ref) do react-hook-form
                    // Aplica a classe de erro condicionalmente
                    className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? bordaErro : bordaBase}`}
                />
                
                {/* Exibe a mensagem de erro apenas se ela existir */}
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

export const GrowInput: React.FC<HookFormInputProps> = ({ text, isNotMandatory, registration, error, type = "text" }) => {
    return(
        <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
            <label htmlFor={registration.name} className="flex text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            <div className="w-full">
                <input
                    id={registration.name}
                    type={type}
                    {...registration}
                    className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? bordaErro : bordaBase}`}
                />
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
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
            className="w-[6vw] h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3"/>
        </div>
    );
}

export const LongInput: React.FC<HookFormInputProps> = ({ text, isNotMandatory, registration, error }) => {
    return(
        <div className={`flex flex-col justify-between h-[23dvh] mt-2 ${error ? "mb-4" : ""}`}>
            <label htmlFor={registration.name} className="w-full text-xl text-blue-fcsn dark:text-white-off font-bold pb-1">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            <div className="h-full">
                <textarea
                    id={registration.name}
                    spellCheck="false"
                    {...registration}
                    className={`w-full h-full bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 resize-none ${error ? bordaErro : bordaBase}`}
                ></textarea>     
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

interface ControlledSelectProps<T> {
    text: string;
    list: string[];
    value: T; // Valor atual vindo do react-hook-form
    onChange: (value: T) => void; // Função para atualizar o valor no react-hook-form
    error?: FieldError;
    isNotMandatory: boolean;
}

export const HorizontalSelects: React.FC<ControlledSelectProps<number>> = ({ text, list, value, onChange, error, isNotMandatory }) => {

    return (
        <div className="flex flex-col justify-center h-min my-4">
            <h2 className="w-full text-xl text-blue-fcsn dark:text-white-off font-bold pb-2">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h2>
            
            <div className="flex flex-col justify-items-start w-full gap-y-2 text-wrap" role="radiogroup">
                {list.map((itemLabel, index) => (
                    <div key={index} className="flex flex-row justify-center items-center w-fit">
                        <div className="flex flex-col justify-center items-center w-[30px] h-[30px]">
                            <button
                                type="button" // Garante que o botão não envie o formulário
                                role="radio"
                                aria-checked={value === index}
                                onClick={() => onChange(index)} // Atualiza o estado no react-hook-form
                                // Aplica a classe de erro se houver um erro e nenhum item estiver selecionado
                                className={`flex flex-col justify-center items-center w-[20px] h-[20px] bg-white cursor-pointer rounded-full border-1 ${error && value === undefined ? bordaErro : bordaBase}`}
                            >
                                {/* A bolinha interna aparece se o valor da prop 'value' corresponder ao index do item */}
                                {value === index && (
                                    <div className="w-[10px] h-[10px] bg-blue-fcsn rounded-full" />
                                )}
                            </button>
                        </div>
                        <label onClick={() => onChange(index)} className="w-fit text-lg text-blue-fcsn dark:text-white-off cursor-pointer ml-1">
                            {itemLabel}
                        </label>
                    </div>
                ))}
            </div>
            {/* Exibe a mensagem de erro se a validação falhar */}
            {error && <p className="text-red-500 mt-2 text-sm">{error.message}</p>}
        </div>
    );
}

export const LeiSelect: React.FC<ControlledSelectProps<number>> = ({text,list,value,onChange,error,isNotMandatory,}) => {
  const [isOpen, setIsOpen] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const filtrados = list.filter((string) => string.toLowerCase().includes(search.toLowerCase())); // Se nada for digitado (search === ""), o startsWith("") (ou includes como usamos aqui) é sempre true para qualquer string, então filtrados = list. Isso significa que a lista completa é exibida quando a pesquisa está vazia.

  useEffect(() => {
    if (!isOpen) return;
    function handleCliqueFora(event: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleCliqueFora);
    return () => {
      document.removeEventListener("mousedown", handleCliqueFora);
    };
  }, [isOpen]);

  return (
    <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-[auto_1fr] md:gap-x-4 w-full py-3 items-center">
        <h2 className="text-xl md:text-xl text-blue-fcsn dark:text-white-off font-bold">
        {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
        </h2>

        <div className="relative z-10" ref={caixaRef}>
        {/* Botão que abre/fecha */}
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white dark:bg-blue-fcsn2 border-1 p-2 px-4 rounded-lg shadow-md text-lg cursor-pointer flex items-center justify-between"
        >
            
            <div className="flex flex-row justify-between items-center w-full"> 
            {value !== undefined && value !== null && list[value] !== undefined ? list[value] : "Clique para exibir as leis"}
            <div><RiArrowDropDownLine size={45}/></div>
            </div>

        </div>
           
        {/* Dropdown */}
        {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-blue-fcsn2 rounded shadow-md w-full max-h-[300px] overflow-y-auto">
            <input
            type="text"
            placeholder="Pesquisar lei ..."
            className="w-full text-left p-2 border-b rounded-t bg-white dark:bg-blue-fcsn"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />

            {filtrados.length > 0 ? ( // Se algo foi encontrado (alguma lei começa com a palavra digitada)
                filtrados.map((string, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => {
                            onChange(list.indexOf(string));
                            setIsOpen(false); // Fecha o dropdown
                        }}
                        className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-blue-fcsn ${
                            value === list.indexOf(string) ? "bg-blue-100 dark:bg-blue-fcsn text-blue-fcsn font-bold" : ""
                        }`}
                        >
                        {string}
                    </button>
                ))
            ) : ( 
            <span className="block p-2 text-gray-500">Nada encontrado</span>
            )}
        </div>
        )}
      </div>

      {/* Exibe erro */}
      {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
    </div>
  );
};


export const NumeroEndInput: React.FC<HookFormInputProps> = ({ text, isNotMandatory, registration, error }) => {
    return (
        <div className="flex flex-col lg:flex-row w-auto justify-start items-start">
            <label htmlFor={registration.name} className="text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center font-bold pr-1">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            
            <div className="w-auto flex flex-col justify-center items-start">
                <input
                    id={registration.name}
                    type="number"
                    {...registration}
                    className={`w-[6vw] min-w-[90px] max-w-[120px] h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-2 no-spinner text-center ${error ? bordaErro : bordaBase}`}
                />
                
                {/* Exibição da mensagem de erro logo abaixo do campo */}
                {error && <p className="text-red-500 text-sm text-wrap min-w-[70px] max-w-[300px] mt-1">{error.message}</p>}
            </div>
        </div>
    );
}

export const NumberInput: React.FC<HookFormInputProps> = ({ text, isNotMandatory, registration, error }) => {
    return (
        <div className="flex flex-col md:flex-row w-auto justify-start items-start">
            <label htmlFor={registration.name} className="text-xl text-blue-fcsn dark:text-white-off font-bold mb-1 pr-3">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            
            <div className="w-auto flex flex-col justify-center items-start">
                <input
                    id={registration.name}
                    type="number"
                    {...registration}
                    className={`w-[6vw] min-w-[90px] max-w-[120px] h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-2 no-spinner text-center ${error ? bordaErro : bordaBase}`}
                />
                
                {/* Exibição da mensagem de erro logo abaixo do campo */}
                {error && <p className="text-red-500 text-sm text-wrap min-w-[70px] max-w-[300px] mt-1">{error.message}</p>}
            </div>
        </div>
    );
}

interface EstadoInputProps {
    text: string;
    isNotMandatory: boolean;
    value: string[]; // Recebe o array de estados do react-hook-form
    onChange: (value: string[]) => void; // Função para atualizar o estado no react-hook-form
    onStateRemove: (stateName: string) => void; // Função para lidar com a remoção de cidades associadas
    error?: FieldError; // Prop para receber o erro de validação
}

export const EstadoInput: React.FC<EstadoInputProps> = ({ text, isNotMandatory, value, onChange, onStateRemove, error }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Memoiza a lista de todos os estados para evitar recálculos
    const allBrazilianStates = useMemo(() => State.getStatesOfCountry("BR"), []);

    // Filtra os estados com base no termo de busca e nos estados já selecionados
    const filteredStates = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return allBrazilianStates.filter(state =>
            (state.name.toLowerCase().includes(searchTerm.toLowerCase()) || state.isoCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !value.includes(state.name) // Usa 'value' da prop
        );
    }, [searchTerm, allBrazilianStates, value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setShowSuggestions(true);
    };

    const handleSelectState = (stateName: string) => {
        if (!value.includes(stateName)) {
            onChange([...value, stateName]); // Atualiza o estado usando a função 'onChange'
        }
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleRemoveState = (stateToRemove: string) => {
        // Primeiro, chama a função para remover as cidades associadas no formulário pai
        onStateRemove(stateToRemove);
        // Em seguida, atualiza a lista de estados
        onChange(value.filter(item => item !== stateToRemove));
    };

    // Lógica para fechar as sugestões ao clicar fora
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
        <div className="flex flex-col md:flex-row w-full justify-between items-start h-auto gap-y-1 py-3" ref={wrapperRef}>
            
            <label className="text-xl text-blue-fcsn dark:text-white-off mb-1 font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>

            <div className="flex flex-col w-full md:w-3/5">
                <div className={`flex flex-col justify-start max-h-[15vh] border rounded-[7px] bg-white dark:bg-blue-fcsn3 relative ${error ? bordaErro : bordaBase}`}>
                    {/* Input de busca */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Digite para buscar um estado..."
                        className="w-full min-h-[50px] text-blue-fcsn dark:text-white-off bg-transparent pl-5 rounded-t-[7px] focus:outline-none box-border"
                    />

                    {/* Lista de sugestões */}
                    {showSuggestions && filteredStates.length > 0 && (
                        <ul className="absolute top-[50px] left-[-1px] right-[-1px] z-20 bg-white dark:bg-blue-fcsn3 border-l border-r border-b border-blue-fcsn rounded-b-[7px] max-h-[50vh] overflow-y-auto shadow-lg">
                            {filteredStates.map((state) => (
                                <li
                                    key={state.isoCode}
                                    onMouseDown={() => handleSelectState(state.name)}
                                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                                >
                                    {state.name} ({state.isoCode})
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Divisor */}
                    <div className="border-t border-blue-fcsn3 dark:border-blue-fcsn"></div>
                    
                    {/* Área de estados selecionados */}
                    <div className="h-full text-blue-fcsn3 rounded-b-[7px] overflow-y-auto scrollbar-thin p-2">
                        {value.map((estado) => (
                            <button
                                key={estado}
                                type="button"
                                onClick={() => handleRemoveState(estado)}
                                className="text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1 inline-flex items-center"
                            >
                                {estado}
                                <AiOutlineClose className="text-blue-fcsn hover:text-red-800 dark:text-white-off dark:hover:text-red-400 ml-1"/>
                            </button>
                        ))}
                        {value.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Nenhum estado selecionado.</p>
                        )}
                    </div>
                </div>
                {/* Exibição da mensagem de erro */}
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

interface LocationDashboardProps{
    text: string;
    estado: string;
    setEstado: React.Dispatch<React.SetStateAction<string>>;
    setCidades: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EstadoInputDashboard: React.FC<LocationDashboardProps> = (props) => {
    const estadosFirebase: {[key: string]: string} = {
        'Acre': 'acre',
        'Alagoas': 'alagoas',
        'Amapá': 'amapa',
        'Amazonas': 'amazonas',
        'Bahia': 'bahia',
        'Ceará': 'ceara',
        'Distrito Federal': 'distrito_federal',
        'Espírito Santo': 'espirito_santo',
        'Goiás': 'goias',
        'Maranhão': 'maranhao',
        'MatoGrosso': 'mato_grosso',
        'Mato Grosso do Sul': 'mato_grosso_do_sul',
        'Minas Gerais': 'minas_gerais',
        'Pará': 'para',
        'Paraíba': 'paraiba',
        'Paraná': 'parana',
        'Pernambuco': 'pernambuco',
        'Piauí': 'piaui',
        'Rio de Janeiro': 'rio_de_janeiro',
        'Rio Grande do Norte': 'rio_grande_do_norte',
        'Rio Grande do Sul': 'rio_grande_do_sul',
        'Rondônia': 'rondonia',
        'Roraima': 'roraima',
        'Santa Catarina': 'santa_catarina',
        'São Paulo': 'sao_paulo',
        'Sergipe': 'sergipe',
        'Tocantins': 'tocantins'
        }

    return(
        <div className="flex flex-col justify-center items-center gap-2 py-3 mx-2">
            <div className="flex flex-col justify-center w-full h-fit border-1 border-blue-fcsn rounded-[7px]">
                <select
                    value={props.estado}
                    onChange={(event) => {
                        props.setEstado(event.target.value);
                    }} 
                    className="h-full w-full text-blue-fcsn dark:text-white-off cursor-pointer bg-white dark:bg-blue-fcsn3 pl-5 rounded-[7px]">
                        
                    <option 
                        disabled 
                        value={""}
                    >Escolha uma opção</option>
                        
                    {State.getStatesOfCountry("BR").map((state, index) => (
                        <option
                            key={index}
                            value={estadosFirebase[state.name]}
                        >{state.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

interface CidadeInputProps {
    text: string;
    isNotMandatory: boolean;
    value: string[]; // Cidades selecionadas
    onChange: (value: string[]) => void; // Função para atualizar as cidades
    selectedStates: string[]; // Dependência: estados selecionados no outro input
    error?: FieldError;
}

export const CidadeInput: React.FC<CidadeInputProps> = ({ text, isNotMandatory, value, onChange, selectedStates, error }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Helper para obter todos os estados brasileiros
    const allBrazilianStates = useMemo(() => State.getStatesOfCountry("BR"), []);

    // Memoiza todos os nomes de cidades disponíveis dos estados selecionados
    const allCityNamesFromSelectedStates = useMemo(() => {
        const cityNames = new Set<string>();
        if (selectedStates && selectedStates.length > 0) {
            selectedStates.forEach(estadoNome => {
                const stateObject = allBrazilianStates.find(s => s.name === estadoNome);
                if (stateObject) {
                    const citiesFromState = City.getCitiesOfState("BR", stateObject.isoCode);
                    citiesFromState.forEach(city => cityNames.add(city.name));
                }
            });
        }
        return Array.from(cityNames);
    }, [selectedStates, allBrazilianStates]);

    // Filtra sugestões de cidades para o autocomplete
    const filteredCitySuggestions = useMemo(() => {
        if (!searchTerm.trim() || selectedStates.length === 0) {
            return [];
        }
        return allCityNamesFromSelectedStates.filter(cityName =>
            cityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !value.includes(cityName)
        );
    }, [searchTerm, allCityNamesFromSelectedStates, value, selectedStates.length]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        if (selectedStates.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleSelectCity = (cityName: string) => {
        if (!value.includes(cityName)) {
            onChange([...value, cityName]); // Atualiza o estado via onChange
        }
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleAddAllCitiesFromState = (stateName: string) => {
        const stateObject = allBrazilianStates.find(s => s.name === stateName);
        if (stateObject) {
            const citiesOfThisState = City.getCitiesOfState("BR", stateObject.isoCode).map(city => city.name);
            const newCities = Array.from(new Set([...value, ...citiesOfThisState]));
            onChange(newCities); // Atualiza o estado via onChange
        }
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleRemoveAllCities = () => {
        onChange([]); // Limpa a lista de cidades
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    return (
        <div className="flex flex-col md:flex-row w-full justify-between items-start h-auto py-3" ref={wrapperRef}>
            <label className="text-xl text-blue-fcsn dark:text-white-off mb-1 font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>
            
            <div className="flex flex-col w-full md:w-3/5">
                <div className={`flex flex-col justify-start w-full max-h-[45vh] border rounded-[7px] bg-white dark:bg-blue-fcsn3 relative ${error ? bordaErro : bordaBase}`}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => { if (selectedStates.length > 0) setShowSuggestions(true); }}
                        placeholder={selectedStates.length === 0 ? "Selecione um estado primeiro" : "Buscar cidade..."}
                        className="w-full min-h-[50px] text-blue-fcsn dark:text-white-off bg-transparent pl-5 rounded-t-[7px] focus:outline-none box-border"
                        disabled={selectedStates.length === 0}
                    />

                    {showSuggestions && filteredCitySuggestions.length > 0 && (
                        <ul className="absolute top-[50px] left-[-1px] right-[-1px] z-20 bg-white dark:bg-blue-fcsn3 border-l border-r border-b border-blue-fcsn rounded-b-[7px] max-h-[50vh] overflow-y-auto shadow-lg">
                            {filteredCitySuggestions.map((cityName, index) => (
                                <li key={`city-sugg-${index}-${cityName}`} onMouseDown={() => handleSelectCity(cityName)} className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off">
                                    {cityName}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <div className="border-t border-blue-fcsn3 dark:border-blue-fcsn"></div>
                    
                    <div className="h-full overflow-y-auto scrollbar-thin">
                        {selectedStates.length > 0 && (
                            <div className="sticky top-0 z-10 bg-white dark:bg-blue-fcsn3 p-2 border-b border-blue-fcsn3 dark:border-blue-fcsn">
                                <div className="w-full mb-1">
                                    <span className="text-xs h-[24px] text-gray-500 dark:text-gray-400 py-0.5 mr-2">Opções rápidas:</span>
                                    {value.length > 0 && (
                                        <button type="button" onClick={handleRemoveAllCities} className="text-xs text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-fcsn dark:hover:bg-red-400 dark:text-white cursor-pointer px-2 py-1 rounded">
                                            Remover todas
                                        </button>
                                    )}
                                </div>
                                <div className="w-full flex flex-wrap">
                                    {selectedStates.map((estadoNome) => (
                                        <button key={`add-all-${estadoNome}`} type="button" onMouseDown={() => handleAddAllCitiesFromState(estadoNome)} className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1">
                                            Adicionar todas de {estadoNome}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="p-2">
                            {value.length > 0 ? value.map((cidade, index) => (
                                <button key={`${cidade}-${index}-selected`} type="button" onClick={() => onChange(value.filter(item => item !== cidade))} className="text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-fcsn2 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off cursor-pointer px-2 py-1 rounded m-1 inline-flex">
                                    {cidade}
                                </button>
                            )) : (
                                selectedStates.length > 0 && <p className="text-xs text-gray-400 dark:text-gray-500 px-2">Nenhuma cidade selecionada.</p>
                            )}
                            {selectedStates.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Selecione estados para ver opções de cidades.</p>
                            )}
                        </div>
                    </div>
                </div>
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

interface CidadesDashboardProps{
    text: string;
    estado: string;
    cidades: string[];
    setCidades: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CidadeInputDashboard: React.FC<CidadesDashboardProps> = (props) => {
    const estadosBrasil = useMemo(() => ({
  'acre': 'Acre',
  'alagoas': 'Alagoas',
  'amapa': 'Amapá',
  'amazonas': 'Amazonas',
  'bahia': 'Bahia',
  'ceara': 'Ceará',
  'distrito_federal': 'Distrito Federal',
  'espirito_santo': 'Espírito Santo',
  'goias': 'Goiás',
  'maranhao': 'Maranhão',
  'mato_grosso': 'Mato Grosso',
  'mato_grosso_do_sul': 'Mato Grosso do Sul',
  'minas_gerais': 'Minas Gerais',
  'para': 'Pará',
  'paraiba': 'Paraíba',
  'parana': 'Paraná',
  'pernambuco': 'Pernambuco',
  'piaui': 'Piauí',
  'rio_de_janeiro': 'Rio de Janeiro',
  'rio_grande_do_norte': 'Rio Grande do Norte',
  'rio_grande_do_sul': 'Rio Grande do Sul',
  'rondonia': 'Rondônia',
  'roraima': 'Roraima',
  'santa_catarina': 'Santa Catarina',
  'sao_paulo': 'São Paulo',
  'sergipe': 'Sergipe',
  'tocantins': 'Tocantins'
} as Record<string, string>), []);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // Helper para obter todos os estados brasileiros. Pode ser otimizado se já disponível do componente pai.
    const getAllBrazilianStates = () => State.getStatesOfCountry("BR");

    // Memoize todos os nomes de cidades disponíveis dos estados selecionados
    const allCityNames = useMemo(() => {
        const cityNames: string[] = [];
        if (props.estado) {
            const brazilianStates = getAllBrazilianStates();
            const stateObject = brazilianStates.find(s => s.name === estadosBrasil[props.estado]);
                if (stateObject) {
                    const stateIsoCode = stateObject.isoCode;
                    const citiesFromState = City.getCitiesOfState("BR", stateIsoCode);
                    cityNames.push(...citiesFromState.map(city => city.name));
                }
            };
        return [...new Set(cityNames)]; // Remove duplicatas, caso haja
    }, [props.estado, estadosBrasil]);

    // Memoize a lista de cidades filtradas para as sugestões do autocomplete
    const filteredCitySuggestions = useMemo(() => {
        if (!searchTerm.trim()) {
            return []; // Não mostrar sugestões se o input estiver vazio ou nenhum estado selecionado
        }
        return allCityNames.filter(cityName =>
            cityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !props.cidades.includes(cityName) // Não sugerir cidades já selecionadas
        );
    }, [searchTerm, allCityNames, props.cidades]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setShowSuggestions(true); // Mostra sugestões ao digitar
    };

    const handleSelectCity = (cityName: string) => {
        if (!props.cidades.includes(cityName)) {
            props.setCidades(prevCities => [...prevCities, cityName]);
        }
        setSearchTerm(""); // Limpa o input após seleção
        setShowSuggestions(false);
    };
    
    return(
        <div className="flex flex-row justify-between items-start h-auto py-3">            
            <div className="flex flex-col justify-start w-full max-h-[45vh] border border-blue-fcsn rounded-[7px] bg-white dark:bg-blue-fcsn3 relative m-2">
                {/* Input de busca de cidade */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => {setShowSuggestions(true);}}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={props.estado === '' ? "Selecione um estado primeiro" : "Buscar cidade..."}
                    className="w-full min-h-[50px] text-blue-fcsn dark:text-white-off bg-transparent pl-5 rounded-t-[7px] focus:outline-none box-border"
                    disabled={props.estado === ''}
                />

                {showSuggestions && filteredCitySuggestions.length > 0 && (
                    <ul className="absolute top-[50px] left-[-1px] right-[-1px] z-15 bg-white dark:bg-blue-fcsn3 border-l border-r border-b border-blue-fcsn rounded-b-[7px] max-h-[50vh] overflow-y-auto shadow-lg">
                        {filteredCitySuggestions.map((cityName, index) => (
                            <li
                                key={`city-sugg-${index}-${cityName}`}
                                onClick={() => handleSelectCity(cityName)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                            >
                                {cityName}
                            </li>
                        ))}
                    </ul>
                )}
                
                <div className="border-t border-blue-fcsn3 dark:border-blue-fcsn"></div>
                
                <div className="h-[calc(100%-51px)] overflow-y-auto scrollbar-thin">
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
                            props.estado != '' && <p className="text-xs text-gray-400 dark:text-gray-500 px-2">Nenhuma cidade selecionada.</p>
                        )}
                         {props.estado === '' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Selecione estados para ver opções de cidades.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DateInputsProps {
    text: string;
    isNotMandatory: boolean;
    startRegistration: UseFormRegisterReturn;
    endRegistration: UseFormRegisterReturn;
    error_start?: FieldError;
    error_end?: FieldError;
}

export const DateInputs: React.FC<DateInputsProps> = ({ text, isNotMandatory, startRegistration, endRegistration, error_start, error_end }) => {
    return (
        <div className="flex flex-col justify-start w-full py-3 gap-x-5">
            {/* Usamos <h2> ou <div> para o título do grupo, pois <label> é para um único input */}
            <h2 className="text-xl text-blue-fcsn dark:text-white-off font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-start items-start w-full mt-2 gap-x-2">
                
                {/* Input de Data Inicial */}
                <div className="flex flex-col">
                    <input 
                        type="date" 
                        {...startRegistration}
                        className={`w-[150px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center text-blue-fcsn dark:text-white rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 ${error_start ? bordaErro : bordaBase}`}
                    />
                    {error_start && <p className="text-red-500 w-[150px] text-wrap text-center sm:mt-1 text-sm">{error_start.message}</p>}
                </div>

                <p className="text-xl text-blue-fcsn dark:text-white-off sm:self-center">a</p>

                {/* Input de Data Final */}
                <div className="flex flex-col">
                    <input
                        type="date" 
                        {...endRegistration}
                        className={`w-[150px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center text-blue-fcsn dark:text-white rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 ${error_end ? bordaErro : bordaBase}`}
                    />
                    {error_end && <p className="text-red-500 w-[150px] text-wrap text-center mt-1 text-sm">{error_end.message}</p>}
                </div>

            </div>
        </div>
    );
}

export const YesNoInput: React.FC<HookFormSelectProps> = ({ text, list, isNotMandatory, registration, error }) => {

    return (
        <div className="flex flex-col md:flex-row w-full justify-start items-start">
            <label htmlFor={registration.name} className="text-xl text-blue-fcsn dark:text-white-off font-bold pr-3">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>

            <div className="flex flex-col justify-center items-start">
                <select
                    id={registration.name}
                    {...registration}
                    className={`min-w-[170px] w-full max-w-[180px] h-[50px] text-blue-fcsn dark:text-white-off bg-white dark:bg-blue-fcsn3 border-1 cursor-pointer rounded-[7px] focus:ring focus:border-1 focus:shadow-2xl px-3 ${error ? bordaErro : bordaBase}`}
                >
                    <option value="" disabled>Escolha uma opção</option>
                    
                    {/* Os valores das opções são strings "true" e "false".
                        usei o z.coerce.boolean() do Zod para converter.
                    */}
                    <option value="true">{list[0]}</option> {/* "Sim" */}
                    <option value="false">{list[1]}</option> {/* "Não" */}
                </select>
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

interface ControlledCheckboxGroupProps {
    text: string;
    subtext: string;
    list: string[];
    isNotMandatory: boolean;
    value: boolean[]; // Array de booleans vindo do react-hook-form
    onChange: (value: boolean[]) => void; // Função para atualizar o array
    error?: FieldError;
}

export const VerticalSelects: React.FC<ControlledCheckboxGroupProps> = ({ text, subtext, list, value, onChange, error, isNotMandatory }) => {
    
    const handleCheckboxChange = (index: number) => {
        const newValue = [...(value || [])]; // Cria uma cópia do array de valores
        newValue[index] = !newValue[index]; // Inverte o valor da checkbox clicada
        onChange(newValue); // Informa o react-hook-form sobre a mudança
    };

    return (
        <div className="flex flex-col justify-between items-start py-3 gap-y-2">
            <h2 className="w-full text-xl text-blue-fcsn dark:text-white-off font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h2>

            <p className="text-md text-blue-fcsn dark:text-white-off">
                {subtext}
            </p>
            
            <div className="flex flex-col gap-y-2" role="group" aria-labelledby="vertical-selects-title">
                {list.map((itemLabel, index) => (
                    <div key={index} className="flex flex-row items-center gap-x-2">
                        <input 
                            type="checkbox" 
                            id={`ods-${index}`}
                            checked={value?.[index] || false} // O estado de 'checked' vem da prop 'value'
                            onChange={() => handleCheckboxChange(index)}
                            className="w-5 h-5 accent-blue-fcsn dark:accent-gray-100 cursor-pointer"
                        />
                        <label htmlFor={`ods-${index}`} className="text-lg text-blue-fcsn dark:text-white-off cursor-pointer">
                            {"ODS " + (index + 1) + ": " + itemLabel}
                        </label>
                    </div>
                ))}
            </div>
            {/* Exibe a mensagem de erro para o grupo de checkboxes */}
            {error && <p className="text-red-500 mt-2 text-sm">{error.message}</p>}
        </div>
    );
}

interface PublicoInputProps {
    text: string;
    subtext?: string;
    list: string[];
    isNotMandatory: boolean;
    value: boolean[];
    onChange: (value: boolean[]) => void;
    error?: FieldError;
}

// Novo Componente genérico
export const PublicoInput: React.FC<PublicoInputProps> = ({ text, subtext, list, value, onChange, error, isNotMandatory }) => {
    const handleCheckboxChange = (index: number) => {
        const newValue = [...(value || [])];
        newValue[index] = !newValue[index];
        onChange(newValue);
    };

    return (
        <div className="flex flex-col justify-between items-start py-3 gap-y-2">
            <h2 className="w-full text-xl text-blue-fcsn dark:text-white-off font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h2>

            {subtext && <p className="text-md text-blue-fcsn dark:text-white-off">{subtext}</p>}

            <div className="flex flex-col gap-y-2" role="group">
                {list.map((itemLabel, index) => (
                    <div key={index} className="flex flex-row items-center gap-x-2">
                        <input 
                            type="checkbox" 
                            id={`checkbox-${text.replace(/\s/g, '')}-${index}`}
                            checked={value?.[index] || false}
                            onChange={() => handleCheckboxChange(index)}
                            className="w-5 h-5 accent-blue-fcsn dark:accent-gray-100 cursor-pointer"
                        />
                        <label htmlFor={`checkbox-${text.replace(/\s/g, '')}-${index}`} className="text-lg text-blue-fcsn dark:text-white-off cursor-pointer">
                            {itemLabel}
                        </label>
                    </div>
                ))}
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error.message}</p>}
        </div>
    );
};

interface ControlledFileInputProps {
    text: string;
    isNotMandatory: boolean;
    value: File[]; // O array de arquivos vindo do react-hook-form
    onChange: (files: File[]) => void; // A função para atualizar o array de arquivos
    error?: FieldError;
    acceptedFileTypes?: string[];
}

export const FileInput: React.FC<ControlledFileInputProps> = ({ text, isNotMandatory, value, onChange, error, acceptedFileTypes = [] }) => {
    const [isDragging, setIsDragging] = useState(false);
    const files = useMemo(() => value || [], [value]);

    const handleAddFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const filesToAdd = Array.from(newFiles);
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        if (acceptedFileTypes.length > 0) {
            filesToAdd.forEach(file => {
                if (acceptedFileTypes.includes(file.type)) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(file.name);
                }
            });
        } else {
            // Se nenhum tipo é especificado, aceita todos
            validFiles.push(...filesToAdd);
        }

        if (validFiles.length > 0) {
            onChange([...files, ...validFiles]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        onChange(files.filter((_, index) => index !== indexToRemove));
    };

    // Funções para o efeito visual de arrastar e soltar
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
        handleAddFiles(e.dataTransfer.files);
    };

    return (
        <div className={`flex ${files.length === 0 ? 'flex-col md:flex-row md:items-center gap-2 md:gap-4' : 'flex-col gap-2'} py-3`}>
            <h2 className={`${files.length === 0 ? 'flex-shrink-0' : 'w-full'} text-xl text-blue-fcsn dark:text-white-off font-bold md:text-nowrap flex flex-row justify-start items-center`}>
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </h2>
            <div className="flex flex-col">
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        ${files.length === 0 ? 'h-[80px] w-full md:max-w-[290px] flex-grow' : 'w-full min-h-[100px] max-h-[300px] overflow-y-auto'} 
                        flex flex-col items-center justify-center
                        bg-white dark:bg-blue-fcsn3 border-1 rounded-[7px] 
                        cursor-pointer p-4
                        ${isDragging ? 'border-dashed border-blue-fcsn bg-blue-50' : 'hover:bg-gray-50 dark:hover:bg-blue-fcsn'}
                        ${error ? bordaErro : bordaBase}
                    `}>
                    <input
                        type="file"
                        className="hidden"
                        multiple
                        // Converte o array de tipos para uma string aceita pelo input
                        accept={acceptedFileTypes.join(",")}
                        onChange={(event) => {
                            handleAddFiles(event.target.files);
                            event.target.value = '';
                        }}
                    />

                    {files.length === 0 ? (
                        <div className="flex flex-row items-center gap-2 text-blue-fcsn dark:text-white-off">
                            <Upload className="min-w-[30px] min-h-[30px] w-7 h-7" />
                            <p className="text-md text-blue-fcsn3 dark:text-white-off">
                                {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full space-y-2">
                            {files.map((file, index) => (
                                <div
                                key={`${file.name}-${file.lastModified}-${file.size}`}
                                className="flex flex-row justify-between items-center w-full hover:bg-gray-100 dark:hover:bg-blue-fcsn2 rounded-md group py-2 px-4">
                                    <span className="text-blue-fcsn3 dark:text-white-off truncate pr-2">{file.name}</span>
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(index); }} className="text-red-600 dark:text-red-50 bg-red-100 dark:bg-red-fcsn hover:bg-red-200 dark:hover:bg-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-xs">
                                        Remover
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </label>
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}

interface SingleEstadoProps {
    text: string;
    isNotMandatory: boolean;
    value: string; // Receberá a sigla do estado (ex: "SP") do react-hook-form
    onChange: (value: string) => void; // Função para atualizar o valor no react-hook-form
    error?: FieldError;
}

export const SingleEstadoInput: React.FC<SingleEstadoProps> = ({ text, isNotMandatory, value, onChange, error }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // Busca todos os estados brasileiros
    const allBrazilianStates = useMemo(() => State.getStatesOfCountry("BR"), []);

    // Encontra o nome completo do estado selecionado para exibição
    const selectedStateName = useMemo(() => {
        if (!value) return "";
        const state = allBrazilianStates.find(s => s.isoCode === value);
        return state ? `${state.isoCode}` : "";
    }, [value, allBrazilianStates]);

    // Filtra os estados com base na busca do usuário
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
        setShowSuggestions(true);
        // Se o usuário apagar o campo, o estado selecionado também é limpo no formulário
        if (newSearchTerm === "") {
            onChange("");
        }
    };

    const handleSelectState = (state: { name: string; isoCode: string }) => {
        onChange(state.isoCode); // Atualiza o valor no formulário com a sigla
        setSearchTerm(""); // Limpa o termo de busca
        setShowSuggestions(false);
    };

    return (
        <div className="flex flex-col lg:flex-row max-w-[90px] lg:max-w-[180px] md:gap-x-4 items-center grow">
            <label htmlFor="single-state-input" className="text-xl text-blue-fcsn dark:text-white-off font-bold">
                {text} {isNotMandatory ? "" : <span className="text-[#B15265]">*</span>}
            </label>

            <div className="relative">
                <input
                    id="single-state-input"
                    type="text"
                    value={searchTerm || selectedStateName} // Mostra o termo de busca ou o estado já selecionado
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay para permitir o clique
                    className={`w-full max-w-[80px] min-w-[70px] h-[50px] bg-white dark:bg-blue-fcsn3 text-center rounded-[7px] border-1 border-blue-fcsn focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-3 ${error ? bordaErro : bordaBase}`}
                />

                {showSuggestions && filteredStates.length > 0 && (
                    <ul className="absolute min-w-[140px] top-full -inset-x-1/2 z-10 bg-white dark:bg-blue-fcsn3 border-1 border-blue-fcsn rounded-[7px] max-h-[25vh] overflow-y-auto shadow-lg">
                        {filteredStates.map((state) => (
                            <li
                                key={state.isoCode}
                                onMouseDown={() => handleSelectState(state)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-fcsn text-blue-fcsn dark:text-white-off"
                            >
                                {state.name} ({state.isoCode})
                            </li>
                        ))}
                    </ul>
                )}

                {/* Exibição da mensagem de erro */}
                {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
            </div>
        </div>
    );
}