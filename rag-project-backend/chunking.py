from langchain.text_splitter import RecursiveCharacterTextSplitter
import docx2txt
from langchain.docstore.document import Document as LangchainDocument
from typing import Optional, List, Tuple
from transformers import AutoTokenizer

def split_documents(
    chunk_size: int,
    # knowledge_base: List[LangchainDocument],
    filename: str,
    tokenizer_name: str,
) -> List[LangchainDocument]:
    """
    Split documents into chunks of size `chunk_size` characters and return a list of documents.
    """
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        AutoTokenizer.from_pretrained(tokenizer_name),
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size / 10),
        add_start_index=True,
        strip_whitespace=True,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    filename = 'received_files/'+filename
    text = docx2txt.process(filename)

    docs_processed = text_splitter.split_documents([LangchainDocument(page_content=text, meta={"filename": filename})])

    # Remove duplicates
    unique_texts = {}
    docs_processed_unique = []
    for doc in docs_processed:
        if doc.page_content not in unique_texts:
            unique_texts[doc.page_content] = True
            docs_processed_unique.append(doc)

    for i in docs_processed_unique:
        i.metadata['filename'] = filename.split('/')[-1]

    return docs_processed_unique

