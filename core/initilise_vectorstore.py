import pandas as pd
import chromadb
import os
from langchain_openai import AzureOpenAIEmbeddings
from dotenv import load_dotenv
load_dotenv()


embeddings = AzureOpenAIEmbeddings(
    model = "am-text-embedding-ada-002",
    azure_endpoint = "https://am-open-ai.openai.azure.com/",
    api_key = os.getenv("AZURE_OPENAI_API_KEY"),
    openai_api_version = "2024-02-01"
)

chroma_client = chromadb.PersistentClient()
existing_collections = [col.name for col in chroma_client.list_collections()]

class ChromaEmbeddingFunction:
    def __init__(self, embeddings):
        self.embeddings = embeddings

    def __call__(self, input):
        return self.embeddings.embed_documents(input)

embedding_function = ChromaEmbeddingFunction(embeddings)

def populate_database(collection):
    print("This excuted")
    df = pd.read_csv("./Resources/my_portfolio.csv")
    for index, row in df.iterrows():
        collection.add(
            documents = [row['Techstack']],
            metadatas = [{"link": row['Links']}],
            ids = [str(index)]
        )

collection = None
if "my_collection" not in existing_collections:
    new_collection = chroma_client.create_collection(name="my_collection",embedding_function=embedding_function)
    populate_database(new_collection)

collection = chroma_client.get_collection("my_collection",embedding_function=embedding_function)

print("Entries in collection:",collection.count())