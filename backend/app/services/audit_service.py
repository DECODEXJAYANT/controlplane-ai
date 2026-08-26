from datetime import datetime, timezone
from typing import Any


class AuditService:

    def __init__(self):
        self._records: list[dict[str, Any]] = []

    def record(
        self,
        application: str,
        response: str,
        analysis: dict[str, Any],
        risk: dict[str, Any],
        consequence: dict[str, Any],
        decision: dict[str, Any],
    ) -> dict[str, Any]:

        record = {
            "id": len(self._records) + 1,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "application": application,
            "response": response,
            "analysis": analysis,
            "risk": risk,
            "consequence": consequence,
            "decision": decision,
        }

        self._records.append(record)

        return record

    def list_records(self) -> list[dict[str, Any]]:
        return list(reversed(self._records))

    def get_record(self, record_id: int) -> dict[str, Any] | None:
        for record in self._records:
            if record["id"] == record_id:
                return record

        return None