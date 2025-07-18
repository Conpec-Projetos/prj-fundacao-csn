import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import json
import os
import re
import unicodedata
from thefuzz import process


# Configuração do Firebase
cred = credentials.Certificate(r"D:/Unicamp/CC/Conpec/Fundação CSN/prj-fundacao-csn/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Caminho para sua planilha
caminho_planilha = r"C:/Users/leona/Downloads/PlanilhaFCSN2024.xlsx"

# Nome do arquivo para cache dos dados do IBGE
ARQUIVO_CACHE_IBGE = 'dados_municipios_estados_ibge.json'

def carregar_dados_ibge():
    """
    Carrega os dados de estados e municípios.
    Primeiro, tenta carregar do arquivo de cache local.
    Se não existir, busca da API do IBGE e salva em cache.
    """
    if os.path.exists(ARQUIVO_CACHE_IBGE):
        print(f"Carregando dados geográficos do cache '{ARQUIVO_CACHE_IBGE}'")
        with open(ARQUIVO_CACHE_IBGE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    print("Cache não encontrado. Buscando dados da API do IBGE")
    
    # Busca Estados (UFs)
    url_estados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    estados_raw = requests.get(url_estados).json()
    
    estados_map = {str(uf['id']): {'nome': uf['nome'], 'sigla': uf['sigla']} for uf in estados_raw}
    
    # Busca Municípios e agrupa por estado
    url_municipios = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
    municipios_raw = requests.get(url_municipios).json()
    
    dados_geo = {
        'estados': {},
        'municipios_por_estado': {}
    }

    # Prepara a estrutura de dados com os nomes dos estados
    for estado_id, estado_info in estados_map.items():
        nome_estado = estado_info['nome']
        dados_geo['estados'][nome_estado] = estado_info['sigla']
        dados_geo['municipios_por_estado'][nome_estado] = []

    # Itera sobre os municípios e os atribui ao estado correto
    for municipio in municipios_raw:
        nome_municipio = municipio['nome']
        uf_sigla = None
        
        # Tenta o caminho padrão primeiro
        try:
            uf_sigla = municipio['microrregiao']['mesorregiao']['UF']['sigla']
        # Se falhar (para casos como Brasília), tenta um caminho alternativo
        except (TypeError, KeyError):
            try:
                uf_sigla = municipio['regiao-imediata']['regiao-intermediaria']['UF']['sigla']
            except (TypeError, KeyError):
                print(f"Aviso: Não foi possível determinar o estado para o município '{nome_municipio}'. Ele será ignorado.")
                continue # Pula para o próximo município

        if uf_sigla:
            # Encontra o nome completo do estado a partir da sigla
            for nome_estado, sigla in dados_geo['estados'].items():
                if sigla == uf_sigla:
                    dados_geo['municipios_por_estado'][nome_estado].append(nome_municipio)
                    break

    with open(ARQUIVO_CACHE_IBGE, 'w', encoding='utf-8') as f:
        json.dump(dados_geo, f, ensure_ascii=False, indent=2)
        
    print("Dados do IBGE salvos em cache.")
    return dados_geo


# Carrega os dados na inicialização do script
dados_geo = carregar_dados_ibge()
LISTA_ESTADOS_CORRETOS = list(dados_geo['estados'].keys())
MAPA_MUNICIPIOS_CORRETOS = dados_geo['municipios_por_estado']


def normalizar(texto):
    """
    Converte para minúsculas, remove acentos e espaços extras.
    """
    if not isinstance(texto, str):
        return ""
    # NFD normaliza para decompor caracteres (e.g., 'ç' -> 'c' + '̧')
    texto = unicodedata.normalize('NFD', texto.lower().strip())
    # Remove os diacríticos (acentos)
    return "".join(c for c in texto if unicodedata.category(c) != 'Mn')


def corrigir_nome(nome_incorreto, lista_correta, limiar=85):
    """
    Usa fuzzy matching para encontrar o nome mais provável em uma lista.
    Retorna o nome correto ou o original se a similaridade for baixa.
    """
    if nome_incorreto == 'Indefinido':
        return nome_incorreto, False

    nome_normalizado = normalizar(nome_incorreto)
    if not nome_normalizado:
        return nome_incorreto, False

    # Extrai o melhor match da lista de opções
    # process.extractOne retorna (opção_correta, score)
    melhor_match, score = process.extractOne(nome_normalizado, [normalizar(n) for n in lista_correta])
    
    if score >= limiar:
        # Encontra o nome original (com acentos e capitalização) correspondente ao match normalizado
        for nome_original in lista_correta:
            if normalizar(nome_original) == melhor_match:
                if nome_original.lower() != nome_incorreto.lower():
                    print(f"Correção: '{nome_incorreto}' -> '{nome_original}' (Similaridade: {score}%)")
                    return nome_original, True
                else: # O nome já estava correto, apenas com capitalização/acentos diferentes
                    return nome_original, False 
    
    print(f"AVISO: Não foi possível encontrar uma correspondência para '{nome_incorreto}' (Melhor tentativa: '{melhor_match}' com {score}%). Mantendo o original.")
    return nome_incorreto, False


def converter_valor_para_float(valor):
    """
    Converte um valor (string ou número) para float de forma segura,
    tratando formatos monetários brasileiros e numéricos padrão.
    """
    # Se já for um número, apenas retorna como float.
    if isinstance(valor, (int, float)):
        return float(valor)

    # Se não for uma string, não é possível converter.
    if not isinstance(valor, str):
        return 0.0

    # Limpa a string de entrada.
    s = valor.strip()
    if not s:
        return 0.0
    
    # Usa regex para extrair a parte numérica da string.
    # Isso lida com "R$ 1.234,56" -> "1.234,56"
    match = re.search(r'[\d.,]+', s)
    if not match:
        return 0.0
    s = match.group(0)

    # Lógica de conversão
    # Se tem vírgula, assume-se que é o formato brasileiro (1.234,56).
    if ',' in s:
        # Remove os pontos (milhares) e substitui a vírgula (decimal) por ponto.
        s = s.replace('.', '').replace(',', '.')
    # Se não tem vírgula, mas tem mais de um ponto (ex: 1.234.567),
    # assume-se que são separadores de milhar.
    elif s.count('.') > 1:
        s = s.replace('.', '')
    
    # Tenta a conversão final.
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


def mapear_lei(lei_da_planilha):
    """
    Converte o nome da lei da planilha para o nome padrão usado no website.
    """
    if not isinstance(lei_da_planilha, str):
        return "" # Retorna vazio se não for um texto válido

    # Normaliza o texto para facilitar a comparação (maiúsculas, sem espaços extras)
    lei_normalizada = lei_da_planilha.upper().strip()

    # Mapeamento baseado em palavras-chave
    if "ROUANET" in lei_normalizada or "CULTURA" in lei_normalizada:
        return "Lei de Incentivo à Cultura"
    elif "FIA" in lei_normalizada or "INFÂNCIA" in lei_normalizada:
        return "FIA - Lei Fundo para a Infância e Adolescência"
    elif "IDOSO" in lei_normalizada:
        return "Lei da Pessoa Idosa"
    elif "ESPORTE" in lei_normalizada or "LIE" in lei_normalizada:
        return "LIE - Lei de Incentivo ao Esporte"
    elif "ICMS" in lei_normalizada and "RJ" in lei_normalizada:
        return "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços"
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
    
    # Se nenhuma regra corresponder, imprime um aviso e retorna o nome original
    else:
        print(f"AVISO: Lei '{lei_da_planilha}' não possui mapeamento. Usando o nome original.")
        return lei_da_planilha

# PROCESSAMENTO PRINCIPAL DA PLANILHA

try:
    df = pd.read_excel(caminho_planilha, sheet_name="Geral -2024")
    print(f"\nPlanilha '{caminho_planilha}' lida com sucesso. {len(df)} registros encontrados.")

    # Padroniza os nomes das colunas: converte para minúsculas e remove espaços.
    df.columns = [str(col).lower().strip() for col in df.columns]
    
    # Linha para debug: mostra os nomes das colunas DEPOIS da limpeza.
    # Você pode remover esta linha depois, se quiser.
    print(f"Nomes das colunas padronizados para: {df.columns.tolist()}")

    for index, row in df.iterrows():
        print(f"\nProcessando projeto: {row['projeto']} (Índice {row['unnamed: 0']})")
        
        # CORRIGIR ESTADOS
        if pd.notna(row['estado']):
            estados_originais = re.split(r'\s*[/,-]\s*', str(row['estado']))
        else:
            estados_originais = "Indefinido"
            print('Não foi possível encontrar um estado!')
        
        estados_corrigidos = set() # Usar 'set' para evitar duplicados
        
        for estado_str in estados_originais:
            estado_limpo = estado_str.strip()
            if estado_limpo:
                estado_corrigido, _ = corrigir_nome(estado_limpo, LISTA_ESTADOS_CORRETOS)
                estados_corrigidos.add(estado_corrigido)

        # CORRIGIR MUNICÍPIOS (USANDO O CONTEXTO DOS ESTADOS CORRIGIDOS)
        if pd.notna(row['município']):
            municipios_originais = re.split(r'\s*[/,-]\s*', str(row['município']))
        else:
            municipios_originais = "Indefinido"
            print('Não foi possível encontrar um município!')

        municipios_corrigidos = set()
        
        # Cria uma lista de todos os municípios possíveis baseada nos estados corrigidos
        lista_municipios_contexto = []
        for estado in estados_corrigidos:
            if estado in MAPA_MUNICIPIOS_CORRETOS:
                lista_municipios_contexto.extend(MAPA_MUNICIPIOS_CORRETOS[estado])

        if not lista_municipios_contexto:
             print("AVISO: Não há estados válidos para este projeto, não é possível corrigir municípios.")

        for municipio_str in municipios_originais:
            municipio_limpo = municipio_str.strip()
            if municipio_limpo and lista_municipios_contexto:
                municipio_corrigido, _ = corrigir_nome(municipio_limpo, lista_municipios_contexto)
                municipios_corrigidos.add(municipio_corrigido)
            elif municipio_limpo:
                municipios_corrigidos.add(municipio_limpo) # Mantém original se não há contexto

        # MONTAGEM DO OBJETO PARA O FIREBASE
        if pd.notna(row['indicação']):
            indicacao = str(row['indicação']).strip()
        else:
            indicacao = "Indefinido"
            print('Não foi possível encontrar uma indicação!')

        valor_aprovado = converter_valor_para_float(row['aportado 2024'])

        lei_padronizada = mapear_lei(str(row['lei']))

        projeto_data = {
            'nome': str(row['projeto']).strip(),
            'instituicao': str(row['proponente']).strip(),
            'lei': lei_padronizada,
            'valorAprovado': valor_aprovado,
            'indicacao': indicacao,
            'estados': sorted(list(estados_corrigidos)),
            'municipios': sorted(list(municipios_corrigidos)),
            'status': "aprovado",
            'ativo': False,
            'compliance': True,
            'empresas': [],
        }

        # ENVIO PARA O FIRESTORE
        try:
            doc_ref = db.collection('projetos').add(projeto_data)
            print(f"Projeto '{projeto_data['nome']}' adicionado com o ID: {doc_ref[1].id}")
        except Exception as e:
            print(f"ERRO! Falha ao adicionar o projeto '{projeto_data['nome']}' ao Firestore: {e}")

    print("\nImportação concluída!")

except FileNotFoundError:
    print(f"ERRO: O arquivo '{caminho_planilha}' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro inesperado: {e}")
