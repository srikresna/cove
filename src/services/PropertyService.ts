import { NotFoundError } from "../domain/errors";
import {
  DEFAULT_STATUS_OPTIONS,
  deserializePropertyValue,
  hasOptions,
  makePropertyId,
  nextOptionColor,
  type PropertyDefinition,
  type PropertyOption,
  type PropertyType,
  type PropertyValue,
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

    const duplicate = (await this.properties.listDefinitions()).find(
      (d) => d.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (duplicate) throw new ValidationError("A property with this name already exists.");

    const options: PropertyOption[] =
      type === "status"
        ? DEFAULT_STATUS_OPTIONS.map((label, index) => ({
            id: makePropertyId(),
            name: label,
            color: nextOptionColor(index),
          }))
        : [];
    const def: PropertyDefinition = {
      id: makePropertyId(),
      name: normalized,
      type,
      options,
      createdAt: Date.now(),
    };
    await this.properties.createDefinition(def);
    return def;
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
