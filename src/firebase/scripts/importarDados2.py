import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import json
import os
import re
import unicodedata
from thefuzz import process
import datetime

# Configuração do Firebase
cred = credentials.Certificate(r"serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Configuração do Script ---
# Caminho para a planilha
caminho_planilha = r"planilhageral.xlsx"
# Nomes das abas (sheets) a serem processadas
PLANILHAS_PARA_PROCESSAR = ["2005-2013", "2014-2025"]
# Arquivo de cache para os dados do IBGE
ARQUIVO_CACHE_IBGE = 'dados_municipios_estados_ibge.json'

# Funções Auxiliares

def carregar_dados_ibge():
    """
    Carrega os dados de estados e municípios, incluindo um mapa de siglas para nomes de estados.
    Tenta carregar do cache local; se não existir, busca na API do IBGE.
    """
    if os.path.exists(ARQUIVO_CACHE_IBGE):
        print(f"Carregando dados geográficos do cache '{ARQUIVO_CACHE_IBGE}'")
        with open(ARQUIVO_CACHE_IBGE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    print("Cache não encontrado. Buscando dados da API do IBGE...")
    
    url_estados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    estados_raw = requests.get(url_estados).json()
    
    url_municipios = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
    municipios_raw = requests.get(url_municipios).json()
    
    # Estrutura para armazenar todos os dados geográficos
    dados_geo = {
        'estados': {},
        'municipios_por_estado': {},
        'sigla_para_nome': {uf['sigla']: uf['nome'] for uf in estados_raw} # NOVO: Mapa de sigla -> nome
    }

    for uf in estados_raw:
        nome_estado = uf['nome']
        dados_geo['estados'][nome_estado] = uf['sigla']
        dados_geo['municipios_por_estado'][nome_estado] = []

    for municipio in municipios_raw:
        nome_municipio = municipio['nome']
        uf_sigla = None
        try:
            uf_sigla = municipio['microrregiao']['mesorregiao']['UF']['sigla']
        except (TypeError, KeyError):
            try:
                uf_sigla = municipio['regiao-imediata']['regiao-intermediaria']['UF']['sigla']
            except (TypeError, KeyError):
                print(f"Aviso: Não foi possível determinar o estado para o município '{nome_municipio}'. Ele será ignorado.")
                continue
        if uf_sigla:
            nome_estado_correspondente = dados_geo['sigla_para_nome'].get(uf_sigla)
            if nome_estado_correspondente:
                dados_geo['municipios_por_estado'][nome_estado_correspondente].append(nome_municipio)
    
    with open(ARQUIVO_CACHE_IBGE, 'w', encoding='utf-8') as f:
        json.dump(dados_geo, f, ensure_ascii=False, indent=2)
        
    print("Dados do IBGE salvos em cache.")
    return dados_geo

# Carrega os dados e mapas necessários na inicialização
dados_geo = carregar_dados_ibge()
LISTA_ESTADOS_CORRETOS = list(dados_geo['estados'].keys())
MAPA_MUNICIPIOS_CORRETOS = dados_geo['municipios_por_estado']
MAPA_SIGLA_PARA_NOME = dados_geo['sigla_para_nome']

def normalizar(texto):
    """Converte para minúsculas, remove acentos e espaços extras."""
    if not isinstance(texto, str):
        return ""
    texto = unicodedata.normalize('NFD', texto.lower().strip())
    return "".join(c for c in texto if unicodedata.category(c) != 'Mn')

def corrigir_nome(nome_incorreto, lista_correta, limiar=85):
    """Usa correspondência aproximada (fuzzy matching) para encontrar o nome mais provável em uma lista."""
    if nome_incorreto == 'Indefinido':
        return nome_incorreto, False
    nome_normalizado = normalizar(nome_incorreto)
    if not nome_normalizado:
        return nome_incorreto, False
    melhor_match, score = process.extractOne(nome_normalizado, [normalizar(n) for n in lista_correta])
    if score >= limiar:
        for nome_original in lista_correta:
            if normalizar(nome_original) == melhor_match:
                if nome_original.lower() != nome_incorreto.lower():
                    print(f"Correção: '{nome_incorreto}' -> '{nome_original}' (Similaridade: {score}%)")
                    return nome_original, True
                else:
                    return nome_original, False 
    print(f"AVISO: Não foi possível encontrar uma correspondência para '{nome_incorreto}' (Melhor tentativa: '{melhor_match}' com {score}%). Mantendo o original.")
    return nome_incorreto, False

def converter_valor_para_float(valor):
    """Converte um valor (string ou número) para float de forma segura."""
    if isinstance(valor, (int, float)):
        return float(valor)
    if not isinstance(valor, str):
        return 0.0
    s = valor.strip()
    if not s:
        return 0.0
    match = re.search(r'[\d.,]+', s)
    if not match:
        return 0.0
    s = match.group(0)
    if ',' in s:
        s = s.replace('.', '').replace(',', '.')
    elif s.count('.') > 1:
        s = s.replace('.', '')
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0

def mapear_lei(lei_da_planilha):
    """Mapeia o nome da lei da planilha para o nome padrão usado no sistema."""
    if not isinstance(lei_da_planilha, str):
        return ""
    lei_normalizada = lei_da_planilha.upper().strip()
    if "FIA" in lei_normalizada or "INFÂNCIA" in lei_normalizada:
        return "FIA - Lei Fundo para a Infância e Adolescência"
    elif "IDOSO" in lei_normalizada:
        return "Lei da Pessoa Idosa"
    elif "ESPORTE" in lei_normalizada or "LIE" in lei_normalizada:
        return "LIE - Lei de Incentivo ao Esporte"
    elif "ICMS" in lei_normalizada and "RJ" in lei_normalizada and "ESPORTE" in lei_normalizada:
        return "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços (Esporte)"
    elif "ICMS" in lei_normalizada and "RJ" in lei_normalizada and "CULTURA" in lei_normalizada:
        return "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços (Cultura)"
    elif "ICMS" in lei_normalizada and "RJ" in lei_normalizada:
        return "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços"
    elif "ICMS" in lei_normalizada and "MG" in lei_normalizada and "ESPORTE" in lei_normalizada:
        return "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços (Esporte)"
    elif "ICMS" in lei_normalizada and "MG" in lei_normalizada and "CULTURA" in lei_normalizada:
        return "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços (Cultura)"
    elif "ICMS" in lei_normalizada and "MG" in lei_normalizada:
        return "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços"
    elif "PROAC" in lei_normalizada:
        return "PROAC - Programa de Ação Cultural"
    elif "PRONAS" in lei_normalizada:
        return "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência"
    elif "PIE" in lei_normalizada:
        return "PIE - Lei Paulista de Incentivo ao Esporte"
    elif "PRONON" in lei_normalizada:
        return "Pronon - Programa Nacional de Apoio à Atenção Oncológica"
    elif "ROUANET" in lei_normalizada or "CULTURA" in lei_normalizada:
        return "Lei de Incentivo à Cultura"
    else:
        print(f"AVISO: A lei '{lei_da_planilha}' não possui mapeamento. Usando o nome original.")
        return lei_da_planilha

def processar_planilha(df):
    """
    Processa todas as linhas de um DataFrame e as importa para o Firestore.
    """
    # Padroniza os nomes das colunas para minúsculas e remove espaços
    df.columns = [str(col).lower().strip() for col in df.columns]

    for index, row in df.iterrows():
        # Obter Identificador do Projeto para Logs
        id_projeto_log = row.get('projeto', f"projeto no Índice {index}")
        if pd.isna(id_projeto_log):
             id_projeto_log = f"projeto no Índice {index}"
        print(f"\nProcessando: {id_projeto_log}")

        # Preparar Dados com Fallbacks
        nome_projeto = str(row['projeto']).strip() if pd.notna(row['projeto']) else "Indefinido"
        proponente = str(row['proponente']).strip() if pd.notna(row['proponente']) else "Indefinido"
        indicacao = str(row['indicação']).strip() if pd.notna(row['indicação']) else "Indefinido"
        lei_padronizada = mapear_lei(str(row['lei'])) if pd.notna(row['lei']) else "Indefinido"
        valor_aprovado = converter_valor_para_float(row.get('aportado', 0))

        # Timestamp dinâmico a partir da coluna 'ANO'
        data_aprovado = None
        year = row.get('ano')
        if pd.notna(year) and isinstance(year, (int, float)) and 1900 < year < 2100:
            data_aprovado = datetime.datetime(int(year), 1, 1, 3)
        else:
            print(f"AVISO: Ano inválido ou ausente '{year}'. O campo 'dataAprovado' será ignorado.")

        # Processamento de Estados
        if pd.notna(row['estado']):
            estados_originais_siglas = re.split(r'\s*[/,-]\s*', str(row['estado']))
        else:
            estados_originais_siglas = ["Indefinido"]
            print('AVISO: Estado não encontrado. Usando "Indefinido".')

        estados_corrigidos = set()
        for sigla_str in estados_originais_siglas:
            sigla_limpa = sigla_str.strip().upper()
            if sigla_limpa:
                nome_estado = MAPA_SIGLA_PARA_NOME.get(sigla_limpa)
                if nome_estado:
                    estados_corrigidos.add(nome_estado)
                else:
                    print(f"AVISO: Sigla de estado '{sigla_limpa}' não reconhecida. Mantendo o valor original.")
                    estados_corrigidos.add("Indefinido" if sigla_limpa == "INDEFINIDO" else sigla_limpa)
        
        # Processamento de Municípios
        if pd.notna(row['município']):
            municipios_originais = re.split(r'\s*[/,-]\s*', str(row['município']))
        else:
            municipios_originais = ["Indefinido"]
            print('AVISO: Município não encontrado. Usando "Indefinido".')
    
        municipios_corrigidos = set()
        lista_municipios_contexto = []
        for estado in {e for e in estados_corrigidos if e != "Indefinido"}:
            if estado in MAPA_MUNICIPIOS_CORRETOS:
                lista_municipios_contexto.extend(MAPA_MUNICIPIOS_CORRETOS[estado])

        for municipio_str in municipios_originais:
            if municipio_limpo := municipio_str.strip():
                if lista_municipios_contexto:
                    municipio_corrigido, _ = corrigir_nome(municipio_limpo, lista_municipios_contexto)
                    municipios_corrigidos.add(municipio_corrigido)
                else:
                    municipios_corrigidos.add(municipio_limpo)

        # Montar Objeto para o Firestore
        projeto_data = {
            'nome': nome_projeto,
            'instituicao': proponente,
            'lei': lei_padronizada,
            'valorAprovado': valor_aprovado,
            'indicacao': indicacao,
            'dataAprovado': data_aprovado,
            'estados': sorted(list(estados_corrigidos)),
            'municipios': sorted(list(municipios_corrigidos)),
            'status': "aprovado",
            'ativo': False,
            'compliance': True,
            'empresas': [],
        }

        # Enviar para o Firestore
        try:
            if projeto_data['nome'] == "Indefinido" and projeto_data['instituicao'] == "Indefinido":
                print(f"IGNORANDO: Registro no índice {index} parece estar vazio.")
                continue
            
            # Define o campo 'dataAprovado' como "Indefinido" se estiver ausente
            if projeto_data['dataAprovado'] is None:
                print(f"AVISO: 'dataAprovado' para o projeto '{projeto_data['nome']}' está indefinido. Definindo como 'Indefinido'.")
                projeto_data['dataAprovado'] = "Indefinido"

            doc_ref = db.collection('projetos').add(projeto_data)
            print(f"Projeto '{projeto_data['nome']}' adicionado com o ID: {doc_ref[1].id}")
        except Exception as e:
            print(f"ERRO! Falha ao adicionar o projeto '{projeto_data['nome']}' ao Firestore: {e}")

try:
    # Lê as abas especificadas em um dicionário de DataFrames
    todas_planilhas = pd.read_excel(caminho_planilha, sheet_name=PLANILHAS_PARA_PROCESSAR)
    
    for planilha, df in todas_planilhas.items():
        print(f"\n--- Processando Aba: '{planilha}' ---")
        if df.empty:
            print(f"Aba '{planilha}' está vazia. Ignorando.")
            continue
        processar_planilha(df)
        
    print("\nImportação concluída para todas as abas!")

except FileNotFoundError:
    print(f"ERRO: O arquivo '{caminho_planilha}' não foi encontrado.")
except ValueError as e:
    print(f"ERRO: Não foi possível ler as abas. Verifique se '{', '.join(PLANILHAS_PARA_PROCESSAR)}' existem no arquivo. Detalhes: {e}")
except Exception as e:
    print(f"Ocorreu um erro inesperado: {e}")
