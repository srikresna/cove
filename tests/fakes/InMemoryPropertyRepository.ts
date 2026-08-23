import type { PropertyDefinition, PropertyOption } from "@/domain/property/Property";
import type {
  IPropertyRepository,
  NotePropertyRecord,
  OptionDeletionWrite,
  PropertyDefinitionPatch,
} from "@/repositories/IPropertyRepository";

export class InMemoryPropertyRepository implements IPropertyRepository {
  public definitions: PropertyDefinition[] = [];
  public values: NotePropertyRecord[] = [];

  async listDefinitions(): Promise<PropertyDefinition[]> {
    return this.definitions
      .map((d) => ({ ...d, options: [...d.options] }))
      .sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
  }

  async createDefinition(def: PropertyDefinition): Promise<void> {
    this.definitions.push({ ...def, options: [...def.options] });
  }

  async updateDefinition(id: string, patch: PropertyDefinitionPatch): Promise<void> {
    const { orderIndex, ...rest } = patch;
    const domainPatch = orderIndex !== undefined ? { ...rest, order: orderIndex } : rest;
    this.definitions = this.definitions.map((d) => (d.id === id ? { ...d, ...domainPatch } : d));
  }

  async updateOptions(id: string, optionsJson: string): Promise<void> {
    const options = JSON.parse(optionsJson) as PropertyOption[];
    this.definitions = this.definitions.map((d) => (d.id === id ? { ...d, options } : d));
  }

  async appendOption(id: string, optionJson: string): Promise<void> {
    const option = JSON.parse(optionJson) as PropertyOption;
    this.definitions = this.definitions.map((d) =>
      d.id === id ? { ...d, options: [...d.options, option] } : d,
    );
  }

  async deleteDefinition(id: string): Promise<void> {
    this.definitions = this.definitions.filter((d) => d.id !== id);
    this.values = this.values.filter((v) => v.propertyId !== id);
  }

  async applyOptionDeletion(
    definitionId: string,
    optionsJson: string | null,
    writes: OptionDeletionWrite[],
  ): Promise<void> {
    if (optionsJson !== null) await this.updateOptions(definitionId, optionsJson);
    for (const write of writes) {
      if (write.valueJson === null) {
        await this.removeValue(write.noteId, definitionId);
      } else {
        await this.setValue(write.noteId, definitionId, write.valueJson);
      }
    }
  }

  async valuesForNote(noteId: string): Promise<NotePropertyRecord[]> {
    return this.values.filter((v) => v.noteId === noteId).map((v) => ({ ...v }));
  }

  async valuesForPropertyAll(propertyId: string): Promise<NotePropertyRecord[]> {
    return this.values.filter((v) => v.propertyId === propertyId).map((v) => ({ ...v }));
  }

  async setValue(noteId: string, propertyId: string, valueJson: string): Promise<void> {
    const existing = this.values.find((v) => v.noteId === noteId && v.propertyId === propertyId);
    if (existing) {
      existing.valueJson = valueJson;
    } else {
      this.values.push({ noteId, propertyId, valueJson });
    }
  }

  async removeValue(noteId: string, propertyId: string): Promise<void> {
    this.values = this.values.filter((v) => !(v.noteId === noteId && v.propertyId === propertyId));
  }
}
