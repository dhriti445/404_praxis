# Legal RAG Pipeline

This folder contains a Python pipeline for:

1. Scraping legal websites (HTML + linked PDFs)
2. Cleaning and chunking text
3. Creating embeddings with Sentence Transformers
4. Building a FAISS vector index
5. Querying top relevant chunks

It now includes a LangChain implementation matching this architecture:

Web Loader -> Splitter -> Embeddings -> FAISS -> Retriever -> LLM -> Answer

Crawler behavior now follows the real integration flow:

1. MeitY crawl forces pages 1-5 by default:
	- https://www.meity.gov.in/documents?page=1 ... page=5
2. Extracts all anchor links from those pages.
3. Follows MeitY internal links and collects linked PDFs.
4. Downloads and parses PDF text via PyPDF2.
5. EU Data Act crawl starts at https://data-act-law.eu/ and follows internal links page-by-page.

## Install

```bash
pip install -r rag/requirements.txt
```

## LangChain Build (Recommended)

Build using WebBaseLoader + RecursiveCharacterTextSplitter + FAISS:

```bash
python rag/langchain_build_index.py
```

Options:

```bash
python rag/langchain_build_index.py --meity-start-page 1 --meity-end-page 5 --eu-max-pages 80 --chunk-size 500 --chunk-overlap 50 --embeddings-provider hf --out rag/langchain_store
```

OpenAI embeddings option:

```bash
python rag/langchain_build_index.py --embeddings-provider openai --openai-api-key YOUR_OPENAI_KEY
```

The builder also:

1. Crawls MeitY pages 1-5
2. Extracts links
3. Downloads/loads PDFs with PyPDFLoader
4. Crawls internal EU links
5. Adds chunk metadata source as meity/eu

## LangChain Query (RetrievalQA)

The query script uses FAISS similarity retrieval + `llm.invoke()` with context (instead of `RetrievalQA`) for better Python 3.14 compatibility.

Gemini option:

```bash
python rag/langchain_query.py "What is DPDP Act?" --llm-provider gemini --gemini-api-key YOUR_GEMINI_KEY
```

OpenAI option:

```bash
python rag/langchain_query.py "What is DPDP Act?" --llm-provider openai --openai-api-key YOUR_OPENAI_KEY
```

If you built index with OpenAI embeddings, pass --embeddings-provider openai and --openai-api-key while querying too.

Note: LangChain is more stable on Python 3.10/3.11. On Python 3.14, some old chain APIs can fail.

## Build Index

```bash
python rag/build_index.py
```

Optional example:

```bash
python rag/build_index.py --meity-start-page 1 --meity-end-page 5 --eu-max-pages 80 --chunk-size 500 --overlap 50
```

Outputs are written to:

- `rag/store/index.faiss`
- `rag/store/chunks.json`
- `rag/store/config.json`

## Query

```bash
python rag/query_index.py "What is data protection under DPDP?" --k 5
```

## Use with LLM

Take the returned chunks and pass them as context to Gemini/OpenAI prompt generation.

## Strict Source-Limited Chat Mode

Backend chat is now configured to answer only from the scraped chunk store:

- Required file: `rag/store/chunks.json`
- If missing: chatbot returns a setup message instead of a general answer.
- If query is out-of-scope: chatbot refuses and asks for source-based questions.

So after scraping, always run:

```bash
python rag/build_index.py
```
