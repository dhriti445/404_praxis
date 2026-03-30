import argparse
import os
import tempfile
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

os.environ.setdefault("USER_AGENT", USER_AGENT)

from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    parsed = parsed._replace(fragment="")
    return urlunparse(parsed)


def is_same_domain(a: str, b: str) -> bool:
    return urlparse(a).netloc == urlparse(b).netloc


def fetch_html(url: str) -> str:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    response.raise_for_status()
    return response.text


def extract_links(url: str) -> list[str]:
    html = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")
    links = []
    seen = set()

    for tag in soup.find_all("a", href=True):
        candidate = normalize_url(urljoin(url, tag["href"]))
        if candidate.startswith("http") and candidate not in seen:
            seen.add(candidate)
            links.append(candidate)

    return links


def crawl_meity_documents(start_page: int = 1, end_page: int = 5) -> tuple[list[str], list[str]]:
    base = "https://www.meity.gov.in/documents?page="
    page_urls = [f"{base}{i}" for i in range(start_page, end_page + 1)]

    html_urls = []
    pdf_urls = []
    seen = set()

    for page_url in page_urls:
        try:
            links = extract_links(page_url)
        except Exception as exc:
            print(f"[warn] MeitY page crawl failed: {page_url} ({exc})")
            continue

        html_urls.append(page_url)

        for link in links:
            if link in seen:
                continue
            seen.add(link)

            if link.lower().endswith(".pdf"):
                pdf_urls.append(link)
            elif is_same_domain(page_url, link):
                html_urls.append(link)

    return sorted(set(html_urls)), sorted(set(pdf_urls))


def crawl_internal_site(start_url: str, max_pages: int = 50) -> tuple[list[str], list[str]]:
    queue = [normalize_url(start_url)]
    seen = set()
    html_urls = []
    pdf_urls = []

    while queue and len(seen) < max_pages:
        current = queue.pop(0)
        if current in seen:
            continue
        seen.add(current)

        html_urls.append(current)

        try:
            links = extract_links(current)
        except Exception as exc:
            print(f"[warn] EU crawl failed: {current} ({exc})")
            continue

        for link in links:
            if link in seen:
                continue
            if link.lower().endswith(".pdf"):
                pdf_urls.append(link)
            elif is_same_domain(start_url, link):
                queue.append(link)

    return sorted(set(html_urls)), sorted(set(pdf_urls))


def load_html_docs(urls: list[str], source: str):
    docs = []
    for url in urls:
        try:
            loader = WebBaseLoader(url)
            loaded = loader.load()
            for doc in loaded:
                doc.metadata["source"] = source
                doc.metadata["url"] = url
            docs.extend(loaded)
        except Exception as exc:
            print(f"[warn] Failed WebBaseLoader for {url}: {exc}")
    return docs


def load_pdf_docs(urls: list[str], source: str):
    docs = []
    for pdf_url in urls:
        try:
            response = requests.get(pdf_url, headers={"User-Agent": USER_AGENT}, timeout=60)
            response.raise_for_status()

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
                tmp.write(response.content)
                tmp.flush()
                loader = PyPDFLoader(tmp.name)
                loaded = loader.load()
                for doc in loaded:
                    doc.metadata["source"] = source
                    doc.metadata["url"] = pdf_url
                docs.extend(loaded)
        except Exception as exc:
            print(f"[warn] Failed PDF load for {pdf_url}: {exc}")
    return docs


def get_embeddings(provider: str, openai_api_key: str):
    if provider == "openai":
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI embeddings")
        return OpenAIEmbeddings(api_key=openai_api_key)

    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build FAISS index using LangChain")
    parser.add_argument("--meity-start-page", type=int, default=1)
    parser.add_argument("--meity-end-page", type=int, default=5)
    parser.add_argument("--eu-url", default="https://data-act-law.eu/")
    parser.add_argument("--eu-max-pages", type=int, default=50)
    parser.add_argument("--chunk-size", type=int, default=500)
    parser.add_argument("--chunk-overlap", type=int, default=50)
    parser.add_argument("--embeddings-provider", choices=["hf", "openai"], default="hf")
    parser.add_argument("--openai-api-key", default="")
    parser.add_argument("--out", default="rag/langchain_store")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    meity_html, meity_pdfs = crawl_meity_documents(
        start_page=args.meity_start_page,
        end_page=args.meity_end_page,
    )
    eu_html, eu_pdfs = crawl_internal_site(args.eu_url, max_pages=args.eu_max_pages)

    print(f"[info] MeitY HTML pages: {len(meity_html)}, PDFs: {len(meity_pdfs)}")
    print(f"[info] EU HTML pages: {len(eu_html)}, PDFs: {len(eu_pdfs)}")

    docs = []
    docs.extend(load_html_docs(meity_html, source="meity"))
    docs.extend(load_pdf_docs(meity_pdfs, source="meity"))
    docs.extend(load_html_docs(eu_html, source="eu"))
    docs.extend(load_pdf_docs(eu_pdfs, source="eu"))

    if not docs:
        raise RuntimeError("No documents loaded. Check crawling or connectivity.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
    )
    chunks = splitter.split_documents(docs)

    if not chunks:
        raise RuntimeError("No chunks generated after splitting.")

    # Attach source tag if missing, as requested.
    for chunk in chunks:
        chunk.metadata["source"] = chunk.metadata.get("source", "unknown")

    embeddings = get_embeddings(args.embeddings_provider, args.openai_api_key)
    db = FAISS.from_documents(chunks, embeddings)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    db.save_local(str(out_dir))

    print(f"[ok] LangChain FAISS store saved to: {out_dir}")
    print(f"[ok] Total chunks stored: {len(chunks)}")


if __name__ == "__main__":
    main()
