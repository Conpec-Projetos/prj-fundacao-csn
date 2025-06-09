import firebase_admin
from firebase_admin import credentials, firestore;

# Initialize Firebase
cred = credentials.Certificate("src/firebase/scripts/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

nomesEstadosFirebase = ['acre','alagoas','amapa','amazonas','bahia','ceara','distrito_federal','espirito_santo', 'goias', 'maranhao', 'mato_grosso', 'mato_grosso_do_sul','minas_gerais','para', 'paraiba', 'parana', 'pernambuco','piaui','rio_de_janeiro', 'rio_grande_do_norte', 'rio_grande_do_sul','rondonia','roraima','santa_catarina','sao_paulo','sergipe','tocantins']
nomesEstadosBrasil = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];

for i in range(len(nomesEstadosFirebase)):
    # Document data based on the images
    doc_data = {
        "beneficiariosDireto": 1*i,
        "beneficiariosIndireto": 2*i,
        "lei": [
            {"nome": "Lei de Incentivo à Cultura", "qtdProjetos": 1*i},
            {"nome": "PROAC - Programa de Ação Cultural", "qtdProjetos": 2*i},
            {"nome": "FIA - Lei Fundo para a Infância e Adolescência", "qtdProjetos": 3*i},
            {"nome": "LIE - Lei de Incentivo ao Esporte", "qtdProjetos": 4*i},
            {"nome": "Lei da Pessoa Idosa", "qtdProjetos": 5*i},
            {"nome": "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência", "qtdProjetos": 6*i},
            {"nome": "Pronon - Programa Nacional de Apoio à Atenção Oncológica", "qtdProjetos": 7*i},
            {"nome": "Promac - Programa de Incentivo à Cultura do Município de São Paulo", "qtdProjetos": 8*i},
            {"nome": "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": 9*i},
            {"nome": "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": 10*i},
            {"nome": "PIE - Lei Paulista de Incentivo ao Esporte", "qtdProjetos": 10*i,},
        ],
        "maiorAporte": {"nome" : f"Projeto em {nomesEstadosBrasil[i]}", 'valorAportado': 10*i},
        "municipios": [""],
        "nomeEstado": nomesEstadosBrasil[i],
        "projetosODS": [i*j for j in range(17)],
        "qtdMunicipios": 5*i,
        "qtdOrganizacoes": 6*i,
        "qtdProjetos": 7*i+1,
        "segmento": [
            {"nome": "Cultura", "qtdProjetos": i},
            {"nome": "Esporte", "qtdProjetos": 2*i},
            {"nome": "Pessoa Idosa", "qtdProjetos": 3*i},
            {"nome": "Criança e Adolescente", "qtdProjetos": 4*i},
            {"nome": "Saúde", "qtdProjetos": 5*i},
        ],
        "valorTotal": 8*i
        }

    doc_ref = db.collection("dadosEstados").document(nomesEstadosFirebase[i])
    doc_ref.set(doc_data)
    print(f"Documento {nomesEstadosBrasil[i]} criado com sucesso no Firestore")
