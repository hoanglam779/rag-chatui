from pinecone import Pinecone, ServerlessSpec
import time
import chunking
import vdb

# vdb.dele("Don tu nguyen.docx")
# vdb.upsert("Don tu nguyen.docx")
print( vdb.query("Requirements for TTW 3.3 Scrap-it mod", "") )



# pinecone_key = "pcsk_4T8Ebs_JYdT981ZaxMyMtRP9sTccfhHUkokfR9MFpmzZb8ypGjwgtYoBCCTf64JNfee7Hp"
#
# pc = Pinecone(api_key=pinecone_key)
# index_name = "quickstart"
# # Wait for the index to be ready
# while not pc.describe_index(index_name).status['ready']:
#     time.sleep(1)
#
# index = pc.Index(index_name)
# print(index.describe_index_stats())

# for ids in index.list(prefix='vec', namespace='ns1'):
#   print(ids) # ['doc1#chunk1', 'doc1#chunk2', 'doc1#chunk3']
#   index.delete(ids=ids, namespace='ns1')


# query = "Tell me about the tech company known as Apple."
#
# embedding = pc.inference.embed(
#     model="multilingual-e5-large",
#     inputs=[query],
#     parameters={
#         "input_type": "query"
#     }
# )
#
# results = index.query(
#     namespace="ns1",
#     vector=embedding[0].values,
#     top_k=3,
#     include_values=False,
#     include_metadata=True
# )
#
#
# print(results.matches)
# print()
#
# list_k_text = [text['metadata']['text'] for text in results.matches]
# print(list_k_text)