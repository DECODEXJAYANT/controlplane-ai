import json
import sqlite3
from datetime import datetime, timezone
from typing import Any

from app.db.database import get_connection


class AuditService:

    def record(
        self,
        application: str,
        response: str,
        analysis: dict[str, Any],
        risk: dict[str, Any],
        consequence: dict[str, Any],
        decision: dict[str, Any],
    ) -> dict[str, Any]:

        timestamp = datetime.now(timezone.utc).isoformat()

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO audit_records (
                    timestamp,
                    application,
                    response,
                    analysis,
                    risk,
                    consequence,
                    decision
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    timestamp,
                    application,
                    response,
                    json.dumps(analysis),
                    json.dumps(risk),
                    json.dumps(consequence),
                    json.dumps(decision),
                ),
            )

            connection.commit()

            record_id = cursor.lastrowid

        finally:
            connection.close()

        return {
            "id": record_id,
            "timestamp": timestamp,
            "application": application,
            "response": response,
            "analysis": analysis,
            "risk": risk,
            "consequence": consequence,
            "decision": decision,
        }

    def list_records(self) -> list[dict[str, Any]]:

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT *
                FROM audit_records
                ORDER BY id DESC
                """
            ).fetchall()

        finally:
            connection.close()

        return [
            self._deserialize(row)
            for row in rows
        ]

    def get_record(
        self,
        record_id: int,
    ) -> dict[str, Any] | None:

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT *
                FROM audit_records
                WHERE id = ?
                """,
                (record_id,),
            ).fetchone()

        finally:
            connection.close()

        if row is None:
            return None

        return self._deserialize(row)

    @staticmethod
    def _deserialize(
        row: sqlite3.Row,
    ) -> dict[str, Any]:

        return {
            "id": row["id"],
            "timestamp": row["timestamp"],
            "application": row["application"],
            "response": row["response"],
            "analysis": json.loads(row["analysis"]),
            "risk": json.loads(row["risk"]),
            "consequence": json.loads(row["consequence"]),
            "decision": json.loads(row["decision"]),
        }