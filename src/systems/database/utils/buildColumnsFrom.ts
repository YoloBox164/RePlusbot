import { ModelColumns } from "../basemodel";

export default function buildColumnsFrom<T>(columns: ModelColumns<T>): string[] {
  const tableArrString: string[] = [];
  const foreignReferences: string[] = [];
  for (const name in columns) {
    if (columns.hasOwnProperty(name)) {
      const { type, allowNull, defaultValue, primaryKey, autoIncrement, unique, references } = columns[name];
      let string = `${name} ${type}`;
      if (primaryKey) string += " PRIMARY KEY";
      if (autoIncrement) string += " AUTO_INCREMENT";
      if (unique) string += " UNIQUE";
      if (!allowNull) string += " NOT NULL";
      if (defaultValue !== undefined && defaultValue !== null) string += ` DEFAULT ${defaultValue}`;
      if (references) {
        const { foreignKey, table } = references;
        foreignReferences.push(`FOREIGN KEY (${name}) REFERENCES ${table}(${foreignKey})`);
      }
      tableArrString.push(string);
    }
  }

  for (let i = 0; i < foreignReferences.length; i++) {
    tableArrString.push(...foreignReferences);
  }

  return tableArrString;
}
