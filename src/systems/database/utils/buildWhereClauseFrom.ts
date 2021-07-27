export default function buildWhereClauseFrom<T>(whereClause: Array<Partial<T> | "OR" | "AND" | "NOT">): {
  data: Partial<T>;
  whereString: string;
} {
  let whereString = "";
  const data: Partial<T> = {};
  for (const field of whereClause) {
    if (typeof field === "string") whereString += `${field} `;
    else {
      const propName = Object.getOwnPropertyNames(field)[0];
      if (data.hasOwnProperty(propName)) {
        const index = JSON.stringify(data).match(propName).length;
        const modifiedPropName = `${propName}_${index}`;
        const tempObj = {};
        tempObj[modifiedPropName] = Object.values(field)[0];
        Object.assign(data, tempObj);
        whereString += `${propName} = :${modifiedPropName}`;
      } else {
        Object.assign(data, field);
        whereString += `${propName} = :${propName} `;
      }
    }
  }
  return { data, whereString };
}
