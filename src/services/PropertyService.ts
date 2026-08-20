import { NotFoundError } from "../domain/errors";
import {
  DEFAULT_STATUS_OPTIONS,
  deserializePropertyValue,
  hasOptions,
  makePropertyId,
  nextOptionColor,
  orderKeyBetween,
  type PropertyDefinition,
  type PropertyOption,
  type PropertyType,
  type PropertyValue,
  type PropertyVisibility,
  serializePropertyValue,
} from "../domain/property/Property";
import { ValidationError } from "../errors/AppError";
import type { IPropertyRepository } from "../repositories/IPropertyRepository";
import type { IPropertyService } from "./IPropertyService";
import { Logger } from "./Logger";

function normalizePropertyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export class PropertyService implements IPropertyService {
  constructor(private readonly properties: IPropertyRepository) {}

  listDefinitions(): Promise<PropertyDefinition[]> {
    return this.properties.listDefinitions();
  }

  async createDefinition(name: string, type: PropertyType): Promise<PropertyDefinition> {
    const normalized = normalizePropertyName(name);
    if (!normalized) throw new ValidationError("Property name cannot be empty.");

    const existing = await this.properties.listDefinitions();
    const duplicate = existing.find((d) => d.name.toLowerCase() === normalized.toLowerCase());
    if (duplicate) throw new ValidationError("A property with this name already exists.");

    const options: PropertyOption[] =
      type === "status"
        ? DEFAULT_STATUS_OPTIONS.map((label, index) => ({
            id: makePropertyId(),
            name: label,
            color: nextOptionColor(index),
          }))
        : [];
    const lastDef = existing[existing.length - 1];
    const lastOrder = lastDef ? lastDef.order : null;
    const def: PropertyDefinition = {
      id: makePropertyId(),
      name: normalized,
      type,
      options,
      createdAt: Date.now(),
      order: orderKeyBetween(lastOrder, null),
      // New properties stay out of the way until they carry a value.
      show: "hide-when-empty",
    };
    await this.properties.createDefinition(def);
    return def;
  }

  async renameDefinition(id: string, name: string): Promise<void> {
    const normalized = normalizePropertyName(name);
    if (!normalized) throw new ValidationError("Property name cannot be empty.");

    const existing = await this.properties.listDefinitions();
    if (!existing.some((d) => d.id === id)) throw new NotFoundError("Property", id);
    const duplicate = existing.find(
      (d) => d.id !== id && d.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (duplicate) throw new ValidationError("A property with this name already exists.");

    await this.properties.updateDefinition(id, { name: normalized });
  }

  async setDefinitionVisibility(id: string, show: PropertyVisibility): Promise<void> {
    const existing = await this.properties.listDefinitions();
    if (!existing.some((d) => d.id === id)) throw new NotFoundError("Property", id);
    await this.properties.updateDefinition(id, { show });
  }

  async reorderDefinition(
    id: string,
    targetId: string,
    position: "before" | "after",
  ): Promise<void> {
    if (id === targetId) return;
    const sorted = await this.properties.listDefinitions();
    const currentIndex = sorted.findIndex((d) => d.id === id);
    if (currentIndex === -1) throw new NotFoundError("Property", id);

    // Compute the gap with the dragged definition removed: otherwise it can
    // become its own neighbor on the gap side, the key collapses onto a list
    // edge, and generateKeyBetween emits a duplicate of an existing key.
    const others = sorted.filter((d) => d.id !== id);
    const targetIndex = others.findIndex((d) => d.id === targetId);
    if (targetIndex === -1) throw new NotFoundError("Property", targetId);

    const insertAt = position === "before" ? targetIndex : targetIndex + 1;
    if (insertAt === currentIndex) return; // already in place — nothing to write

    const beforeDef = position === "before" ? others[targetIndex - 1] : others[targetIndex];
    const afterDef = position === "before" ? others[targetIndex] : others[targetIndex + 1];

    await this.properties.updateDefinition(id, {
      orderIndex: orderKeyBetween(beforeDef?.order ?? null, afterDef?.order ?? null),
    });
  }

  deleteDefinition(id: string): Promise<void> {
    return this.properties.deleteDefinition(id);
  }

  async addOption(definitionId: string, name: string): Promise<PropertyOption> {
    const normalized = normalizePropertyName(name);
    if (!normalized) throw new ValidationError("Option name cannot be empty.");

    const def = (await this.properties.listDefinitions()).find((d) => d.id === definitionId);
    if (!def) throw new NotFoundError("Property", definitionId);
    if (!hasOptions(def.type)) {
      throw new ValidationError("This property type does not take options.");
    }

    const existing = def.options.find((o) => o.name.toLowerCase() === normalized.toLowerCase());
    if (existing) return existing;

    const option: PropertyOption = {
      id: makePropertyId(),
      name: normalized,
      color: nextOptionColor(def.options.length),
    };
    await this.properties.appendOption(definitionId, JSON.stringify(option));
    return option;
  }

  async valuesForNote(noteId: string): Promise<Map<string, PropertyValue>> {
    const [definitions, records] = await Promise.all([
      this.properties.listDefinitions(),
      this.properties.valuesForNote(noteId),
    ]);
    const typeById = new Map(definitions.map((d) => [d.id, d.type]));
    const values = new Map<string, PropertyValue>();
    for (const record of records) {
      const type = typeById.get(record.propertyId);
      if (!type) continue;
      const value = deserializePropertyValue(record.valueJson, type);
      if (value) {
        values.set(record.propertyId, value);
      } else {
        Logger.warn("property: dropped undecodable value", undefined, {
          noteId,
          propertyId: record.propertyId,
        });
      }
    }
    return values;
  }

  async setValue(noteId: string, propertyId: string, value: PropertyValue): Promise<void> {
    await this.properties.setValue(noteId, propertyId, serializePropertyValue(value));
  }

  removeValue(noteId: string, propertyId: string): Promise<void> {
    return this.properties.removeValue(noteId, propertyId);
  }
}
