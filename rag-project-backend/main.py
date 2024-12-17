from flask import Flask, request
from pinecone import Pinecone, ServerlessSpec
import time
import ast
from flask_cors import CORS, cross_origin
import chunking
import vdb
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

pinecone_key = os.getenv("PINECONE_KEY")
pc = Pinecone(api_key=pinecone_key)
index_name = os.getenv("PINECONE_INDEX_NAME")
index = pc.Index(index_name)

chat = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name="mixtral-8x7b-32768")

app  = Flask(__name__)
cors = CORS(app) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/", methods=["GET","POST"])
@cross_origin()
def hello_world():
    return (index.describe_index_stats().to_dict())


@app.route("/file_upload", methods=["POST"])
@cross_origin()
def file_up():
    if request.method == "POST":

        print(request.files)
        f = request.files['file']
        f.save('received_files/'+f.filename)
        vdb.upsert(f.filename)
        print('done upserting'+f.filename)
    return "file received!"

@app.route("/file_delete", methods=["GET"])
@cross_origin()
def file_del():
    if request.method == "GET":
        try:
            vdb.dele(request.args.get('name'))
            return request.args.get('name')+" deleted"
        except:
            return "error deleting" + request.args.get('name')

@app.route("/list_file", methods=["GET"])
@cross_origin()
def get_history():
    if request.method == "GET":
        list_file = vdb.get_list_files()
        print(list_file)
        return list_file

@app.route("/chat", methods=["GET"])
@cross_origin()
def reply():
    if request.method == "GET":
        history, question = str(request.args.get('history')).split('<|question|>')
        context = vdb.query(question, history)
        system = """You are a helpful assistant for question-answering tasks. Using the information contained in the context, give a comprehensive answer to the question.
        Only when asked a question, respond to the question asked, response should be short, concise and relevant to the question.
        If the answer cannot be deduced from the context, do not give an answer.
        Here is the history of the conversation that you are having with the human user.
        History: {history}
        Context: {context}
        Now here is the question you need to answer using the information contained in the context."""
        human = "{question}"
        system = system.format(context=context, history="")
        prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

        chain = prompt | chat
        rep = chain.invoke({"question": question})
        return rep.content


@app.route("/history", methods=["GET"])
@cross_origin()
def file_get():
    if request.method == "GET":
        his = vdb.get_history()
        return his


if __name__ == "__main__":
    app.run()