import { NotFoundError } from "../domain/errors";
import {
  DEFAULT_STATUS_OPTIONS,
  deserializePropertyValue,
  hasOptions,
  isSystemPropertyId,
  JOURNAL_PROPERTY_ID,
  makePropertyId,
  nextOptionColor,
  orderKeyBetween,
  PROPERTY_ICON_NAMES,
  type PropertyDefinition,
  type PropertyOption,
  type PropertyType,
  type PropertyValue,
  type PropertyVisibility,
  SYSTEM_PROPERTY_TYPES,
  serializePropertyValue,
} from "../domain/property/Property";
import { ValidationError } from "../errors/AppError";
import type { IPropertyRepository, OptionDeletionWrite } from "../repositories/IPropertyRepository";
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
    if ((SYSTEM_PROPERTY_TYPES as readonly string[]).includes(type)) {
      throw new ValidationError("Built-in property types cannot be created.");
    }

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
      icon: null,
    };
    await this.properties.createDefinition(def);
    return def;
  }

  async setDefinitionIcon(id: string, icon: string | null): Promise<void> {
    if (isSystemPropertyId(id)) {
      throw new ValidationError("Built-in properties cannot be customized.");
    }
    if (icon !== null && !(PROPERTY_ICON_NAMES as readonly string[]).includes(icon)) {
      throw new ValidationError("Unknown property icon.");
    }
    await this.properties.updateDefinition(id, { icon });
  }

  async renameDefinition(id: string, name: string): Promise<void> {
    const normalized = normalizePropertyName(name);
    if (!normalized) throw new ValidationError("Property name cannot be empty.");
    if (isSystemPropertyId(id)) {
      throw new ValidationError("Built-in properties cannot be renamed.");
    }

    const existing = await this.properties.listDefinitions();
    if (!existing.some((d) => d.id === id)) throw new NotFoundError("Property", id);
    const duplicate = existing.find(
      (d) => d.id !== id && d.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (duplicate) throw new ValidationError("A property with this name already exists.");

    await this.properties.updateDefinition(id, { name: normalized });
  }

  async setDefinitionVisibility(id: string, show: PropertyVisibility): Promise<void> {
    if (
      isSystemPropertyId(id) &&
      id !== JOURNAL_PROPERTY_ID &&
      id !== "system:template" &&
      show === "hide-when-empty"
    ) {
      // Derived system values live outside note_properties, so "empty" never
      // resolves and the row could never come back. Value-backed rows
      // (journal, template) accept the full visibility range.
      throw new ValidationError("Built-in properties only support always-show or always-hide.");
    }
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
    if (insertAt === currentIndex) return;

    const beforeDef = position === "before" ? others[targetIndex - 1] : others[targetIndex];
    const afterDef = position === "before" ? others[targetIndex] : others[targetIndex + 1];

    await this.properties.updateDefinition(id, {
      orderIndex: orderKeyBetween(beforeDef?.order ?? null, afterDef?.order ?? null),
    });
  }

  deleteDefinition(id: string): Promise<void> {
    if (isSystemPropertyId(id)) {
      return Promise.reject(new ValidationError("Built-in properties cannot be deleted."));
    }
    return this.properties.deleteDefinition(id);
  }

  async addOption(definitionId: string, name: string, color?: string): Promise<PropertyOption> {
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
      color: color ?? nextOptionColor(def.options.length),
    };
    await this.properties.appendOption(definitionId, JSON.stringify(option));
    return option;
  }

  async renameOption(definitionId: string, optionId: string, name: string): Promise<void> {
    const normalized = normalizePropertyName(name);
    if (!normalized) throw new ValidationError("Option name cannot be empty.");
    const def = (await this.properties.listDefinitions()).find((d) => d.id === definitionId);
    if (!def) throw new NotFoundError("Property", definitionId);
    const option = def.options.find((o) => o.id === optionId);
    if (!option) throw new NotFoundError("Option", optionId);
    if (option.name.toLowerCase() === normalized.toLowerCase()) return;
    const duplicate = def.options.find(
      (o) => o.id !== optionId && o.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (duplicate) throw new ValidationError("An option with this name already exists.");
    await this.properties.updateOptions(
      definitionId,
      JSON.stringify(def.options.map((o) => (o.id === optionId ? { ...o, name: normalized } : o))),
    );
  }

  async setOptionColor(definitionId: string, optionId: string, color: string): Promise<void> {
    const def = (await this.properties.listDefinitions()).find((d) => d.id === definitionId);
    if (!def) throw new NotFoundError("Property", definitionId);
    const option = def.options.find((o) => o.id === optionId);
    if (!option) throw new NotFoundError("Option", optionId);
    await this.properties.updateOptions(
      definitionId,
      JSON.stringify(def.options.map((o) => (o.id === optionId ? { ...o, color } : o))),
    );
  }

  async deleteOption(definitionId: string, optionId: string): Promise<void> {
    const def = (await this.properties.listDefinitions()).find((d) => d.id === definitionId);
    if (!def) throw new NotFoundError("Property", definitionId);
    const hasOption = def.options.some((o) => o.id === optionId);
    // Sweep values referencing the option (select/status removed, multiSelect
    // drops the id) — else hide-when-empty rows render "Empty" with no way to clear.
    const writes: OptionDeletionWrite[] = [];
    for (const record of await this.properties.valuesForPropertyAll(definitionId)) {
      const value = deserializePropertyValue(record.valueJson, def.type);
      if (!value) continue;
      if (value.type === "select" || value.type === "status") {
        if (value.optionId === optionId) writes.push({ noteId: record.noteId, valueJson: null });
      } else if (value.type === "multiSelect" && value.optionIds.includes(optionId)) {
        const next = value.optionIds.filter((id) => id !== optionId);
        writes.push({
          noteId: record.noteId,
          valueJson:
            next.length === 0
              ? null
              : serializePropertyValue({ type: "multiSelect", optionIds: next }),
        });
      }
    }
    // Idempotent retry: if a previous deleteOption committed the definition
    // update but crashed mid-sweep, the option is gone yet values still
    // reference it — finish the sweep instead of throwing NotFound.
    if (!hasOption && writes.length === 0) throw new NotFoundError("Option", optionId);
    // One transaction: either the option disappears together with every
    // value referencing it, or neither happens.
    await this.properties.applyOptionDeletion(
      definitionId,
      hasOption ? JSON.stringify(def.options.filter((o) => o.id !== optionId)) : null,
      writes,
    );
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

  async valuesForDefinitionAllNotes(propertyId: string): Promise<Map<string, PropertyValue>> {
    const def = (await this.properties.listDefinitions()).find((d) => d.id === propertyId);
    if (!def) throw new NotFoundError("Property", propertyId);
    const values = new Map<string, PropertyValue>();
    for (const record of await this.properties.valuesForPropertyAll(propertyId)) {
      const value = deserializePropertyValue(record.valueJson, def.type);
      if (value) values.set(record.noteId, value);
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
