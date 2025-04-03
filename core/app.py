from flask import Flask, render_template, request, jsonify, abort
import json
import os
import initilise_vectorstore
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.prompts.chat import SystemMessagePromptTemplate
from langchain_core.messages.human import HumanMessage
import json
import chromadb
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

prompt_extract_template = SystemMessagePromptTemplate.from_template(
"""
### INSTRUCTION:
Given below is information extracted from the career's page of a website featuring a job posting.
Extract the necessary details from the text as per the output structure.

### OUTPUT STRUCTURE:
- Only output whats necessary, dont say anything else apart from ffour feilds provided below.
- Output must be a string which can be parsed into a valid JSON object.
- No preamble.
- Must contain role, experience, skills and description.

### SCRAPED TEXT FROM WEBSITE:
{page_data}
"""
)


prompt_modify_email_template = SystemMessagePromptTemplate.from_template(
"""

You are a professional email editor specializing in sales communication.
Your expertise lies in modifying emails to improve clarity, persuasiveness, and professionalism.

Ensure the email follows a professional structure:
- A concise and engaging subject line.
- A clear, persuasive body with a strong call to action or purpose.

Given below is email. Modify it strictly according to user needs.
Don't add anything unnessary.
{email}

### NOTE:
Do not provide a preamble.
Keep a professional tone through-out the conversation.

### OUTPUT FORMAT:
Ensure the output is a JSON stringified object containing only two fields: "subject" and "body".
No extra quotes, newlines, or characters are allowed outside the JSON format. It must be directly parsable by `JSON.loads()`.
"""
)

email_prompt_template = SystemMessagePromptTemplate.from_template(
"""
### INSTRUCTION:
You are 'Lukesh Patil', a business development executive at 'Angular Minds'. 'Angular Minds' is an AI & Software Consulting company dedicated to facilitating the seamless integration of business processes through automated tools. 
Over our experience, we have empowered numerous enterprises with tailored solutions, fostering scalability, process optimization, cost reduction, and heightened overall efficiency.

Write a cold email to the {client} regarding the job mentioned above describing the capability of 'Angular Minds' in fulfilling their needs.
Also add the most relevant ones from the following links to showcase 'Angular Minds's' portfolio:
{link_list}

### JOB DESCRIPTION:
{job_description}

### NOTE:
Remember you are 'Lukesh', BDE at 'Angular Minds'.
Do not provide a preamble.
Keep a professional tone through-out the conversation.
Keep the email short and sweet compramising of about 300 words.
### EMAIL (NO PREAMBLE):

### OUTPUT FORMAT:
valid JSON object in stringified format containig only two feilds
subject: string,
body: string
Don't include unnecessary quotes, new line characters or anything else
The JSON object should be parsable by JSON.loads()
"""
)

app = Flask(__name__)

llm = ChatGroq(
    model=os.getenv("GROQ_DEPLOYMENT_NAME"),
    api_key = os.getenv("GROQ_API_KEY"),
    temperature=0,
)

from initilise_vectorstore import embedding_function
chroma_client = chromadb.PersistentClient()
chroma_collection = chroma_client.get_collection("my_collection",embedding_function=embedding_function)


def extract_job_description(link,client):
    loader = WebBaseLoader(link)
    data = loader.load()

    prompt_extract = prompt_extract_template.format(page_data=data)
    job_description = llm.invoke([
        prompt_extract
    ]).content

    job_description = json.loads(job_description)
    job_description['client'] = client

    return job_description


def generate_email(link,client):
    job_description = extract_job_description(link,client)
    # print(job_description)

    query_context = ','.join(job_description['skills'])
    results = chroma_collection.query(
        query_texts=[query_context],
        n_results=2
    )

    links = []
    for metadata in results["metadatas"][0]:
        links.append(metadata['link'])

    email_prompt = email_prompt_template.format(client=job_description['client'],job_description=job_description['description'],link_list="\n".join(links))
    email = llm.invoke([email_prompt]).content
    email = json.loads(email)

    return email


def modifyEmail(email,userPrompt):
    prompt_modify_email = prompt_modify_email_template.format(email=email)
    modified_email = llm.invoke([
        prompt_modify_email,
        HumanMessage(content=userPrompt)
    ]).content

    modified_email = json.loads(modified_email)
    return modified_email


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chats', methods=['POST'])
def submit():
    requestBody = request.get_json()
    client = requestBody.get('client')
    link = requestBody.get('link')

    email = generate_email(link,client)
    return json.dumps({
        "message": "This is from python erver",
        "email": email
    })

@app.route('/chats/', methods=['PATCH'])
def chatWithBot():
    oldEmail = request.get_json().get('email')
    userPrompt = request.get_json().get('userPrompt')

    responseEmail = modifyEmail(oldEmail,userPrompt)
    return json.dumps({
        "email": responseEmail,
        "message": "Email modified",
        "description": "The modified email is send in 'email' feild of the response"
    })





VALID_TOKENS = ["HzJ14s^kfC4$|fkE$]A8Er61TrlI6db9", "Pp!0w8xCMcAH27Y55Io+*^NAD\\q;£8X;"]

# Token verification function
def verify_token(authorization: str):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer" or token not in VALID_TOKENS:
            abort(401, description="Invalid or missing token")
    except ValueError:
        abort(401, description="Invalid Authorization header format")

# Route for handling the query
@app.route("/query", methods=["POST"])
def query_endpoint():
    # Extract the Authorization header
    authorization = request.headers.get("Authorization")
    if not authorization:
        abort(401, description="Authorization header missing")

    # Verify the token
    verify_token(authorization)

    # Get JSON data from the request body
    query_data = request.get_json()
    if not query_data or "query_text" not in query_data:
        abort(400, description="Missing 'query_text' in request")

    # Process the query
    query_text = query_data["query_text"]
    # For now, just returning a placeholder response
    return jsonify({"response": "ai response"})






if __name__ == '__main__':
    app.run(port=5000,debug=True)