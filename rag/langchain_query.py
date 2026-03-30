import argparse

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


def get_embeddings(provider: str, openai_api_key: str):
    if provider == "openai":
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI embeddings")
        return OpenAIEmbeddings(api_key=openai_api_key)

    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def get_llm(provider: str, openai_api_key: str, gemini_api_key: str):
    if provider == "openai":
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI LLM")
        return ChatOpenAI(api_key=openai_api_key)

    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY is required for Gemini LLM")

    # Lazy import keeps script usable even when Gemini package is not installed.
    try:
                from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError as exc:
                raise RuntimeError(
                        "langchain-google-genai is not installed for Gemini mode. "
                        "Run: pip install langchain-google-genai"
                ) from exc

    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=gemini_api_key,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run LangChain RetrievalQA over local FAISS")
    parser.add_argument("query", help="Question to ask")
    parser.add_argument("--store", default="rag/langchain_store")
    parser.add_argument("--embeddings-provider", choices=["hf", "openai"], default="hf")
    parser.add_argument("--llm-provider", choices=["gemini", "openai"], default="gemini")
    parser.add_argument("--openai-api-key", default="")
    parser.add_argument("--gemini-api-key", default="")
    parser.add_argument("--k", type=int, default=5)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    embeddings = get_embeddings(args.embeddings_provider, args.openai_api_key)
    db = FAISS.load_local(
        args.store,
        embeddings,
        allow_dangerous_deserialization=True,
    )

    docs = db.similarity_search(args.query, k=args.k)
    if not docs:
        print("No relevant context found in the vector store.")
        return

    context_blocks = []
    for idx, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "unknown")
        url = doc.metadata.get("url", "")
        context_blocks.append(
            f"Source {idx} ({source})\nURL: {url}\nText: {doc.page_content}"
        )

    context = "\n\n".join(context_blocks)

    llm = get_llm(args.llm_provider, args.openai_api_key, args.gemini_api_key)
    prompt = (
        "Answer only using the provided context. "
        "If context is insufficient, say so clearly.\n\n"
        f"Context:\n{context}\n\nQuestion: {args.query}"
    )

    response = llm.invoke(prompt)
    print(getattr(response, "content", str(response)))


if __name__ == "__main__":
    main()
