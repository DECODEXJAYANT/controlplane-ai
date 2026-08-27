import json
import re
from pathlib import Path
from typing import Any


class KnowledgeBase:

    def __init__(self, data_path: str | None = None):

        if data_path:
            self.data_path = Path(data_path)
        else:
            self.data_path = (
                Path(__file__).resolve().parents[2]
                / "data"
                / "knowledge_base"
                / "financial_products.json"
            )

        self.documents = self._load()

    def _load(self) -> list[dict[str, Any]]:

        with self.data_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            return json.load(file)

    def search(self, query: str) -> list[dict[str, Any]]:

        query_words = self._normalize(query)

        results = []

        for document in self.documents:

            product = document.get(
                "product",
                "",
            )

            product_words = self._normalize(product)

            if not product_words:
                continue

            # A document is relevant when at least one
            # meaningful product term appears in the query.
            overlap = product_words.intersection(query_words)

            if overlap:
                results.append(document)

        return results

    def _normalize(self, text: str) -> set[str]:

        words = re.findall(
            r"[a-z0-9]+",
            text.lower(),
        )

        stop_words = {
            "the",
            "a",
            "an",
            "is",
            "are",
            "was",
            "were",
            "this",
            "that",
            "for",
            "of",
            "on",
            "to",
            "and",
            "with",
            "his",
            "her",
            "their",
            "customer",
            "customers",
        }

        return {
            word
            for word in words
            if word not in stop_words
        }

    def all_documents(self) -> list[dict[str, Any]]:
        return self.documents