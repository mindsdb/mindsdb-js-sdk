type JsonPrimitive = string | number | boolean;
type JsonValue = JsonPrimitive | { [x: string]: JsonValue } | Array<JsonValue>;

export { JsonValue, JsonPrimitive };
