import json
import os

from pinecone import Pinecone, ServerlessSpec
import time
import chunking
from dotenv import load_dotenv
import os

load_dotenv()

def upsert(filename):
    pinecone_key = os.getenv("PINECONE_KEY")
    pc = Pinecone(api_key=pinecone_key)
    index_name = "quickstart"
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    index = pc.Index(index_name)

    count = index.describe_index_stats()['total_vector_count']+1

    data = []
    chunks = chunking.split_documents(chunk_size=200, filename=filename, tokenizer_name="thenlper/gte-small")#"distilbert-base-uncased")
    os.remove("received_files/"+filename)
    for i in chunks:
        data.append({"id": filename +'*'+str(count), "text": i.page_content})
        count += 1

    print(data)

    embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[d['text'] for d in data],
        parameters={"input_type": "passage", "truncate": "END"}
    )

    vectors = []
    for d, e in zip(data, embeddings):
        vectors.append({
            "id": d['id'],
            "values": e['values'],
            "metadata": {'text': d['text'], 'filename': filename}
        })

    index.upsert(
        vectors=vectors,
        namespace=os.getenv("PINECONE_NAMESPACE")
    )

def dele(filename):
    pinecone_key = os.getenv("PINECONE_KEY")
    pc = Pinecone(api_key=pinecone_key)
    index_name = os.getenv("PINECONE_INDEX_NAME")
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    index = pc.Index(index_name)

    for ids in index.list(prefix=filename, namespace='ns1'):
      index.delete(ids=ids, namespace='ns1')

def get_list_files():
    pinecone_key = os.getenv("PINECONE_KEY")
    pc = Pinecone(api_key=pinecone_key)
    index_name = os.getenv("PINECONE_INDEX_NAME")
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    index = pc.Index(index_name)

    unique_texts = {}
    files_unique = []
    for ids in index.list(namespace=os.getenv("PINECONE_NAMESPACE")):
        for id in ids:
            filename = id.split('*')[0]
            # print(filename)
            if filename not in unique_texts:
                unique_texts[filename] = True
                files_unique.append(filename)
    return files_unique

def query(question, history):
    pinecone_key = os.getenv("PINECONE_KEY")
    pc = Pinecone(api_key=pinecone_key)
    index_name = os.getenv("PINECONE_INDEX_NAME")
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    index = pc.Index(index_name)

    def search(qtext, pc, index):
        query_embedding = pc.inference.embed(
            model="multilingual-e5-large",
            inputs=[qtext],
            parameters={
                "input_type": "query"
            }
        )
        return index.query(
            namespace=os.getenv("PINECONE_NAMESPACE"),
            vector=query_embedding[0].values,
            top_k=3,
            include_values=False,
            include_metadata=True
        )
    results = search(question, pc, index)
    print(results)
    results2 = results
    max_score = 0
    try:
        max_score = max([i.score for i in results.matches])
        if max_score < 0.85:
            results2 = search(history, pc, index)
            print("results2", results2)
    except:
        1
    try:
        if max([i.score for i in results2.matches]) < max_score-0.2:
            results2 = results
    except:
        1
    context = ""
    for i in results2.matches:
        context += i.metadata.get('text') + ' '
    # print(context)
    return context
def get_history():
    dic = [
    {
      "type": 'text',
      'content': { 'text': 'history' },
    }
  ]
    return json.dumps(dic)
