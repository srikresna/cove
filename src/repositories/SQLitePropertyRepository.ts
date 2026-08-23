import {
  isPropertyType,
  isPropertyVisibility,
  type PropertyDefinition,
  type PropertyOption,
} from "../domain/property/Property";
import { toPersistenceError } from "../errors/errorMappers";
import type {
  IPropertyRepository,
  NotePropertyRecord,
  OptionDeletionWrite,
  PropertyDefinitionPatch,
} from "./IPropertyRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

function parseOptions(json: unknown): PropertyOption[] {
  try {
    const parsed = JSON.parse(String(json ?? "[]")) as unknown;
    return Array.isArray(parsed) ? (parsed as PropertyOption[]) : [];
  } catch {
    return [];
  }
}

function rowToDefinition(row: Record<string, unknown>): PropertyDefinition | null {
  const type = String(row.type);
  if (!isPropertyType(type)) return null;
  const show = String(row.show ?? "");
  return {
    id: String(row.id),
    name: String(row.name),
    type,
    options: parseOptions(row.optionsJson),
    createdAt: Number(row.createdAt),
    order: String(row.orderIndex ?? ""),
    show: isPropertyVisibility(show) ? show : "always-show",
    icon: row.icon != null ? String(row.icon) : null,
  };
}

export class SQLitePropertyRepository implements IPropertyRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async listDefinitions(): Promise<PropertyDefinition[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, name, type, optionsJson, createdAt, orderIndex, show, icon FROM property_defs ORDER BY orderIndex, createdAt, id",
      );
      return rows.map(rowToDefinition).filter((d): d is PropertyDefinition => d !== null);
    } catch (err) {
      throw toPersistenceError("properties.listDefinitions", err);
    }
  }

  async createDefinition(def: PropertyDefinition): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO property_defs (id, name, type, optionsJson, createdAt, orderIndex, show, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          def.id,
          def.name,
          def.type,
          JSON.stringify(def.options),
          def.createdAt,
          def.order,
          def.show,
          def.icon,
        ],
      );
    } catch (err) {
      throw toPersistenceError("properties.createDefinition", err);
    }
  }

  async updateDefinition(id: string, patch: PropertyDefinitionPatch): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (patch.name !== undefined) {
      sets.push("name = ?");
      params.push(patch.name);
    }
    if (patch.show !== undefined) {
      sets.push("show = ?");
      params.push(patch.show);
    }
    if (patch.orderIndex !== undefined) {
      sets.push("orderIndex = ?");
      params.push(patch.orderIndex);
    }
    if (patch.icon !== undefined) {
      sets.push("icon = ?");
      params.push(patch.icon);
    }
    if (sets.length === 0) return;
    try {
      const db = await this.getDb();
      await db.execute(`UPDATE property_defs SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);
    } catch (err) {
      throw toPersistenceError("properties.updateDefinition", err);
    }
  }

  async updateOptions(id: string, optionsJson: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE property_defs SET optionsJson = ? WHERE id = ?", [optionsJson, id]);
    } catch (err) {
      throw toPersistenceError("properties.updateOptions", err);
    }
  }

  async appendOption(id: string, optionJson: string): Promise<void> {
    try {
      const db = await this.getDb();

      await db.execute(
        "UPDATE property_defs SET optionsJson = json_insert(optionsJson, '$[#]', json(?)) WHERE id = ?",
        [optionJson, id],
      );
    } catch (err) {
      throw toPersistenceError("properties.appendOption", err);
    }
  }

  async deleteDefinition(id: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM note_properties WHERE propertyId = ?", params: [id] },
        { sql: "DELETE FROM property_defs WHERE id = ?", params: [id] },
      ]);
    } catch (err) {
      throw toPersistenceError("properties.deleteDefinition", err);
    }
  }

  async applyOptionDeletion(
    definitionId: string,
    optionsJson: string | null,
    writes: OptionDeletionWrite[],
  ): Promise<void> {
    const statements = [
      ...(optionsJson !== null
        ? [
            {
              sql: "UPDATE property_defs SET optionsJson = ? WHERE id = ?",
              params: [optionsJson, definitionId],
            },
          ]
        : []),
      ...writes.map((write) =>
        write.valueJson === null
          ? {
              sql: "DELETE FROM note_properties WHERE noteId = ? AND propertyId = ?",
              params: [write.noteId, definitionId],
            }
          : {
              sql: "INSERT INTO note_properties (noteId, propertyId, valueJson) VALUES (?, ?, ?) ON CONFLICT(noteId, propertyId) DO UPDATE SET valueJson = excluded.valueJson",
              params: [write.noteId, definitionId, write.valueJson],
            },
      ),
    ];
    if (statements.length === 0) return;
    try {
      await SQLiteDatabase.runTransaction(statements);
    } catch (err) {
      throw toPersistenceError("properties.applyOptionDeletion", err);
    }
  }

  async valuesForNote(noteId: string): Promise<NotePropertyRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT noteId, propertyId, valueJson FROM note_properties WHERE noteId = ?",
        [noteId],
      );
      return rows.map((row) => ({
        noteId: String(row.noteId),
        propertyId: String(row.propertyId),
        valueJson: String(row.valueJson),
      }));
    } catch (err) {
      throw toPersistenceError("properties.valuesForNote", err);
    }
  }

  async valuesForPropertyAll(propertyId: string): Promise<NotePropertyRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT noteId, propertyId, valueJson FROM note_properties WHERE propertyId = ?",
        [propertyId],
      );
      return rows.map((row) => ({
        noteId: String(row.noteId),
        propertyId: String(row.propertyId),
        valueJson: String(row.valueJson),
      }));
    } catch (err) {
      throw toPersistenceError("properties.valuesForPropertyAll", err);
    }
  }

  async setValue(noteId: string, propertyId: string, valueJson: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO note_properties (noteId, propertyId, valueJson) VALUES (?, ?, ?) ON CONFLICT(noteId, propertyId) DO UPDATE SET valueJson = excluded.valueJson",
        [noteId, propertyId, valueJson],
      );
    } catch (err) {
      throw toPersistenceError("properties.setValue", err);
    }
  }

  async removeValue(noteId: string, propertyId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM note_properties WHERE noteId = ? AND propertyId = ?", [
        noteId,
        propertyId,
      ]);
    } catch (err) {
      throw toPersistenceError("properties.removeValue", err);
    }
  }
}
