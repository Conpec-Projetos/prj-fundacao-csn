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
        "beneficiariosDireto": i,
        "beneficiariosIndireto": i,
        "lei": [
            {"nome": "Lei de Incentivo à Cultura", "qtdProjetos": i},
            {"nome": "PROAC - Programa de Ação Cultural", "qtdProjetos": i},
            {"nome": "FIA - Lei Fundo para a Infância e Adolescência", "qtdProjetos": i},
            {"nome": "LIE - Lei de Incentivo ao Esporte", "qtdProjetos": i},
            {"nome": "Lei da Pessoa Idosa", "qtdProjetos": i},
            {"nome": "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência", "qtdProjetos": i},
            {"nome": "Pronon - Programa Nacional de Apoio à Atenção Oncológica", "qtdProjetos": i},
            {"nome": "Promac - Programa de Incentivo à Cultura do Município de São Paulo", "qtdProjetos": i},
            {"nome": "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": i},
            {"nome": "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços", "qtdProjetos": i},
            {"nome": "PIE - Lei Paulista de Incentivo ao Esporte", "qtdProjetos": i,},
        ],
        "maiorAporte": i,
        "municipios": [""],
        "nomeEstado": nomesEstadosBrasil[i],
        "projetosODS": [i] * 17,
        "qtdMunicipios": i,
        "qtdOrganizacoes": i,
        "qtdProjetos": i,
        "segmento": [
            {"nome": "Cultura", "qtdProjetos": i},
            {"nome": "Esporte", "qtdProjetos": i},
            {"nome": "Pessoa Idosa", "qtdProjetos": i},
            {"nome": "Criança e Adolescente", "qtdProjetos": i},
            {"nome": "Saúde", "qtdProjetos": i},
        ],
        "valorTotal": i
        }

    doc_ref = db.collection("dadosEstados").document(nomesEstadosFirebase[i])
    doc_ref.set(doc_data)
    print(f"Documento {nomesEstadosBrasil[i]} criado com sucesso no Firestore")
