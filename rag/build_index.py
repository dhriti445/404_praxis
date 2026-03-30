import argparse
import io
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import faiss
import numpy as np
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer


MEITY_DOCUMENTS_BASE_URL = "https://www.meity.gov.in/documents?page="
EU_DATA_ACT_START_URL = "https://data-act-law.eu/"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


def fetch_url(url: str, timeout: int = 30) -> requests.Response:
    headers = {"User-Agent": USER_AGENT}
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    return response


def clean_text(text: str) -> str:
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


def extract_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    paragraphs = soup.find_all("p")
    text = " ".join(p.get_text(" ", strip=True) for p in paragraphs)
    return clean_text(text)


def extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links = []
    seen = set()
    for tag in soup.find_all("a", href=True):
        href = tag["href"]
        absolute = normalize_url(urljoin(base_url, href))
        if absolute.startswith("http") and absolute not in seen:
            seen.add(absolute)
            links.append(absolute)
    return links


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        parts.append(page_text)
    return clean_text(" ".join(parts))


def scrape_page(url: str) -> tuple[str, list[str]]:
    response = fetch_url(url)

    content_type = (response.headers.get("Content-Type") or "").lower()
    if ".pdf" in url.lower() or "application/pdf" in content_type:
        text = extract_text_from_pdf_bytes(response.content)
        return text, []

    html = response.text
    text = extract_text_from_html(html)
    links = extract_links(html, url)
    return text, links


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    parsed = parsed._replace(fragment="")
    return urlunparse(parsed)


def is_same_domain(url_a: str, url_b: str) -> bool:
    return urlparse(url_a).netloc == urlparse(url_b).netloc


def crawl_internal_site(start_url: str, max_pages: int, max_links_per_page: int) -> list[dict]:
    docs = []
    seen = set()
    queue = [normalize_url(start_url)]

    while queue and len(seen) < max_pages:
        current = queue.pop(0)
        if current in seen:
            continue
        seen.add(current)

        try:
            text, links = scrape_page(current)
        except Exception as exc:
            print(f"[warn] failed to scrape {current}: {exc}")
            continue

        if text:
            docs.append({"url": current, "text": text})

        internal_links = []
        for link in links:
            if link in seen:
                continue
            if is_same_domain(start_url, link):
                internal_links.append(link)

        queue.extend(internal_links[:max_links_per_page])

    return docs


def crawl_meity_documents(
    start_page: int,
    end_page: int,
    max_links_per_page: int,
) -> list[dict]:
    docs = []
    seen_urls = set()
    pdf_links = set()

    for page_number in range(start_page, end_page + 1):
        page_url = f"{MEITY_DOCUMENTS_BASE_URL}{page_number}"
        page_url = normalize_url(page_url)

        try:
            page_text, links = scrape_page(page_url)
        except Exception as exc:
            print(f"[warn] failed to scrape {page_url}: {exc}")
            continue

        if page_text and page_url not in seen_urls:
            docs.append({"url": page_url, "text": page_text})
            seen_urls.add(page_url)

        # Step 1: extract all <a> links from each MeitY page.
        links = links[:max_links_per_page]
        detail_links = [link for link in links if is_same_domain(page_url, link)]

        for detail_url in detail_links:
            if detail_url in seen_urls:
                continue
            seen_urls.add(detail_url)

            try:
                detail_text, detail_links_2 = scrape_page(detail_url)
            except Exception as exc:
                print(f"[warn] failed to scrape {detail_url}: {exc}")
                continue

            if detail_text:
                docs.append({"url": detail_url, "text": detail_text})

            for candidate in detail_links_2:
                if candidate.lower().endswith(".pdf"):
                    pdf_links.add(candidate)

        for link in links:
            if link.lower().endswith(".pdf"):
                pdf_links.add(link)

    # Step 2: download and parse linked PDFs.
    for pdf_url in sorted(pdf_links):
        if pdf_url in seen_urls:
            continue
        seen_urls.add(pdf_url)
        try:
            pdf_text, _ = scrape_page(pdf_url)
        except Exception as exc:
            print(f"[warn] failed to scrape PDF {pdf_url}: {exc}")
            continue

        if pdf_text:
            docs.append({"url": pdf_url, "text": pdf_text})

    return docs


def gather_corpus_real(
    meity_start_page: int,
    meity_end_page: int,
    meity_max_links_per_page: int,
    eu_start_url: str,
    eu_max_pages: int,
    eu_max_links_per_page: int,
) -> list[dict]:
    docs = []

    meity_docs = crawl_meity_documents(
        start_page=meity_start_page,
        end_page=meity_end_page,
        max_links_per_page=meity_max_links_per_page,
    )
    print(f"[info] MeitY docs scraped: {len(meity_docs)}")
    docs.extend(meity_docs)

    eu_docs = crawl_internal_site(
        start_url=eu_start_url,
        max_pages=eu_max_pages,
        max_links_per_page=eu_max_links_per_page,
    )
    print(f"[info] EU docs scraped: {len(eu_docs)}")
    docs.extend(eu_docs)

    return docs


def build_index(
    docs: list[dict],
    model_name: str,
    chunk_size: int,
    overlap: int,
    out_dir: Path,
) -> None:
    all_chunks = []
    metadata = []

    for doc in docs:
        chunks = chunk_text(doc["text"], chunk_size=chunk_size, overlap=overlap)
        for chunk in chunks:
            all_chunks.append(chunk)
            metadata.append({"url": doc["url"], "text": chunk})

    if not all_chunks:
        raise RuntimeError("No chunks produced. Check source URLs or scraping filters.")

    print(f"[info] total chunks: {len(all_chunks)}")
    model = SentenceTransformer(model_name)
    embeddings = model.encode(all_chunks, show_progress_bar=True)
    embeddings = np.asarray(embeddings, dtype="float32")

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    out_dir.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(out_dir / "index.faiss"))

    with open(out_dir / "chunks.json", "w", encoding="utf-8") as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)

    with open(out_dir / "config.json", "w", encoding="utf-8") as handle:
        json.dump(
            {
                "model": model_name,
                "chunk_size": chunk_size,
                "overlap": overlap,
            },
            handle,
            indent=2,
        )

    print(f"[ok] index saved to: {out_dir}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build FAISS index from scraped legal sources")
    parser.add_argument("--meity-start-page", type=int, default=1)
    parser.add_argument("--meity-end-page", type=int, default=5)
    parser.add_argument("--meity-max-links-per-page", type=int, default=25)
    parser.add_argument("--eu-start-url", default=EU_DATA_ACT_START_URL)
    parser.add_argument("--eu-max-pages", type=int, default=50)
    parser.add_argument("--eu-max-links-per-page", type=int, default=30)
    parser.add_argument("--chunk-size", type=int, default=500)
    parser.add_argument("--overlap", type=int, default=50)
    parser.add_argument("--model", default="all-MiniLM-L6-v2")
    parser.add_argument("--out", default="rag/store")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    docs = gather_corpus_real(
        meity_start_page=args.meity_start_page,
        meity_end_page=args.meity_end_page,
        meity_max_links_per_page=args.meity_max_links_per_page,
        eu_start_url=args.eu_start_url,
        eu_max_pages=args.eu_max_pages,
        eu_max_links_per_page=args.eu_max_links_per_page,
    )

    print(f"[info] scraped docs: {len(docs)}")
    build_index(
        docs=docs,
        model_name=args.model,
        chunk_size=args.chunk_size,
        overlap=args.overlap,
        out_dir=Path(args.out),
    )


if __name__ == "__main__":
    main()
