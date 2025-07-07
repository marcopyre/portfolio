from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.llms import HuggingFacePipeline

from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# 1. Charger des documents
loader = TextLoader("data/knowledge_base.txt", encoding='utf-8')
docs = loader.load()

# 2. Split des documents
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
documents = text_splitter.split_documents(docs)

# 3. Création des embeddings
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 4. Indexation avec FAISS
vectordb = FAISS.from_documents(documents, embedding_model)

# 5. Chargement du modèle Hugging Face (Gemma 2)
model_id = "google/gemma-2b-it"  # ou un autre modèle local
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto", torch_dtype="auto")

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=512,
    temperature=0.7,
    top_p=0.95,
    repetition_penalty=1.1
)

llm = HuggingFacePipeline(pipeline=pipe)

# 6. Construire la chaîne RAG
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",  # tu peux aussi tester "map_reduce" ou "refine"
    retriever=vectordb.as_retriever()
)

# 7. Utiliser le RAG
query = "tu fait du sport ?"
response = qa_chain.run(query)
print("Réponse :", response)
