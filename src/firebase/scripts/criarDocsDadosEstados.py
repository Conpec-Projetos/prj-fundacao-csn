import firebase_admin
from firebase_admin import credentials, firestore;

# Initialize Firebase
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

nomesEstadosFirebase = ['acre','alagoas','amapa','amazonas','bahia','ceara','distrito_federal','espirito_santo', 'goias', 'maranhao', 'mato_grosso', 'mato_grosso_do_sul','minas_gerais','para', 'paraiba', 'parana', 'pernambuco','piaui','rio_de_janeiro', 'rio_grande_do_norte', 'rio_grande_do_sul','rondonia','roraima','santa_catarina','sao_paulo','sergipe','tocantins']
nomesEstadosBrasil = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];

for i in range(len(nomesEstadosFirebase)):
    # Document data based on the images
    doc_data = {
        "beneficiariosDireto": 0,
        "beneficiariosIndireto": 0,
        "lei": [
            {"nome": "Lei de Incentivo à Cultura", "qtdProjetos": 0},
            {"nome": "PROAC - Programa de Ação Cultural", "qtdProjetos": 0},
            {"nome": "FIA - Lei Fundo para a Infância e Adolescência", "qtdProjetos": 0},
            {"nome": "LIE - Lei de Incentivo ao Esporte", "qtdProjetos": 0},
            {"nome": "Lei da Pessoa Idosa", "qtdProjetos": 0},
            {"nome": "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência", "qtdProjetos": 0},
            {"nome": "Pronon - Programa Nacional de Apoio à Atenção Oncológica", "qtdProjetos": 0},
            {"nome": "Promac - Programa de Incentivo à Cultura do Município de São Paulo", "qtdProjetos": 0},
            {"nome": "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": 0},
            {"nome": "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": 0},
            {"nome": "PIE - Lei Paulista de Incentivo ao Esporte", "qtdProjetos": 0,},
        ],
        "maiorAporte": {"nome" : f"Projeto em {nomesEstadosBrasil[i]}", 'valorAportado': 0},
        "municipios": [""],
        "nomeEstado": nomesEstadosBrasil[i],
        "projetosODS": [0 for j in range(17)],
        "qtdMunicipios": 0,
        "qtdOrganizacoes": 0,
        "qtdProjetos": 0,
        "segmento": [
            {"nome": "Cultura", "qtdProjetos": 0},
            {"nome": "Esporte", "qtdProjetos": 0},
            {"nome": "Pessoa Idosa", "qtdProjetos": 0},
            {"nome": "Criança e Adolescente", "qtdProjetos": 0},
            {"nome": "Saúde", "qtdProjetos": 0},
        ],
        "valorTotal": 0
        }

    doc_ref = db.collection("dadosEstados").document(nomesEstadosFirebase[i])
    doc_ref.set(doc_data)
    print(f"Documento {nomesEstadosBrasil[i]} criado com sucesso no Firestore")
